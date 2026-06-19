"""Thin Gemini JSON wrapper shared by pipelines."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import re
from typing import Any, Optional

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

GEMINI_MODEL = "gemini-2.5-flash"

_MAX_RETRIES = 5
_INITIAL_BACKOFF_SECONDS = 2.0


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
    
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise EnvironmentError("GEMINI_API_KEY is not set.")
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
    err_str = str(exc).lower()
    if "rate" in err_str or "quota" in err_str or "500" in err_str or "503" in err_str:
        return True
    return False

async def call_json_async(prompt: str) -> dict:
    """Call Gemini asynchronously, parse JSON, retry transient errors twice."""
    client = genai.Client(api_key=_api_key())
    last_error: Optional[Exception] = None

    for attempt in range(_MAX_RETRIES + 1):
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
            text = response.text
            if not text:
                raise LLMCallError("Empty response.")
            return _parse_json(text)
        except LLMCallError:
            raise
        except Exception as exc:
            last_error = exc
            if attempt < _MAX_RETRIES and _transient(exc):
                backoff = _INITIAL_BACKOFF_SECONDS * (2**attempt)
                logger.warning("Gemini transient error, retry in %.1fs: %s", backoff, exc)
                await asyncio.sleep(backoff)
                continue
            raise LLMCallError(f"Gemini call failed: {exc}", raw_response=str(exc)) from exc

    raise LLMCallError(f"Gemini call failed after retries: {last_error}", raw_response=str(last_error))


def call_json(prompt: str) -> dict:
    """Sync wrapper for low-volume callers."""
    return asyncio.run(call_json_async(prompt))
