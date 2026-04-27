# Ukulele / Guitar Chords

A minimal, mobile-friendly chord finder for ukulele and guitar. Single HTML file, no build step.

**Live:** [chords.sasaya.me](https://chords.sasaya.me)

## Features

### Chord Finder (`index.html`)

- **Ukulele & Guitar** — toggle between instruments; chord diagrams adapt string count automatically
- **Chord diagrams** — powered by [uke-chord](https://github.com/pianosnake/uke-chord) web component
- **Tap to play** — tap the chord card to hear the voicing strummed with real instrument samples
- **Score view** — optional staff notation via [abcjs](https://github.com/paulrosen/abcjs) and [Tonal.js](https://github.com/tonaljs/tonal)
- **Enharmonic names** — shows both sharp and flat labels (e.g. C#/Db)
- **Persistent state** — selections saved to localStorage across reloads

### Sheet Viewer (`sheet.html?data=<base64>`)

- **ChordPro rendering** — parses and displays `.cho` sheets via [ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS)
- **Chord panel** — collapsible list of every chord used in the sheet, with diagrams; tap any card to hear it
- **Transpose** — change the song key from a dropdown; the capo offset to the original key updates live
- **Font size controls** — bump lyric/chord text up or down, persisted across reloads

### ChordPro Encoder (`encode.html`)

Paste raw ChordPro text and get a shareable `sheet.html?data=...` URL (base64-encoded, URL-safe).

## Data & Audio

- **Chord voicings** — [@tombatossals/chords-db](https://github.com/tombatossals/chords-db) via jsDelivr CDN; guitar data is lazy-fetched and cached on first use
- **Audio samples** — [gleitz/midi-js-soundfonts](https://github.com/gleitz/midi-js-soundfonts) (FluidR3_GM): `acoustic_guitar_steel` for guitar, `acoustic_guitar_nylon` for ukulele, played back via [Tone.js](https://tonejs.github.io) `Tone.Sampler`

## Development

Open `index.html` in a browser. That's it.
