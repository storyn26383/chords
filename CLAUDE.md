# CLAUDE.md

Pure-static HTML/JS/CSS chord finder + ChordPro sheet viewer, hosted at `chords.sasaya.me` (GitHub Pages, see `CNAME`). No build step, no `package.json`; the browser loads the files directly.

## File layout

| File | Purpose |
|---|---|
| `index.html` | Chord finder (pick root + quality, see fingering) |
| `sheet.html` | ChordPro sheet viewer (`?data=<base64>`) |
| `encode.html` | ChordPro → `sheet.html?data=...` URL encoder |
| `shared.css` | CSS variables, `.btn`, `.switch-*` and other base styles shared across the three pages |
| `chord-db.js` | `window.ChordDb`: fetch chord-db JSON, build `CHORDS` map, spell sub via Tonal |
| `audio.js` | `window.ChordPlayer.playChord(midi, instrument)` using Tone.Sampler |
| `ui.js` | `window.Ui.createSwitch(label, active, onChange)` |
| `omit-shapes.js` | `window.OmitShapes.getOmitChordData(root, qid, CHORDS)`: brute-force search for omit voicings (ukulele only), cached by key |

Every shared JS module is wrapped in an IIFE that ends with `window.X = { ... }` to expose its namespace. Page-specific JS lives inline in the HTML's `<script>` block (and likewise page-specific CSS in `<style>`).

## Change rules

### Bump the cache-bust query whenever you change CSS or JS

Every local `.css` / `.js` reference in HTML carries a `?<unix-timestamp>` query, e.g.

```html
<link rel="stylesheet" href="shared.css?1777860952">
<script src="chord-db.js?1777860952"></script>
```

After modifying any CSS or JS (shared or page-specific), update every query string in `index.html`, `sheet.html`, and `encode.html` to a fresh timestamp (`date +%s`). Keep the same value across all three HTMLs so they bump together. Forgetting this leaves users on stale cache and produces inconsistent behaviour.

> **Tip:** `grep -rn '?<old-timestamp>' .` finds every occurrence; then use the Edit tool's `replace_all` to update each file in one call.

### No copy & paste — extract anything shared

If two or more pages need the same CSS variable / class, move it into `shared.css`. If two or more pages need the same logic, factor it into its own JS module (`chord-db.js`, `audio.js`, `ui.js`, `omit-shapes.js`). Keep page-specific bits inline.

A new module should:
1. Use the IIFE + `window.X` namespace pattern.
2. Expose a single object as the default surface; don't leak internal helpers.
3. Add a `<script src="X.js?<timestamp>"></script>` to whichever HTMLs use it, respecting dependency order (e.g. `omit-shapes.js` depends on `window.ChordDb`, so it must come after `chord-db.js`).

### README.md updates

`README.md` lists user-facing features. When adding something:
- **Update it** for new pages, new modes, or features users directly interact with.
- **Skip it** for bug fixes, internal refactors, purely cosmetic changes, or niche options that only advanced users will find (e.g. the omit voicings were intentionally not added).

Ask the user if you're unsure.

## Project conventions

### Persistent state

`localStorage['uke-chord-state']` is a JSON object shared between `index.html` and `sheet.html`:
- `instrument`: `'ukulele' | 'guitar'`
- `root`: e.g. `'C'`, `'Db'` — **always stored as the flat form internally**; the display falls back to `r.label` (e.g. `'C#/Db'`) at render time
- `quality`: e.g. `'major'`, `'7omit5'`
- `fullMode`, `showScore`, `chordDisplay` (`'name' | 'diagram'`), etc.

`sheet-font-size` is stored separately under its own key.

### Chord-db convention (important)

The `frets` array from `@tombatossals/chords-db` is **relative to `baseFret`** when `baseFret > 1`. So `{ frets: [1,3,3,2,1,1], baseFret: 3 }` means: the window starts at fret 3 with dots at relative positions 1, 3, 3, 2, 1, 1 (absolute frets 3, 5, 5, 4, 3, 3).

`<uke-chord position="N" frets="...">` follows the same convention: `position` is just a label, and `frets` values are relative to the displayed window. When generating a new shape with `position > 0`, convert each absolute fret to `f - position + 1` (leave open strings as `0`).

### Note spelling

`ChordDb.NOTES` uses the flat form (`'Db'`, `'Eb'`, `'Gb'`, `'Ab'`, `'Bb'`); `ChordDb.FLAT_TO_SHARP` maps to the sharp counterparts.

`ChordDb.spellSub(chordName, data)` asks Tonal for the expected note spelling of `chordName`. Tonal sometimes returns double-flats (e.g. `Gbdim` → `Gb-Bbb-Dbb`); for those roots, convert to the sharp form via `FLAT_TO_SHARP[root]` (e.g. `F#dim` → `F#-A-C`) before passing to `spellSub`.

### CHORDS map

`ChordDb.buildChordMap(db, instrument)` returns `{ [rootName + suffix]: data }`. For each of the five flat roots, **the same data object is registered under both the flat key (`Gbmajor`) and the sharp key (`F#major`)**, so lookups can use either form.

### Commit / Git

Follow the global CLAUDE.md:
- Conventional commit prefix without scope.
- Don't push to remote.
- Don't `git add -A`; stage individual files.
- To squash, use `git reset --soft <base>` then commit.
