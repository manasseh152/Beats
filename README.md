# Beats

Live-coding music workstation powered by [Strudel.cc](https://strudel.cc).

Write `.strudel` patterns in your editor, hear them instantly in the browser. No in-browser editor — your IDE is the instrument.

## Quick Start

```bash
git clone <repo-url> && cd Beats
bun install
bun dev                        # http://localhost:3131
bun run new:sketch my-idea     # tracks/sketches/2026-03-16-my-idea.strudel
```

Open `http://localhost:3131`, select a track, and click **Play**. Edit the `.strudel` file in your editor — changes hot-swap into the running pattern automatically.

**Prerequisites**: [Bun](https://bun.sh) >= 1.0

## How It Works

```
 Editor          Server (Bun)           Browser
┌──────┐   fs   ┌──────────────┐  ws   ┌──────────┐
│ .strudel ──────▶ file watcher ────────▶ evaluate  │
│ file  │  watch │  100ms       │  push │ (Strudel) │
└──────┘        │  debounce    │       └──────────┘
                └──────────────┘
```

The server watches `tracks/` for `.strudel` file changes, debounces them, reads the new content, and broadcasts it over WebSocket. The browser receives the code and — if a pattern is already playing — hot-swaps it without stopping the clock.

See [docs/architecture.md](docs/architecture.md) for full details.

## Project Structure

```
server.ts              Bun HTTP + WebSocket server
public/
  index.html           Single-page app shell
  app.js               Client: Strudel init, WebSocket, hot-swap
  style.css
tracks/
  sketches/            Quick experiments (YYYY-MM-DD-name.strudel)
  wip/                 Work in progress
  finished/            Completed tracks
  templates/           Starter templates (copy, don't edit)
samples/               Local samples (gitignored)
scripts/               Track scaffolding script
docs/                  Architecture doc, learning curriculum
CLAUDE.md              AI coding reference (Strudel syntax, conventions)
```

## Creating Tracks

```bash
bun run new:sketch cool-idea   # → tracks/sketches/2026-03-16-cool-idea.strudel
bun run new:track my-song      # → tracks/wip/my-song.strudel
```

Track lifecycle: **sketches** (quick experiments) → **wip** (developing) → **finished** (done). Move files between folders manually when ready.

## Templates

Four starter templates in `tracks/templates/`:

- **minimal-beat** — Basic drum pattern with sample bank
- **drum-pattern** — Euclidean rhythms and polyrhythms
- **melodic** — Bass and melody using scale degrees
- **ambient** — Lush pads with reverb and delay

The `new:sketch` and `new:track` scripts copy from `minimal-beat` by default. Copy other templates manually.

## Local Samples

Drop audio files into `samples/` — they're gitignored so they won't bloat the repo. Built-in Strudel samples (TR-808, TR-909, etc.) load automatically from CDN, no local files needed.

## Important Notes

- **Browser autoplay**: Browsers require a user gesture before playing audio. Click **Play** to start — hot-swap works automatically after that.
- **Server auto-reload**: `bun dev` runs with `--watch`, so editing `server.ts` restarts the server automatically.
- **WebSocket reconnect**: If the server restarts, the client reconnects automatically after 2 seconds and receives a fresh track list.

## Learn Strudel

- [Learning Path](docs/learning-path.md) — 10-level progressive curriculum
- [CLAUDE.md](CLAUDE.md) — Complete syntax reference and pattern examples
- [strudel.cc](https://strudel.cc) — Official Strudel documentation

## Tech Stack

- [Bun](https://bun.sh) — runtime, server, file watcher, package manager
- [@strudel/web](https://www.npmjs.com/package/@strudel/web) v1.3.0 — loaded from CDN via import map
- WebSocket — real-time code push
- Zero runtime dependencies — server uses only Bun built-ins and `node:fs/promises`
