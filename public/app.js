let strudel = null;
let repl = null;
let currentTrack = "";
let currentCode = "";

// --- Strudel initialization (requires user gesture) ---

async function initStrudel() {
  if (repl) return;

  const { StrudelMirror } = await import("@strudel/web");

  repl = new StrudelMirror({
    defaultOutput: "speaker",
    prebake: async () => {
      // Prebake loads default samples and functions
    },
    onError: (err) => showError(err.message || String(err)),
    onWarning: (msg) => console.warn("[strudel]", msg),
  });

  // Wait for prebake to finish
  await repl.prebake();
}

async function evaluate(code, forceNew = false) {
  if (!repl) await initStrudel();
  hideError();
  try {
    await repl.evaluate(code, forceNew);
  } catch (err) {
    showError(err.message || String(err));
  }
}

function stop() {
  if (repl) {
    repl.stop();
  }
}

// --- UI ---

const trackSelect = document.getElementById("track-select");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
const codeDisplay = document.getElementById("code-display").querySelector("code");
const statusEl = document.getElementById("status");
const errorEl = document.getElementById("error");

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
}

function setTracks(tracks) {
  // Preserve current selection
  const current = trackSelect.value;
  trackSelect.innerHTML = '<option value="">— select track —</option>';
  for (const t of tracks) {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    trackSelect.appendChild(opt);
  }
  if (current && tracks.includes(current)) {
    trackSelect.value = current;
  }
}

function displayCode(code) {
  codeDisplay.textContent = code;
}

// --- Controls ---

playBtn.addEventListener("click", async () => {
  if (currentCode) {
    await evaluate(currentCode, true);
  }
});

stopBtn.addEventListener("click", () => stop());

trackSelect.addEventListener("change", () => {
  const track = trackSelect.value;
  if (track) {
    currentTrack = track;
    ws.send(JSON.stringify({ type: "load", track }));
  }
});

// --- WebSocket ---

let ws;
let reconnectTimer;

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${location.host}/_ws`);

  ws.addEventListener("open", () => {
    statusEl.textContent = "Connected";
    statusEl.className = "connected";
    clearTimeout(reconnectTimer);
  });

  ws.addEventListener("close", () => {
    statusEl.textContent = "Disconnected";
    statusEl.className = "disconnected";
    reconnectTimer = setTimeout(connect, 2000);
  });

  ws.addEventListener("error", () => {
    ws.close();
  });

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "welcome":
        setTracks(data.tracks);
        break;

      case "tracks":
        setTracks(data.list);
        break;

      case "code":
        if (data.track === currentTrack) {
          currentCode = data.code;
          displayCode(data.code);
          // Hot-swap: re-evaluate if already playing
          if (repl?.started) {
            evaluate(data.code, true);
          }
        }
        break;

      case "error":
        showError(data.message);
        break;
    }
  });
}

connect();
