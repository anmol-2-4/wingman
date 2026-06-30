import cognee


def _entry_text(entry):
    for field in ("answer", "content", "text"):
        val = getattr(entry, field, None)
        if val:
            return str(val)
    return str(entry)


async def remember(text):
    return await cognee.remember(text)


async def recall(query):
    results = await cognee.recall(query_text=query)
    return [_entry_text(r) for r in results]


async def improve():
    return await cognee.improve()


async def forget():
    return await cognee.forget(everything=True)
