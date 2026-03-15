# Beats — Strudel Live-Coding Workstation

## Project Basics

Default to using Bun instead of Node.js. No runtime dependencies — server uses only Bun built-ins + `node:fs/path`.

## Quick Start

```bash
bun dev                        # Start server at http://localhost:3131
bun run new:sketch my-idea     # Create tracks/sketches/YYYY-MM-DD-my-idea.strudel
bun run new:track my-song      # Create tracks/wip/my-song.strudel
```

Edit `.strudel` files in any IDE — changes hot-swap in the browser automatically.

## File Organization

- `tracks/sketches/` — Quick experiments (`YYYY-MM-DD-name.strudel`)
- `tracks/wip/` — Work in progress
- `tracks/finished/` — Completed tracks
- `tracks/templates/` — Starter templates (don't modify, copy instead)
- One pattern per file. Start each file with a `//` comment describing intent.
- Always set tempo with `.cpm(bpm)` (cycles per minute).

## Strudel Mini-Notation

| Syntax | Meaning | Example |
|--------|---------|---------|
| `a b c d` | Sequence | `s("bd sd bd sd")` |
| `[a b]` | Subdivide into one step | `s("bd [hh hh]")` |
| `a*n` | Repeat n times | `s("hh*8")` |
| `~` | Rest / silence | `s("bd ~ sd ~")` |
| `a/n` | Play every n cycles | `s("cp/2")` |
| `<a b c>` | Alternate each cycle | `s("<bd cp>")` |
| `a(b,c)` | Euclidean rhythm | `s("bd(3,8)")` |
| `a(b,c,d)` | Euclidean + offset | `s("sd(5,8,2)")` |
| `a:n` | Sample variant | `s("sd:2")` |
| `a?` | 50% chance to play | `s("hh?")` |

## Core Functions

### Sound Sources

```js
s("bd sd hh cp")              // Drum samples
s("bd").bank("RolandTR808")   // Specific sample bank
note("c3 e3 g3")              // Notes (chromatic)
n("0 2 4 7").scale("C:minor") // Scale degrees
sound("sawtooth")             // Synth oscillators: sine, triangle, square, sawtooth
```

### Layering

```js
stack(pattern1, pattern2)     // Play patterns simultaneously
cat(pattern1, pattern2)       // Play patterns sequentially (one per cycle)
```

### Effects

```js
.cutoff(freq)                 // Low-pass filter frequency (Hz)
.resonance(q)                 // Filter resonance (0-40)
.room(amount)                 // Reverb wet (0-1)
.roomsize(size)               // Reverb size (0-10)
.delay(amount)                // Delay wet (0-1)
.delaytime(time)              // Delay time in seconds
.gain(vol)                    // Volume (0-1)
.pan(pos)                     // Stereo pan (0=left, 0.5=center, 1=right)
.distort(amount)              // Distortion (0-1+)
```

### Envelope (for synths)

```js
.attack(seconds)
.decay(seconds)
.sustain(level)               // 0-1
.release(seconds)
```

### Transformations

```js
.fast(n)                      // Speed up n times
.slow(n)                      // Slow down n times
.rev                          // Reverse pattern
.jux(fn)                      // Apply fn to right channel only (stereo)
.every(n, fn)                 // Apply fn every n cycles
.sometimes(fn)                // Apply fn ~50% of the time
.often(fn)                    // Apply fn ~75% of the time
.rarely(fn)                   // Apply fn ~25% of the time
.off(time, fn)                // Offset copy with fn applied
```

### Tempo

```js
.cpm(90)                      // Cycles per minute (approx BPM for 4/4)
```

## Common Sample Banks

`RolandTR808`, `RolandTR909`, `RolandCR78`, `AkaiLinn`, `ViscoSpaceDrum`

## Common Scales

`major`, `minor`, `dorian`, `mixolydian`, `pentatonic`, `blues`, `chromatic`, `whole tone`, `diminished`

## Example Patterns

### Beginner — Simple Beat
```js
s("bd sd:1 bd [sd:1 hh]")
  .bank("RolandTR909")
  .cpm(90)
```

### Intermediate — Layered Groove
```js
stack(
  s("bd [~ bd] sd [~ sd:2]").bank("RolandTR808"),
  s("hh*8").gain(".6 .4 .8 .4 .6 .4 .8 .4"),
  n("0 ~ 3 ~").scale("C:minor").sound("sawtooth").octave(2).cutoff(600)
).cpm(95)
```

### Advanced — Evolving Pattern
```js
stack(
  s("bd(3,8)").bank("RolandTR808"),
  s("sd:1(5,8,2)").bank("RolandTR808").gain(0.7),
  s("hh(7,16)").bank("RolandTR808").gain(0.5)
    .every(4, fast(2)),
  n("<0 3 5 7>(3,8)")
    .scale("D:dorian")
    .sound("sawtooth")
    .cutoff(sine.range(400, 2000).slow(8))
    .room(0.4)
    .delay(0.2)
    .delaytime(0.166)
).cpm(105)
```

## Conventions for AI-Generated Patterns

- Always include a `//` comment at the top explaining the pattern's intent
- Always set `.cpm()` explicitly
- Use `stack()` for multi-voice patterns
- Prefer `.bank("RolandTR808")` or `.bank("RolandTR909")` for drums
- Keep patterns readable — one voice per line in `stack()`
- Use `.gain()` to balance voices (keep sum reasonable)
