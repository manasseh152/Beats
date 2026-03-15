import { watch } from "node:fs/promises";
import { join, relative, extname } from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";

const PORT = 3131;
const TRACKS_DIR = "./tracks";
const PUBLIC_DIR = "./public";

// --- Track discovery ---

async function getStrudelFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await getStrudelFiles(full)));
    } else if (entry.name.endsWith(".strudel")) {
      files.push(relative(TRACKS_DIR, full));
    }
  }
  return files.sort();
}

// --- Debounced file watcher ---

const debounceTimers = new Map<string, Timer>();

function debouncedBroadcast(path: string) {
  const existing = debounceTimers.get(path);
  if (existing) clearTimeout(existing);

  debounceTimers.set(
    path,
    setTimeout(async () => {
      debounceTimers.delete(path);
      try {
        const code = await readFile(path, "utf-8");
        const track = relative(TRACKS_DIR, path);
        server.publish(
          "tracks",
          JSON.stringify({ type: "code", track, code })
        );
        console.log(`♫ Broadcast: ${track}`);
      } catch {
        // File may have been deleted
      }
    }, 100)
  );
}

async function startWatcher() {
  try {
    const watcher = watch(TRACKS_DIR, { recursive: true });
    for await (const event of watcher) {
      if (event.filename?.endsWith(".strudel")) {
        debouncedBroadcast(join(TRACKS_DIR, event.filename));
      }
    }
  } catch (err) {
    console.error("Watcher error:", err);
  }
}

// --- MIME types ---

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// --- Server ---

const server = Bun.serve({
  port: PORT,
  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/_ws") {
      if (server.upgrade(req)) return;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // REST: track list
    if (url.pathname === "/api/tracks") {
      const tracks = await getStrudelFiles(TRACKS_DIR);
      return Response.json(tracks);
    }

    // Static files from public/
    let filePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const fullPath = join(PUBLIC_DIR, filePath);

    try {
      const file = Bun.file(fullPath);
      if (await file.exists()) {
        const ext = extname(fullPath);
        return new Response(file, {
          headers: { "Content-Type": MIME[ext] || "application/octet-stream" },
        });
      }
    } catch {
      // fall through to 404
    }

    return new Response("Not Found", { status: 404 });
  },

  websocket: {
    open(ws) {
      ws.subscribe("tracks");
      getStrudelFiles(TRACKS_DIR).then((tracks) => {
        ws.send(JSON.stringify({ type: "welcome", tracks }));
      });
      console.log("⚡ Client connected");
    },
    async message(ws, msg) {
      try {
        const data = JSON.parse(String(msg));
        if (data.type === "load" && data.track) {
          const fullPath = join(TRACKS_DIR, data.track);
          const code = await readFile(fullPath, "utf-8");
          ws.send(JSON.stringify({ type: "code", track: data.track, code }));
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "Invalid request" }));
      }
    },
    close() {
      console.log("⚡ Client disconnected");
    },
  },
});

startWatcher();
console.log(`🎵 Beats server running at http://localhost:${PORT}`);
