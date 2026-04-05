# Ukulele / Guitar Chords

A minimal, mobile-friendly chord finder for ukulele and guitar. Single HTML file, no build step.

**Live:** [chords.sasaya.me](https://chords.sasaya.me)

## Features

- **Ukulele & Guitar** — toggle between instruments; chord diagrams adapt string count automatically
- **Chord diagrams** — powered by [uke-chord](https://github.com/pianosnake/uke-chord) web component
- **Score view** — optional staff notation via [abcjs](https://github.com/paulrosen/abcjs) and [Tonal.js](https://github.com/tonaljs/tonal)
- **Enharmonic names** — shows both sharp and flat labels (e.g. C#/Db)
- **Persistent state** — selections saved to localStorage across reloads
- **Chord sheet viewer** — display ChordPro (.cho) format sheets via `sheet.html?data=<base64>`, powered by [ChordSheetJS](https://github.com/martijnversluis/ChordSheetJS)

## Chord Data

Chord voicings are loaded from [@tombatossals/chords-db](https://github.com/tombatossals/chords-db) via jsDelivr CDN. Guitar data is lazy-fetched and cached on first use.

## Development

Open `index.html` in a browser. That's it.
