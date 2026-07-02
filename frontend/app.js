const $ = (id) => document.getElementById(id);
const setStatus = (msg) => { $("statusText").textContent = msg; };

const DEMO = [
  "Around 9pm I was at the Bellagio bar with someone named Sarah.",
  "Sarah said she works as a blackjack dealer and lost my jacket at the pool.",
  "Receipt for $240 from 'Neon Noodle' timestamped 1:14am.",
  "Blurry photo caption: 'me + Sarah + a guy in an Elvis costume'.",
  "Hotel keycard sleeve: room 1207, The Venetian.",
  "Text from an unknown number at 2:03am: 'you still owe me for the cab lol'.",
  "I'm now pretty sure I left my jacket in the back of the taxi, not at the pool.",
];

const DEMO_INCIDENT = [
  "02:14 — PagerDuty: checkout API 5xx error rate spiking.",
  "On-call (Priya): pretty sure the 2pm deploy of the payments service caused this.",
  "Migration log: 'add orders index' migration started at 01:45.",
  "Grafana: checkout error rate climbed sharply at 01:50, before the 2pm deploy.",
  "Rolling back the 2pm payments deploy at 02:40 did NOT clear the errors.",
  "Sam: agreed with Priya, it was the payments deploy.",
  "DB: the orders-index migration held a write lock on the orders table until 02:55; errors cleared at 02:56.",
];

const QUESTIONS_NIGHT = ["what happened last night?", "who is Sarah?", "where is my jacket?"];
const QUESTIONS_INCIDENT = ["what caused the outage?", "was it the 2pm deploy?", "build the timeline of the incident"];
let questions = QUESTIONS_NIGHT;

// detective patter for the long waits — rotated under the spinner
const PATTER = {
  reconstruct: [
    "interviewing each piece of evidence…",
    "pinning red string between the facts…",
    "checking alibis against the timestamps…",
    "developing the blurry photos…",
    "letting the memory graph settle…",
    "good detective work takes a minute. hold tight…",
  ],
  improve: [
    "re-reading every statement…",
    "drawing new connections in red ink…",
    "asking the graph what it missed the first time…",
  ],
  recall: [
    "flipping through the case file…",
    "following the red string…",
    "consulting the corkboard…",
  ],
  contra: [
    "comparing statements word for word…",
    "circling discrepancies in red…",
    "checking who changed their story…",
  ],
  graph: [
    "arranging the photos on the corkboard…",
    "untangling the string…",
  ],
};

const EMPTY_EV = '<p class="hint" id="emptyEv">No exhibits filed.</p>';
const HINT_DEFAULT = "Reconstruct the night, then question the memory below.";

const evidence = [];
let hasMemory = false;

function renderChips() {
  $("stamp").hidden = !hasMemory;
  const box = $("chips");
  box.innerHTML = "";
  if (!hasMemory) return;
  for (const q of questions) {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = q;
    b.onclick = () => { $("query").value = q; $("recallBtn").click(); };
    box.appendChild(b);
  }
}

