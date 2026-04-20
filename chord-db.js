(function() {
  const NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  const NOTE_TO_INDEX = {};
  NOTES.forEach((n, i) => { NOTE_TO_INDEX[n] = i; });
  Object.assign(NOTE_TO_INDEX, { 'C#': 1, 'D#': 3, 'F#': 6, 'G#': 8, 'A#': 10 });

  const GUITAR_KEY_MAP = { 'Db': 'Csharp', 'Gb': 'Fsharp' };

  const FLAT_TO_SHARP = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

  const CHORD_TYPE_ORDER = [
    'major', 'minor', 'aug', 'dim',
    '7', 'maj7', 'm7', 'mmaj7', 'm7b5', 'aug7', 'dim7',
    'sus2', 'sus4', '7sus4',
    '6', 'm6', 'add9', 'madd9',
    '9', 'maj9', 'm9', '11', 'm11', '13',
  ];
  const CHORD_TYPE_PRIORITY = {};
  CHORD_TYPE_ORDER.forEach((id, i) => { CHORD_TYPE_PRIORITY[id] = i; });

  const CDN_URLS = {
    ukulele: 'https://cdn.jsdelivr.net/npm/@tombatossals/chords-db/lib/ukulele.json',
    guitar: 'https://cdn.jsdelivr.net/npm/@tombatossals/chords-db/lib/guitar.json',
  };

  const dbCache = {};

  async function fetchDb(instrument) {
    if (dbCache[instrument]) return dbCache[instrument];
    const res = await fetch(CDN_URLS[instrument]);
    const db = await res.json();
    dbCache[instrument] = db;
    return db;
  }

  function buildChordMap(db, instrument) {
    const CHORDS = {};
    for (const root of NOTES) {
      const dbKey = instrument === 'guitar' ? (GUITAR_KEY_MAP[root] || root) : root;
      const entries = db.chords[dbKey];
      if (!entries) continue;
      for (const entry of entries) {
        const pos = entry.positions[0];
        if (!pos) continue;

        const frets = pos.frets.map(f => f === -1 ? 'x' : f).join('');
        const fingers = pos.fingers.join('');
        const position = pos.baseFret === 1 ? 0 : pos.baseFret;
        const midiPcs = [];
        let mi = 0;
        for (const f of pos.frets) {
          if (f === -1) midiPcs.push(null);
          else if (pos.midi) midiPcs.push(pos.midi[mi++] % 12);
          else midiPcs.push(null);
        }
        const sub = midiPcs.map(pc => pc === null ? '_' : NOTES[pc]).join(',');

        const data = { frets, fingers, position, sub, midiPcs };
        CHORDS[root + entry.suffix] = data;
        if (FLAT_TO_SHARP[root]) {
          CHORDS[FLAT_TO_SHARP[root] + entry.suffix] = data;
        }
      }
    }
    return CHORDS;
  }

  function spellSub(chordName, data) {
    if (!data.midiPcs || typeof Tonal === 'undefined') return data.sub;
    const chord = Tonal.Chord.get(chordName);
    if (!chord.notes || !chord.notes.length) return data.sub;
    const toneByPc = {};
    chord.notes.forEach(n => {
      const pc = Tonal.Note.chroma(n);
      if (pc !== null && toneByPc[pc] === undefined) toneByPc[pc] = n;
    });
    return data.midiPcs.map(pc => {
      if (pc === null) return '_';
      return toneByPc[pc] ?? NOTES[pc];
    }).join(',');
  }

  window.ChordDb = { NOTES, NOTE_TO_INDEX, GUITAR_KEY_MAP, CDN_URLS, CHORD_TYPE_ORDER, CHORD_TYPE_PRIORITY, fetchDb, buildChordMap, spellSub };
})();
