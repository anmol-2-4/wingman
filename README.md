# 🎲 Wingman — Where's My Context?

Your AI woke up in Vegas with no memory of last night. **Wingman** rebuilds it.

Feed it scattered fragments — texts, receipts, blurry photo captions, half-remembered
names — and it uses [Cognee](https://www.cognee.ai)'s hybrid graph + vector memory to
reconstruct what happened, then answers your questions: *"What happened last night?
Who's Sarah? Where's my jacket?"*

Built for the [WeMakeDevs × Cognee hackathon](https://www.wemakedevs.org/hackathons/cognee)
(Jun 29 – Jul 5, 2026), **Best Use of Open Source** track. Runs **100% local, $0** —
self-hosted Cognee + Ollama, no OpenAI key required.

## Cognee's memory lifecycle → Wingman features
| Verb | In Wingman |
|------|-----------|
| `remember()` | Drop a fragment → added to the memory graph |
| `recall()`   | Interrogate the night |
| `improve()`  | "Connect the dots" → cross-link fragments for relational answers |
| `forget()`   | "Erase the night" |

All four go through `backend/memory.py`, so the backend is swappable.

## Quickstart (local, no OpenAI)
```bash
# 1. Local models via Ollama
ollama serve                 # keep running in its own terminal
ollama pull llama3.1:8b
ollama pull nomic-embed-text

# 2. Python env + deps
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. Config
cp .env.example .env

# 4. Day-1 gate — prove the local loop before anything else
python prove_loop.py

# 5. Run the app
uvicorn backend.main:app --reload      # http://localhost:8000
```

## Gotchas
- **Both** LLM *and* embeddings must be local, or Cognee silently bills OpenAI for embeddings.
- LLM endpoint ends `/v1`; embedding endpoint ends `/api/embed`. They differ.
- HTTP 500 on `remember`? Bump Ollama's `num_ctx` via a custom Modelfile.


## Roadmap (7-day)
- **D1** Prove local `forget→remember→recall` loop ✅ scaffolded
- **D2** Ingestion polish + fragment metadata
- **D3** Recall + chat UI ✅ scaffolded
- **D4** `improve()` cross-linking (the wow moment / relational queries)
- **D5** Vegas-narrative UI polish + seed demo data
- **D6** `forget()` privacy feature + rigorous testing against the real graph
- **D7** Demo video + blog + submit
