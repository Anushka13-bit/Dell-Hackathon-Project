"""Thin OpenAI JSON wrapper shared by pipelines."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import Any, Optional

from groq import AsyncGroq
import groq

logger = logging.getLogger(__name__)

OPENAI_MODEL = "llama-3.1-8b-instant"

_MAX_RETRIES = 2
_INITIAL_BACKOFF_SECONDS = 1.0


class LLMCallError(Exception):
    def __init__(self, message: str, raw_response: Optional[str] = None) -> None:
        super().__init__(message)
        self.raw_response = raw_response


def _api_key() -> str:
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        pass
    
    key = os.environ.get("GROQ_API_KEY")
    if not key:
        raise EnvironmentError("GROQ_API_KEY is not set.")
    return key


def _strip_fences(text: str) -> str:
    stripped = text.strip()
    match = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", stripped, re.DOTALL | re.IGNORECASE)
    return match.group(1).strip() if match else stripped


def _parse_json(raw_text: str) -> dict:
    try:
        parsed = json.loads(_strip_fences(raw_text))
    except json.JSONDecodeError as exc:
        raise LLMCallError(f"Invalid JSON: {exc}", raw_response=raw_text) from exc
    if not isinstance(parsed, dict):
        raise LLMCallError("Response was not a JSON object.", raw_response=raw_text)
    return parsed


def _transient(exc: Exception) -> bool:
    if isinstance(exc, (groq.RateLimitError, groq.APIConnectionError, groq.InternalServerError)):
        return True
    return False

async def call_json_async(prompt: str) -> dict:
    """Call Groq asynchronously, parse JSON, retry transient errors twice."""
    client = AsyncGroq(api_key=_api_key())
    last_error: Optional[Exception] = None

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = await client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            text = response.choices[0].message.content
            if not text:
                raise LLMCallError("Empty response.")
            return _parse_json(text)
        except LLMCallError:
            raise
        except Exception as exc:
            last_error = exc
            if attempt < _MAX_RETRIES and _transient(exc):
                backoff = _INITIAL_BACKOFF_SECONDS * (2**attempt)
                logger.warning("Groq transient error, retry in %.1fs: %s", backoff, exc)
                await asyncio.sleep(backoff)
                continue
            raise LLMCallError(f"Groq call failed: {exc}", raw_response=str(exc)) from exc

    raise LLMCallError(f"Groq call failed after retries: {last_error}", raw_response=str(last_error))


def call_json(prompt: str) -> dict:
    """Sync wrapper for low-volume callers."""
    return asyncio.run(call_json_async(prompt))
