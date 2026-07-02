import os

import cognee
from cognee.modules.search.types.SearchType import SearchType
from cognee.infrastructure.databases.graph import get_graph_engine


def _text(entry):
    if isinstance(entry, dict):
        return entry.get("text") or entry.get("search_result") or str(entry)
    for field in ("text", "answer", "content"):
        value = getattr(entry, field, None)
        if value:
            return value if isinstance(value, str) else str(value)
    return str(entry)


async def remember(texts):
    return await cognee.remember(texts, self_improvement=False)


async def recall(query):
    results = await cognee.recall(query_text=query, query_type=SearchType.GRAPH_COMPLETION)
    return [_text(r) for r in results]


async def improve():
    return await cognee.improve()


async def forget():
    return await cognee.forget(everything=True)


async def graph_html(path):
    return await cognee.visualize_graph(destination_file_path=os.path.abspath(path))


async def graph_stats():
    engine = await get_graph_engine()
    await engine.get_graph_data()          # warmup: force lazy-loaded graph to connect
    nodes, edges = await engine.get_graph_data()
    return {"nodes": len(nodes), "edges": len(edges)}
