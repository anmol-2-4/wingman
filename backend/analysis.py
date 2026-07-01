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
    "You are a memory-conflict detector reviewing one person's recovered memories of a "
    "night out. From the facts, find pairs that describe the SAME thing in INCOMPATIBLE "
    "ways (e.g. the same object in two different places, or one event at two different "
    "times). Only report genuine contradictions; return an empty list if there are none."
)


async def _memory_context():
    results = await cognee.recall(
        query_text="Everything known about the night, including where the jacket was left.",
        query_type=SearchType.GRAPH_COMPLETION,
        only_context=True,
    )
    parts = []
    for r in results:
        d = r.get("search_result") if isinstance(r, dict) else getattr(r, "search_result", getattr(r, "text", r))
        if isinstance(d, (list, tuple)):
            parts.extend(str(x) for x in d)
        else:
            parts.append(str(d))
    return "\n".join(parts)


async def find_contradictions():
    context = await _memory_context()
    client = get_llm_client()
    report = await client.acreate_structured_output(
        text_input=context,
        system_prompt=_SYSTEM,
        response_model=ConflictReport,
    )
    conflicts = [f"CONFLICT: {c.fact_a} || {c.fact_b}" for c in report.conflicts]
    return conflicts or ["No contradictions found."]
