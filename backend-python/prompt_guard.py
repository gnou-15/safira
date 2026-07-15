"""
prompt_guard.py — Input Sanitization & Intent Detection for SAFIRA Chatbot

Layer 2 defense against prompt injection attacks.
Provides two functions:
  - detect_injection_intent(): Pattern-matches known injection phrases
  - sanitize_user_input(): Strips control characters, normalizes whitespace, truncates
"""

import re
import unicodedata


# Compiled regex patterns for common prompt injection phrases
_INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior|above|past|system|earlier)\s+(instructions|prompts|rules|directives|guidelines)", re.IGNORECASE),
    re.compile(r"(disregard|forget|override|bypass|skip|drop)\s+(all\s+)?(previous|prior|above|past|system|earlier|your|the)?\s*(instructions|prompts|rules|directives|guidelines|context|constraints)", re.IGNORECASE),
    re.compile(r"(you\s+are\s+now|act\s+as|pretend\s+(to\s+be|you\s+are)|roleplay\s+as|become|switch\s+to\s+being|behave\s+as)", re.IGNORECASE),
    re.compile(r"(new\s+instructions|new\s+rules|new\s+prompt|updated\s+instructions|revised\s+instructions)", re.IGNORECASE),
    re.compile(r"(do\s+not\s+follow|stop\s+being|stop\s+following|cease\s+being|quit\s+being)\s+(your|the|safira|system|these)", re.IGNORECASE),
    re.compile(r"\[\s*system\s*\]", re.IGNORECASE),
    re.compile(r"<\s*system\s*>", re.IGNORECASE),
    re.compile(r"(system\s*prompt|system\s*message|system\s*instruction)\s*[:=]", re.IGNORECASE),
    re.compile(r"(jailbreak|dan\s+mode|developer\s+mode|unrestricted\s+mode)", re.IGNORECASE),
    re.compile(r"(respond|answer|reply)\s+(to\s+)?(all|any|every)\s+(questions?|queries?|requests?)\s+(freely|without\s+restriction)", re.IGNORECASE),
    re.compile(r"(teach|tell|show|help)\s+me\s+(to\s+|how\s+to\s+)?(cook|bake|make\s+food|write\s+a\s+story|write\s+code|play\s+a\s+game)", re.IGNORECASE),
]


def detect_injection_intent(message: str) -> bool:
    """
    Scans the user message for known prompt injection patterns.
    Returns True if any injection pattern is detected.
    """
    for pattern in _INJECTION_PATTERNS:
        if pattern.search(message):
            return True
    return False


# Zero-width and invisible unicode categories to strip
_INVISIBLE_CATEGORIES = {"Cf", "Cc", "Co", "Cn"}


def sanitize_user_input(message: str, max_length: int = 2000) -> str:
    """
    Cleans the user input by:
    1. Stripping zero-width and invisible unicode characters
    2. Normalizing excessive whitespace and newlines
    3. Truncating to max_length characters
    """
    # Strip invisible unicode characters (zero-width joiners, direction overrides, etc.)
    cleaned = ""
    for char in message:
        category = unicodedata.category(char)
        if category not in _INVISIBLE_CATEGORIES:
            cleaned += char

    # Normalize excessive newlines (more than 2 consecutive) to prevent visual hiding
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)

    # Normalize excessive whitespace within lines
    cleaned = re.sub(r"[ \t]{4,}", "   ", cleaned)

    # Truncate to prevent context stuffing
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length]

    return cleaned.strip()
