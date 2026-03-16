# Architecture

Beats is a three-part system: a Bun server that watches files and serves the app, a WebSocket layer that pushes code changes in real time, and a browser client that evaluates Strudel patterns.

```
 .strudel file saved
       │
       ▼
 fs.watch (recursive)
       │
       ▼
 100ms debounce (Map<path, Timer>)
       │
       ▼
 readFile(path)
       │
       ▼
 server.publish("tracks", {type:"code", track, code})
       │
       ▼
 WebSocket broadcast to all subscribers
       │
       ▼
 Client: if track matches & playing → evaluate(code, true)
```

## Server (server.ts)

### Static File Serving

The server serves `public/` as static files. Requests to `/` are rewritten to `/index.html`. A MIME map covers `.html`, `.js`, `.css`, `.json`, `.png`, `.svg`, and `.ico` — anything else gets `application/octet-stream`.

### REST API

One endpoint:

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/api/tracks` | JSON array of all `.strudel` file paths, relative to `tracks/` |

The track list is generated fresh on each request by recursively walking `tracks/`.

### WebSocket Protocol

Clients connect at `/_ws` and are subscribed to the `"tracks"` pub/sub topic.

**Server to client**:

| `type` | Fields | When |
|--------|--------|------|
| `welcome` | `tracks: string[]` | On connect — full track list |
| `code` | `track: string, code: string` | File changed or client requested load |
| `error` | `message: string` | Invalid client request |

**Client to server**:

| `type` | Fields | Purpose |
|--------|--------|---------|
| `load` | `track: string` | Request a specific track's code |

The server uses Bun's built-in pub/sub (`server.publish`) for broadcasting. All connected clients receive every `code` message — the client filters by its currently selected track.

### File Watcher

```ts
watch(TRACKS_DIR, { recursive: true })  // node:fs/promises
```

The watcher fires on any change inside `tracks/`. Events are filtered to `.strudel` files only. Each change is debounced per-path using a `Map<string, Timer>` — if the same file changes again within 100ms, the previous timer is cleared and a new one starts. When the timer fires, the file is read and broadcast.

If the file was deleted between the event and the read, the error is silently caught.

## Client (public/app.js)

### Strudel Initialization

Strudel is loaded lazily via a dynamic `import("@strudel/web")` — only when the user first clicks Play. This satisfies the browser autoplay policy (audio context requires a user gesture). The import map in `index.html` resolves `@strudel/web` to the CDN build at `https://unpkg.com/@strudel/web@1.3.0/dist/index.mjs`.

A `StrudelMirror` instance is created with `defaultOutput: "speaker"`. The `prebake()` step loads default samples and pattern functions.

### Hot-Swap

When a `code` message arrives for the currently selected track:

1. The code display is updated
2. If Strudel is currently playing (`repl.started` is truthy), `evaluate(code, true)` is called immediately

The `forceNew: true` parameter tells Strudel to replace the running pattern without stopping the clock, so the music continues seamlessly.

### Auto-Reconnect

On WebSocket close, the client retries after 2 seconds. On successful reconnect, the server sends a fresh `welcome` message with the current track list, so the UI stays in sync even after server restarts (which happen automatically via `bun --watch`).

## Track Discovery

`getStrudelFiles(dir)` recursively walks a directory, collects all files ending in `.strudel`, and returns their paths relative to `tracks/`, sorted alphabetically. It's called in two places:

1. **WebSocket connect** — populates the `welcome` message
2. **`GET /api/tracks`** — REST fallback

There is no caching — the file system is the source of truth on every call.

## Design Decisions

**Zero runtime dependencies**: The server uses only Bun built-ins and `node:fs/promises`. No Express, no socket.io. Bun's native HTTP server and WebSocket support handle everything.

**CDN for Strudel**: Loading `@strudel/web` from unpkg avoids bundling ~2MB of Strudel into the project. The version is pinned at 1.3.0 in the import map.

**No in-browser editor**: The browser shows code read-only. Your IDE is the editor — with full syntax highlighting, keybindings, and AI assistance. The browser is the playback engine.

**100ms debounce**: Editors often trigger multiple file-system events per save (write, rename, chmod). The 100ms window collapses these into a single broadcast. Short enough to feel instant, long enough to avoid duplicate evaluations.

**Pub/sub broadcast**: All clients receive all code updates. The client filters by `currentTrack`. This keeps the server stateless — it doesn't track which client is listening to which track.
