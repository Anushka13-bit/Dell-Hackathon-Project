"""Thin JSON wrapper shared by pipelines."""

from __future__ import annotations

import asyncio
import json
import logging
import re
import os
from typing import Any, Optional
from groq import AsyncGroq

logger = logging.getLogger(__name__)

# Using a high-performance Groq model suitable for JSON parsing
GROQ_MODEL = "llama-3.3-70b-versatile"

_MAX_RETRIES = 3
_INITIAL_BACKOFF_SECONDS = 2.0


class LLMCallError(Exception):
    def __init__(self, message: str, raw_response: Optional[str] = None) -> None:
        super().__init__(message)
        self.raw_response = raw_response


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
    err_str = str(exc).lower()
    if "rate" in err_str or "quota" in err_str or "500" in err_str or "503" in err_str or "timeout" in err_str or "connect" in err_str:
        return True
    return False

async def call_json_async(prompt: str) -> dict:
    """Call Groq asynchronously, parse JSON, retry transient errors."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise LLMCallError("GROQ_API_KEY environment variable is missing")

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = await client.chat.completions.create(
                model=GROQ_MODEL,
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
                logger.warning("Transient error, retry in %.1fs: %s", backoff, exc)
                await asyncio.sleep(backoff)
                continue
            raise LLMCallError(f"LLM call failed: {exc}", raw_response=str(exc)) from exc

    raise LLMCallError(f"LLM call failed after retries: {last_error}", raw_response=str(last_error))


def call_json(prompt: str) -> dict:
    """Sync wrapper for low-volume callers."""
    return asyncio.run(call_json_async(prompt))
