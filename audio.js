(function() {
  const PRESETS = {
    ukulele: { attackNoise: 1, dampening: 7000, resonance: 0.9875, strumGap: 0.08 },
    guitar:  { attackNoise: 1, dampening: 4000, resonance: 0.9775, strumGap: 0.08 },
  };

  const POOL_SIZE = 8;
  const VOICE_VOLUME_DB = -8;
  const SCHEDULE_BUFFER = 0.04;
  let pool = [];
  let currentInstrument = null;
  let master = null;
  let contextTuned = false;

  function getMaster() {
    if (master) return master;
    master = new Tone.Compressor({
      threshold: -10,
      ratio: 12,
      attack: 0.003,
      release: 0.08,
    }).toDestination();
    return master;
  }

  function ensurePool(instrument) {
    if (currentInstrument === instrument && pool.length) return pool;
    pool.forEach(p => { try { p.dispose(); } catch {} });
    pool = [];
    const p = PRESETS[instrument] || PRESETS.ukulele;
    const out = getMaster();
    for (let i = 0; i < POOL_SIZE; i++) {
      const v = new Tone.PluckSynth({
        attackNoise: p.attackNoise,
        dampening: p.dampening,
        resonance: p.resonance,
      });
      v.volume.value = VOICE_VOLUME_DB;
      v.connect(out);
      pool.push(v);
    }
    currentInstrument = instrument;
    return pool;
  }

  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  function midiToNoteName(m) {
    const oct = Math.floor(m / 12) - 1;
    return NOTE_NAMES[m % 12] + oct;
  }

  async function playChord(midiArray, instrument) {
    if (typeof Tone === 'undefined') return;
    if (!midiArray || !midiArray.some(m => m !== null)) return;
    if (Tone.context.state !== 'running') await Tone.start();
    if (!contextTuned) {
      Tone.context.lookAhead = SCHEDULE_BUFFER;
      contextTuned = true;
    }
    const voices = ensurePool(instrument);
    const gap = PRESETS[instrument]?.strumGap ?? 0.02;
    const start = Tone.now();
    let i = 0;
    midiArray.forEach(m => {
      if (m === null) return;
      const v = voices[i % voices.length];
      v.triggerAttack(midiToNoteName(m), start + i * gap);
      i++;
    });
  }

  window.ChordPlayer = { playChord };
})();
