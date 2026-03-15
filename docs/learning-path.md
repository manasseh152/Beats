# Strudel Learning Path

A progressive curriculum in 10 levels. Each level introduces a concept with exercises — create `.strudel` files in `tracks/sketches/` to practice.

---

## Level 1: First Sounds

**Concept**: Playing built-in samples with `s()`.

```js
s("bd hh sd hh")
```

**Exercises**:
- Create `level-01-a.strudel`: Play a kick drum on every beat
- Create `level-01-b.strudel`: Alternate between kick and snare

---

## Level 2: Rhythm

**Concept**: Subdivisions with `[]`, rests with `~`, repetition with `*`.

```js
s("bd [hh hh] sd [hh hh hh]")
s("bd ~ sd ~")
s("hh*8")
```

**Exercises**:
- Create `level-02-a.strudel`: A pattern with subdivided hi-hats
- Create `level-02-b.strudel`: Use rests to create space in a beat

---

## Level 3: Melody

**Concept**: Notes with `note()` and scale degrees with `n().scale()`.

```js
note("c3 e3 g3 c4")
n("0 2 4 7").scale("C:minor")
```

**Exercises**:
- Create `level-03-a.strudel`: A 4-note melody using `note()`
- Create `level-03-b.strudel`: Same melody using scale degrees

---

## Level 4: Effects

**Concept**: Filters, reverb, delay.

```js
s("bd sd").room(0.5).delay(0.25)
note("c3 e3").cutoff(800).resonance(10)
```

**Exercises**:
- Create `level-04-a.strudel`: Add reverb to a drum pattern
- Create `level-04-b.strudel`: Sweep a filter cutoff on a melody

---

## Level 5: Layering

**Concept**: `stack()` for simultaneous patterns, `cat()` for sequential.

```js
stack(
  s("bd sd bd sd"),
  s("hh*8"),
  note("c3 ~ e3 ~")
)
```

**Exercises**:
- Create `level-05-a.strudel`: Stack drums with a bass line
- Create `level-05-b.strudel`: Use `cat()` to create an A/B section

---

## Level 6: Transformations

**Concept**: `fast()`, `slow()`, `rev()`, `jux()`, `every()`, `sometimes()`.

```js
s("bd sd hh cp").fast(2)
s("bd sd hh cp").every(4, rev)
s("bd sd hh cp").jux(rev)
```

**Exercises**:
- Create `level-06-a.strudel`: Use `every()` to vary a pattern
- Create `level-06-b.strudel`: Use `jux()` for stereo variation

---

## Level 7: Euclidean & Polyrhythm

**Concept**: `e(beats, steps, offset)` for Euclidean rhythms, polymetric patterns.

```js
s("bd").e(3, 8)
stack(s("bd").e(3,8), s("sd").e(5,8), s("hh").e(7,16))
```

**Exercises**:
- Create `level-07-a.strudel`: Classic Euclidean patterns (3,8), (5,8), (7,16)
- Create `level-07-b.strudel`: Layer contrasting Euclidean rhythms

---

## Level 8: Harmony & Scales

**Concept**: Chords, voicings, scale selection.

```js
note("<C3 Am3 F3 G3>").voicing()
n("0 2 4 6").scale("D:dorian")
```

**Exercises**:
- Create `level-08-a.strudel`: A chord progression using `<>` slow pattern
- Create `level-08-b.strudel`: Melody over chords in a mode

---

## Level 9: Sound Design

**Concept**: Synth parameters — oscillators, envelopes, modulation.

```js
note("c3 e3 g3 c4")
  .sound("sawtooth")
  .cutoff(sine.range(200, 2000).slow(4))
  .attack(0.01).decay(0.2).sustain(0.3).release(0.5)
```

**Exercises**:
- Create `level-09-a.strudel`: Design a pluck sound (short decay, no sustain)
- Create `level-09-b.strudel`: Design a pad (long attack, high sustain, reverb)

---

## Level 10: Composition

**Concept**: Combining everything — structure, arrangement, dynamics.

**Exercises**:
- Create `level-10-a.strudel`: A full track with intro, main section, variation
- Create `level-10-b.strudel`: A track that uses at least 5 techniques from prior levels

---

## Tips

- Save each exercise as `tracks/sketches/level-XX-x.strudel`
- Use `bun run new:sketch level-01-a` to scaffold files
- Edit in your IDE, hear changes live in the browser
- Ask Claude Code for help: "create a strudel pattern that..."
