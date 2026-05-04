(function() {
  const UKE_TUNING_PCS  = [7, 0, 4, 9];
  const UKE_TUNING_MIDI = [67, 60, 64, 69];
  const MAX_FRET = 9;
  const MAX_SPAN = 5;

  const cache = new Map();

  function findUkeFingering(targetPcs) {
    const numStrings = 4;
    const choices = UKE_TUNING_PCS.map(open => {
      const list = [];
      for (let f = 0; f <= MAX_FRET; f++) {
        if (targetPcs.has((open + f) % 12)) list.push(f);
      }
      return list;
    });

    let best = null;
    function cmpArr(a, b) {
      for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
      return 0;
    }
    function consider(combo) {
      const covered = new Set();
      for (let i = 0; i < numStrings; i++) {
        covered.add((UKE_TUNING_PCS[i] + combo[i]) % 12);
      }
      if (covered.size !== targetPcs.size) return;
      const nonZero = combo.filter(f => f > 0);
      const span = nonZero.length ? Math.max(...nonZero) - Math.min(...nonZero) + 1 : 0;
      if (span > MAX_SPAN) return;
      const minFret = nonZero.length ? Math.min(...nonZero) : 0;
      const score = [minFret, span, nonZero.length];
      if (!best || cmpArr(score, best.score) < 0) {
        best = { combo: [...combo], score };
      }
    }
    function dfs(idx, combo) {
      if (idx === numStrings) { consider(combo); return; }
      for (const f of choices[idx]) {
        combo.push(f);
        dfs(idx + 1, combo);
        combo.pop();
      }
    }
    dfs(0, []);
    return best ? best.combo : null;
  }

  function assignFingers(combo) {
    const indexed = combo
      .map((f, i) => ({ f, i }))
      .filter(x => x.f > 0)
      .sort((a, b) => a.f - b.f || a.i - b.i);
    const fingers = combo.map(() => 0);
    indexed.forEach((x, n) => { fingers[x.i] = Math.min(n + 1, 4); });
    return fingers;
  }

  function comboToData(combo, tonalSymbol) {
    const fingers = assignFingers(combo).join('');
    const nonZero = combo.filter(f => f > 0);
    const maxNonZero = nonZero.length ? Math.max(...nonZero) : 0;
    const minNonZero = nonZero.length ? Math.min(...nonZero) : 0;
    const position = (maxNonZero >= 5 && minNonZero >= 2) ? minNonZero : 0;
    const frets = position > 0
      ? combo.map(f => f === 0 ? 0 : f - position + 1).join('')
      : combo.join('');
    const midi = combo.map((f, i) => UKE_TUNING_MIDI[i] + f);
    const midiPcs = midi.map(m => m % 12);
    const data = { frets, fingers, position, sub: '', midi, midiPcs };
    if (typeof ChordDb !== 'undefined') {
      data.sub = ChordDb.spellSub(tonalSymbol, data);
    }
    return data;
  }

  const ALIAS_MAP = {
    '7omit1':    { offset: 4, suffix: 'dim' },
    'm7omit1':   { offset: 3, suffix: 'major' },
    'maj7omit1': { offset: 4, suffix: 'minor' },
  };

  const SEARCH_MAP = {
    'omit3':     { intervals: [0, 7],     tonalSuffix: '5' },
    '7omit5':    { intervals: [0, 4, 10], tonalSuffix: '7' },
    'm7omit5':   { intervals: [0, 3, 10], tonalSuffix: 'm7' },
    'maj7omit5': { intervals: [0, 4, 11], tonalSuffix: 'maj7' },
  };

  function compute(rootName, qid, chordsMap) {
    const rIdx = ChordDb.NOTE_TO_INDEX[rootName];
    if (rIdx === undefined) return null;

    const alias = ALIAS_MAP[qid];
    if (alias) {
      const newRoot = ChordDb.NOTES[(rIdx + alias.offset) % 12];
      return chordsMap[newRoot + alias.suffix] || null;
    }

    const search = SEARCH_MAP[qid];
    if (!search) return null;
    const targetPcs = new Set(search.intervals.map(iv => (rIdx + iv) % 12));
    const combo = findUkeFingering(targetPcs);
    if (!combo) return null;
    return comboToData(combo, rootName + search.tonalSuffix);
  }

  function getOmitChordData(rootName, qid, chordsMap) {
    const key = `${rootName}:${qid}`;
    if (cache.has(key)) return cache.get(key);
    const data = compute(rootName, qid, chordsMap);
    cache.set(key, data);
    return data;
  }

  window.OmitShapes = { getOmitChordData };
})();
