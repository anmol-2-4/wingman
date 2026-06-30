from pathlib import Path

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from backend import memory

FRONTEND = Path(__file__).resolve().parent.parent / "frontend"
app = FastAPI(title="Wingman")


class Fragment(BaseModel):
    text: str


class Query(BaseModel):
    text: str


@app.post("/api/remember")
async def remember(frag: Fragment):
    await memory.remember(frag.text)
    return {"ok": True, "stored": frag.text}


@app.post("/api/recall")
async def recall(q: Query):
    answers = await memory.recall(q.text)
    return {"query": q.text, "answers": answers}


@app.post("/api/improve")
async def improve():
    await memory.improve()
    return {"ok": True}


@app.post("/api/forget")
async def forget():
    await memory.forget()
    return {"ok": True}


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/")
async def index():
    return FileResponse(FRONTEND / "index.html")