async function post(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : "{}",
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

function busy(el, label, { center, lines } = {}) {
  const start = Date.now();
  el.innerHTML =
    `<div class="busy${center ? " center" : ""}">` +
    `<span class="spinner"></span>` +
    `<span class="busytext">${label} <span class="elapsed">0s</span></span>` +
    (lines && lines.length ? `<em class="busyline"></em>` : "") +
    `</div>`;
  const span = el.querySelector(".elapsed");
  const lineEl = el.querySelector(".busyline");
  let i = 0;
  const showLine = () => {
    lineEl.textContent = lines[i++ % lines.length];
    lineEl.style.animation = "none";
    void lineEl.offsetWidth; // restart the fade
    lineEl.style.animation = "";
  };
  if (lineEl) showLine();
  const id = setInterval(() => {
    const s = Math.round((Date.now() - start) / 1000);
    span.textContent = s + "s";
    if (lineEl && s > 0 && s % 7 === 0) showLine();
  }, 1000);
  return () => clearInterval(id);
}

const ROTS = ["-1.1deg", "0.9deg", "-0.5deg", "1.2deg"];

function addCard(text) {
  const empty = $("emptyEv");
  if (empty) empty.remove();
  evidence.push(text);
  const n = evidence.length;
  const card = document.createElement("div");
  card.className = "card";
  card.style.setProperty("--rot", ROTS[n % ROTS.length]);
  const tag = document.createElement("div");
  tag.className = "etag";
  tag.textContent = "EXHIBIT " + String(n).padStart(2, "0");
  const body = document.createElement("div");
  body.className = "ebody";
  body.textContent = text;
  card.append(tag, body);
  $("cards").appendChild(card);
  $("evCount").textContent = n;
}

function findings(items, cls, query) {
  const box = $("answers");
  box.innerHTML = "";
  if (query) {
    const q = document.createElement("div");
    q.className = "qlabel";
    q.textContent = "Q. " + query;
    box.appendChild(q);
  }
  if (!items || !items.length) {
    box.insertAdjacentHTML("beforeend", '<div class="center">— the memory draws a blank —</div>');
    return;
  }
  for (const a of items) {
    const div = document.createElement("div");
    div.className = cls;
    div.textContent = a;
    box.appendChild(div);
  }
}

// letterhead date stamp
(function stampDate() {
  const el = document.querySelector(".filedate");
  if (!el) return;
  const d = new Date();
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  el.textContent = `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
})();

// on load: is there already memory (persisted from a previous session)?
(async function init() {
  try {
    const s = await (await fetch("/api/status")).json();
    hasMemory = s.has_memory;
    if (hasMemory) { $("storyHint").textContent = "Memory on file. Ask it anything below."; renderChips(); }
  } catch (e) {}
})();

$("addBtn").onclick = async () => {
  const text = $("fragment").value.trim();
  if (!text) return;
  $("addBtn").disabled = true;
  try { await post("/api/fragment", { text }); addCard(text); $("fragment").value = ""; setStatus(`${evidence.length} exhibit${evidence.length === 1 ? "" : "s"} on file.`); }
  catch (e) { setStatus("error: " + e.message); }
  $("addBtn").disabled = false;
};

async function loadSet(list, btnId, qs) {
  questions = qs || QUESTIONS_NIGHT;
  const btn = $(btnId);
  btn.disabled = true;
  // scope to this case: wipe any prior memory + evidence so scenarios don't mix
  setStatus("Clearing the previous case…");
  try { await post("/api/forget"); } catch (e) {}
  evidence.length = 0;
  hasMemory = false;
  $("cards").innerHTML = EMPTY_EV;
  $("answers").innerHTML = "";
  $("evCount").textContent = "0";
  $("graphPanel").hidden = true;
  $("storyHint").textContent = HINT_DEFAULT;
  renderChips();
  for (const f of list) { try { await post("/api/fragment", { text: f }); addCard(f); } catch (e) {} }
  setStatus(`${evidence.length} exhibits filed — now hit Reconstruct.`);
  btn.disabled = false;
}
$("seedBtn").onclick = () => loadSet(DEMO, "seedBtn", QUESTIONS_NIGHT);
$("seedBtn2").onclick = () => loadSet(DEMO_INCIDENT, "seedBtn2", QUESTIONS_INCIDENT);

$("reconstructBtn").onclick = async () => {
  $("reconstructBtn").disabled = true;
  const stop = busy($("state"), "Reconstructing the night into memory…", { lines: PATTER.reconstruct });
  try {
    const d = await post("/api/reconstruct");
    hasMemory = true;
    renderChips();
    setStatus("Memory rebuilt. Question it, or open the corkboard.");
    $("storyHint").textContent = d.nodes
      ? `Memory on file — ${d.nodes} facts recovered. Ask it anything below.`
      : "Memory on file. Ask it anything below.";
  } catch (e) { setStatus("error: " + e.message); }
  finally { stop(); $("state").textContent = ""; $("reconstructBtn").disabled = false; }
};

$("enrichBtn").onclick = async () => {
  if (!hasMemory) { setStatus("Reconstruct first — nothing to connect yet."); return; }
  $("enrichBtn").disabled = true;
  const stop = busy($("state"), "Connecting the dots…", { lines: PATTER.improve });
  let msg = "Connections enriched.";
  try {
    const d = await post("/api/improve");
    msg = `Enrichment pass complete — memory holds ${d.edges} connections.`;
  } catch (e) { msg = "error: " + e.message; }
  finally { stop(); $("state").textContent = msg; $("enrichBtn").disabled = false; }
};

$("forgetBtn").onclick = async () => {
  if (!confirm("Burn the file? All memory is erased.")) return;
  try {
    await post("/api/forget");
    evidence.length = 0; hasMemory = false;
    $("cards").innerHTML = EMPTY_EV;
    $("answers").innerHTML = ""; $("evCount").textContent = "0";
    $("graphPanel").hidden = true;
    $("storyHint").textContent = HINT_DEFAULT;
    renderChips();
    setStatus("Case closed. The file is ash.");
  } catch (e) { setStatus("error: " + e.message); }
};

$("recallBtn").onclick = async () => {
  const text = $("query").value.trim();
  if (!text) return;
  if (!hasMemory) { findings(["No memory on file yet — file exhibits and hit Reconstruct first."], "finding", text); return; }
  $("recallBtn").disabled = true;
  const stop = busy($("answers"), "Searching the memory…", { center: true, lines: PATTER.recall });
  try { const d = await post("/api/recall", { text }); stop(); findings(d.answers, "finding", text); }
  catch (e) { stop(); findings(["error: " + e.message], "finding"); }
  finally { $("recallBtn").disabled = false; }
};

$("contraBtn").onclick = async () => {
  if (!hasMemory) { findings(["No memory on file yet — reconstruct the night first."], "finding"); return; }
  $("contraBtn").disabled = true;
  const stop = busy($("answers"), "Cross-checking every statement…", { center: true, lines: PATTER.contra });
  try { const d = await post("/api/contradictions"); stop(); findings(d.conflicts, "finding conflict"); }
  catch (e) { stop(); findings(["error: " + e.message], "finding"); }
  finally { $("contraBtn").disabled = false; }
};

$("graphBtn").onclick = () => {
  if (!hasMemory) { setStatus("Reconstruct first — no corkboard to pin yet."); return; }
  const panel = $("graphPanel");
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth" });
  const stop = busy($("graphLoading"), "Laying out the corkboard…", { lines: PATTER.graph });
  const frame = $("graphFrame");
  frame.onload = () => { stop(); $("graphLoading").textContent = ""; };
  frame.src = "/api/graph?t=" + Date.now();
};

$("query").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !$("recallBtn").disabled) $("recallBtn").click();
});
