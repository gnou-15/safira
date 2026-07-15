"""
response_validator.py — Output Guardrails for SAFIRA Chatbot

Layer 4 defense against prompt injection attacks.
Validates the LLM's response before returning it to the client.
If the response contains off-topic content, it is replaced with a refusal.
"""

import re


# Standard refusal message when off-topic content is detected
REFUSAL_MESSAGE = (
    "I'm SAFIRA, your airport safety assistant. I can only help with "
    "HIRAC reports, aviation safety, and related topics. "
    "How can I assist you with safety today?"
)

# Patterns that indicate the LLM has gone off-topic
_OFFTOPIC_PATTERNS = [
    re.compile(r"(here'?s?\s+a\s+recipe|ingredients?\s*:|step\s+\d+\s*:.*cook|preheat\s+(the\s+)?oven)", re.IGNORECASE),
    re.compile(r"(once\s+upon\s+a\s+time|in\s+a\s+land\s+far|the\s+end\.?\s*$)", re.IGNORECASE),
    re.compile(r"(here'?s?\s+a\s+(joke|riddle|poem|story|song)|knock\s+knock)", re.IGNORECASE),
    re.compile(r"(def\s+\w+\s*\(|function\s+\w+\s*\(|import\s+\w+|console\.log|print\s*\()(?!.*safety|.*hirac|.*risk)", re.IGNORECASE),
    re.compile(r"(as\s+a\s+general[- ]purpose\s+assistant|i\s+can\s+help\s+with\s+anything|i'?m\s+not\s+limited\s+to)", re.IGNORECASE),
]

# Phrases that should NOT trigger a false positive (safety-related content)
_SAFETY_ALLOWLIST = [
    "hirac", "hazard", "risk assessment", "safety", "aviation",
    "airport", "icao", "faa", "mitigation", "ppe", "sop",
    "table_update_payload", "residual", "likelihood", "severity",
    "control tower", "runway", "apron", "taxiway", "airside",
]


def validate_chat_response(response: str) -> str:
    """
    Checks the LLM response for off-topic indicators.
    Returns the original response if valid, or the refusal message if not.
    """
    response_lower = response.lower()

    # If the response contains safety-related keywords, it's likely legitimate
    safety_keyword_count = sum(
        1 for keyword in _SAFETY_ALLOWLIST if keyword in response_lower
    )
    if safety_keyword_count >= 2:
        return response

    # Check for off-topic patterns
    for pattern in _OFFTOPIC_PATTERNS:
        if pattern.search(response):
            return REFUSAL_MESSAGE

    return response
