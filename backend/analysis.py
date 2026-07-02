import re

from pydantic import BaseModel

import cognee
from cognee.modules.search.types.SearchType import SearchType
from cognee.infrastructure.llm.structured_output_framework.litellm_instructor.llm.get_llm_client import (
    get_llm_client,
)


class Conflict(BaseModel):
    fact_a: str
    fact_b: str


class ConflictReport(BaseModel):
    conflicts: list[Conflict]


_SYSTEM = (
    "You are a memory-conflict detector reviewing recovered fragments of an event. "
    "From the facts, find pairs that describe the SAME thing in INCOMPATIBLE "
    "ways (e.g. the same object in two different places, or one event at two different "
    "times). Report each distinct contradiction only ONCE. Only report genuine "
    "contradictions; return an empty list if there are none."
)

_STOP = {
    "the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "was", "is", "are",
    "my", "your", "his", "her", "she", "he", "they", "it", "that", "this", "for",
    "said", "says", "not", "with", "narrator", "narrators", "pretty", "sure", "now",
    "conflict",
}


def _sig(text):
    words = re.findall(r"[a-z0-9]+", text.lower())
    return {w for w in words if len(w) > 2 and w not in _STOP}


def _dedupe(conflicts):
    kept, sigs = [], []
    for c in conflicts:
        s = _sig(c)
        if any(s and k and len(s & k) / min(len(s), len(k)) >= 0.6 for k in sigs):
            continue
        kept.append(c)
        sigs.append(s)
    return kept


async def _remembered_evidence():
    """Pull the stored fragments verbatim via chunk-level recall, so every
    remembered statement is on the table for the conflict scan."""
    results = await cognee.recall(
        query_text="all remembered evidence",
        query_type=SearchType.CHUNKS,
        top_k=50,
    )
    texts = []
    for r in results:
        t = r.get("text") if isinstance(r, dict) else getattr(r, "text", None)
        if t:
            texts.append(str(t))
    return "\n".join(texts)


async def find_contradictions():
    evidence = await _remembered_evidence()
    if not evidence.strip():
        return ["No contradictions found."]
    client = get_llm_client()
    report = await client.acreate_structured_output(
        text_input=evidence,
        system_prompt=_SYSTEM,
        response_model=ConflictReport,
    )
    conflicts = _dedupe([f"CONFLICT: {c.fact_a} || {c.fact_b}" for c in report.conflicts])
    return conflicts or ["No contradictions found."]
