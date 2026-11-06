let currentTrack = "";

// --- Strudel editor component ---

const repl = document.getElementById("repl");

// The strudel-editor web component exposes .editor (StrudelMirror) once ready.
// This helper retries until the editor is available.
function withEditor(fn) {
  if (repl.editor) {
    fn(repl.editor);
  } else {
    const check = setInterval(() => {
      if (repl.editor) {
        clearInterval(check);
        fn(repl.editor);
      }
    }, 50);
  }
}

// --- UI ---

const trackSelect = document.getElementById("track-select");
const playBtn = document.getElementById("play-btn");
const stopBtn = document.getElementById("stop-btn");
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
  const current = trackSelect.value;
  trackSelect.innerHTML = '<option value="">Select a track...</option>';
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

function setEditorCode(code) {
  hideError();
  withEditor((ed) => ed.setCode(code));
}

// --- Transport controls ---

playBtn.addEventListener("click", () => {
  hideError();
  withEditor((ed) => {
    try {
      ed.evaluate();
      playBtn.classList.add("active");
    } catch (err) {
      showError(err.message || String(err));
    }
  });
});

stopBtn.addEventListener("click", () => {
  withEditor((ed) => {
    ed.stop();
    playBtn.classList.remove("active");
  });
});

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
    statusEl.querySelector(".status-text").textContent = "Connected";
    statusEl.className = "status connected";
    clearTimeout(reconnectTimer);
  });

  ws.addEventListener("close", () => {
    statusEl.querySelector(".status-text").textContent = "Disconnected";
    statusEl.className = "status disconnected";
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
          setEditorCode(data.code);
        }
        break;

      case "error":
        showError(data.message);
        break;
    }
  });
}

connect();
