# Wingman — submission copy (paste into the form)

**Track:** Best Use of Open Source
**Repo:** https://github.com/anmol-2-4/wingman
**Demo video:** [ADD LINK]

---

## Tagline (one line)
Wingman — "Where's My Context?": persistent, self-hosted memory that ends AI amnesia.

## Short description (2–3 sentences)
Wingman turns scattered, contradictory fragments into a persistent, queryable knowledge
graph using Cognee's open-source hybrid graph-vector memory — running 100% locally, no API
keys. It's the "where's my context?" problem made tangible: you wake up in Vegas with no
memory of last night, and Wingman reconstructs it — then even flags what you misremember.

## The problem
LLMs are stateless: every request forgets the last session and overflows the context window.
Agents lose the plot; users re-explain themselves forever. The fix is a permanent, self-hosted,
hybrid graph-vector memory that lets an agent retain, connect, and carry context across
infinite sessions.

## What it does
Drop in the wreckage of a night — a bar, a receipt, a blurry photo caption, a 2am text.
Wingman uses Cognee to build a knowledge graph from it, then lets you:
- **Interrogate** it in natural language ("What happened last night? Where's my jacket?")
- **Visualize** the reconstructed memory as a live interactive graph
- **Detect contradictions** across memories (e.g. "jacket at the pool" vs "jacket in the taxi")
- **Remember across sessions** — memory is persistent and additive; new facts update what it
  knows and survive restarts.

## How it uses Cognee (the memory lifecycle, deeply)
Every memory operation runs through Cognee's named APIs — Cognee is the brain; the local LLM
only phrases answers over what Cognee retrieves:
- **`remember()`** — ingests fragments and builds the hybrid graph-vector memory
- **`recall()`** — graph-traversal answers grounded in the memory
- **`improve()`** — cross-links and enriches memories
- **`forget()`** — wipes memory
- **`recall(only_context=True)`** — powers Cognee-native contradiction detection
- **`visualize_graph()`** — the live memory graph

## Why "Best Use of Open Source"
100% self-hosted open-source Cognee (Kuzu graph + vector store) with open-source local models
via Ollama (`qwen2.5:3b` + `nomic-embed-text`). No cloud, no API keys, $0 — fully reproducible
from the README quickstart.

## Tech stack
Cognee 1.2.2 (self-hosted) · Ollama (`qwen2.5:3b`, `nomic-embed-text`) · FastAPI · vanilla JS.
