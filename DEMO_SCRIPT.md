# Wingman — Demo Video Script (target 2:30–3:00)

**Goal:** show deep, genuine use of open-source Cognee + the cross-session memory theme, in a way that's memorable. Record at 1080p; keep it tight.

## Before you hit record (prep)
- `ollama serve` running; pre-warm: `ollama run qwen2.5:3b "ok"` (avoids cold-start pauses on camera).
- Start server: `uvicorn backend.main:app` → open `http://localhost:8000`.
- Local LLM on CPU is slow (~60–90s/query). **Record in segments and cut the wait**, OR speed up 4–8x in editing. Never show a 90s frozen screen.
- Have the fragment list ready to paste. Have the graph tab ready.

## Shot list

### 0:00–0:15 — Hook
- On screen: the Wingman header (Vegas vibe).
- **VO:** "Every LLM call is stateless — it forgets the last session and overflows its context window. That's the whole problem. Wingman fixes it with persistent memory. The demo: your AI woke up in Vegas with no memory of last night, and it rebuilds the context from scattered fragments — using Cognee's open-source graph-vector memory, 100% local, zero API keys."

### 0:15–0:45 — Drop the fragments
- Click **Load demo night** → fragments stream into the log.
- **VO:** "I feed it the wreckage of the night — a bar, a receipt, a blurry photo caption, a 2am text. Messy, contradictory, human."

### 0:45–1:15 — Remember (the Cognee core)
- Click **Remember the night**. (Cut the wait.)
- **VO:** "One call to Cognee's `remember()` turns these into a knowledge graph — entities, relationships, the works. This is `add` + `cognify` under the hood: the hybrid graph-vector memory doing the heavy lifting, not a plain LLM."

### 1:15–1:45 — See the memory (the wow shot)
- Click **View memory graph** → the interactive node graph opens. Slowly pan/zoom.
- **VO:** "This is the actual memory Cognee built — me, Sarah, the Bellagio, the cab, all connected. 40-plus nodes from six fragments."

### 1:45–2:15 — Interrogate + cross-session (THE HERO BEAT — this is the point)
- Ask: **"What happened last night?"** → show the reconstructed narrative.
- Then add a NEW fragment: *"I left my jacket in the taxi, not the pool"* → **Remember** → ask **"Where's my jacket?"** → answer updates to the taxi.
- **VO:** "I interrogate the memory — answers come straight from the graph. And this is the point: Cognee memory is persistent and additive. I add a new fact, it updates what it knows, and it's still there next session — even after a restart. Stateless AI, solved. Context that survives, across infinite sessions."

### 2:15–2:40 — Contradiction detection (the differentiator)
- Click **Spot contradictions** → show `CONFLICT: jacket at the pool || jacket in the taxi`.
- **VO:** "And it reasons over its own memory to flag conflicts — the pool story versus the taxi story. Cognee catches what I misremembered."

### 2:40–3:00 — Close
- Cut to: the repo / "Best Use of Open Source Cognee".
- **VO:** "Wingman. Persistent memory for AI, fully open source, fully local. Built on Cognee."

## Lines to hit for judges (say the words)
- "Cognee's `remember` / `recall` / `improve` / `forget`" (name the lifecycle).
- "open-source, self-hosted, 100% local, no API keys."
- "persistent, cross-session memory."
