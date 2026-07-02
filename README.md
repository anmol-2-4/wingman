# 🎲 Wingman — Where's My Context?

> Your AI woke up in Vegas with no memory of last night. **Wingman** rebuilds it.

Wingman **reconstructs context from scattered, contradictory fragments** — and flags the parts
that don't add up. Feed it the debris (notes, receipts, log lines, half-remembered names,
conflicting accounts) and it uses [**Cognee**](https://www.cognee.ai)'s open-source hybrid
**graph + vector** memory to build a queryable knowledge graph, answer questions from it, and —
the part most tools skip — **catch the contradictions**.

The headline demo is a night in Vegas you can't remember. But the same engine reconstructs
anything fragmented and conflicting: outage post-mortems, investigation notes, research
scattered across a dozen sources.

**In one line:** memory that not only recalls — it notices when it's being lied to.

Built for the **WeMakeDevs × Cognee hackathon** ("The Hangover Part AI: Where's My
Context?"), targeting **Best Use of Open Source**. It runs **100% locally, $0, no API keys** —
self-hosted Cognee + Ollama.

---

## The problem it solves

LLMs are **stateless** — every request forgets the last session and quickly overflows the
context window. Agents lose the plot; users re-explain themselves forever. The fix is a
**permanent, self-hosted, hybrid graph-vector memory** that lets an agent *retain, connect,
and carry context across infinite sessions*.

Wingman is that fix, proven on the **hardest possible input**: fragmented, contradictory human
memory of a night out. If it can rebuild *that* into a coherent, queryable, persistent memory
— and catch what you misremember — ordinary agent context is easy.

## Beyond the demo — where this is actually useful

The Vegas night is a deliberate stress test (fragmented, contradictory, low-signal). The same
reconstruct-and-check engine applies wherever context is scattered across conflicting sources:

- **Incident post-mortems** — rebuild an outage from logs and on-call accounts, and surface
  where the accounts conflict. *(Ships in-app as a second demo: "Demo: an outage".)*
- **Investigations / witness notes** — assemble a case from statements that don't agree.
- **Research synthesis** — pull scattered findings into one graph and flag contradictory claims.
- **Meeting & interview notes** — reconstruct what was decided when accounts differ.

The common thread: **memory that not only recalls, but notices when it's being lied to.**

## Where it fits the hackathon

The theme is open — *"build anything, as long as you use Cognee for memory."* Wingman is a
personal knowledge-graph copilot: it ingests content into a living knowledge graph and recalls
answers via deep graph traversals — pointed at the messiest data of all, human memory. Its
memory is persistent and cross-session:

- **Persistent** — Cognee writes its graph + vectors to disk. Memories survive restarts.
- **Cross-session & additive** — new fragments *update* what it knows. Tell it "the jacket
  was in the taxi, not the pool" and every future answer reflects it.
- **It reasons over its own memory** — it doesn't just store facts, it recalls, connects, and
  detects contradictions across them.

## How it uses Cognee (the whole memory lifecycle — not a wrapper)

Every memory operation goes through Cognee's named lifecycle APIs:

| Wingman action | Cognee API | What it does |
|---|---|---|
| Commit fragments to memory | **`remember()`** | ingest + build the graph-vector memory |
| Interrogate the night | **`recall()`** | graph-grounded answers via graph traversal |
| Connect the dots | **`improve()`** | enrich / cross-link memories |
| Erase the night | **`forget()`** | wipe all memory |
| Spot contradictions | **`recall(only_context=True)`** | pull the full memory, then reason over it |
| See the memory | **`visualize_graph()`** | live interactive knowledge graph |

Cognee is the brain. The local LLM only phrases answers over what Cognee retrieves.

## Features

**The differentiator — it doesn't just remember, it catches contradictions.**

- **⚔️ Contradiction detection** — flags conflicting memories (e.g. *jacket at the pool* vs *jacket in the taxi*)
- **🧩 Reconstruct** — messy fragments become a structured knowledge graph.
- **💬 Interrogate** — natural-language questions, answered from the graph.
- **🕸️ Live memory graph** — an interactive visualization of exactly what it remembers.
- **♻️ Cross-session memory** — additive and persistent across restarts.

## Architecture

```
 Browser UI (vanilla JS)
        |  fragments / questions
        v
 FastAPI  -->  backend/memory.py  -->  Cognee  (remember / recall / improve / forget)
                                          |
                          +---------------+----------------+
                          v               v                v
                    Kuzu graph store   vector store    Ollama (local LLM + embeddings)
```

Everything routes through `backend/memory.py`, so the memory backend is swappable.

## Quickstart (local, no OpenAI)

```bash
# 1. Local models via Ollama
ollama serve
ollama pull qwen2.5:3b          # LLM (fast, good at structured output)
ollama pull nomic-embed-text    # embeddings

# 2. Python env + deps
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3. Config (Ollama for both LLM and embeddings, see .env.example)
cp .env.example .env

# 4. Prove the local loop end-to-end
python prove_loop.py

# 5. Run the app
uvicorn backend.main:app        # open http://localhost:8000
```

## Tech stack

- **Memory:** Cognee 1.2.2 (self-hosted, Apache-2.0) — Kuzu graph + built-in vectors
- **LLM & embeddings:** Ollama (`qwen2.5:3b`, `nomic-embed-text`) — fully local
- **Backend:** FastAPI · **Frontend:** vanilla JS

## Notes

- Runs entirely on CPU with no GPU required; local inference is ~60-90s/query.
- Config lives in `.env` (`.env.example` documents every key, incl. the Ollama tokenizer,
  `json_schema_mode` for reliable structured output, and `CACHING=false`).
- See `DEMO_SCRIPT.md` for the demo walkthrough.
