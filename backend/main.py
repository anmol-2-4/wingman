from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend import analysis, memory

ROOT = Path(__file__).resolve().parent.parent
FRONTEND = ROOT / "frontend"
GRAPH_FILE = ROOT / "data" / "graph.html"
MARKER = ROOT / "data" / ".memory"   # reliable "memory exists" flag (cold-safe)
app = FastAPI(title="Wingman")

_staged: list[str] = []


class Fragment(BaseModel):
    text: str


class Query(BaseModel):
    text: str


@app.get("/api/status")
async def status():
    return {"has_memory": MARKER.exists()}


@app.post("/api/fragment")
async def fragment(frag: Fragment):
    _staged.append(frag.text)
    return {"ok": True, "staged": len(_staged)}


@app.post("/api/reconstruct")
async def reconstruct():
    if _staged:
        await memory.remember(list(_staged))
        _staged.clear()
        MARKER.write_text("1")
    return {"ok": True, **await memory.graph_stats()}


@app.post("/api/recall")
async def recall(q: Query):
    return {"answers": await memory.recall(q.text)}


@app.post("/api/contradictions")
async def contradictions():
    return {"conflicts": await analysis.find_contradictions()}


@app.post("/api/improve")
async def improve():
    await memory.improve()
    return await memory.graph_stats()


@app.post("/api/forget")
async def forget():
    _staged.clear()
    await memory.forget()
    MARKER.unlink(missing_ok=True)
    return {"ok": True}


@app.get("/api/graph")
async def graph():
    await memory.graph_html(str(GRAPH_FILE))
    return FileResponse(GRAPH_FILE)


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/")
async def index():
    return FileResponse(FRONTEND / "index.html")
