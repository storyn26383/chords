(function() {
  const SAMPLE_BASE = 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/FluidR3_GM/';
  const SAMPLE_NOTES = ['E2', 'Ab2', 'C3', 'E3', 'Ab3', 'C4', 'E4', 'Ab4', 'C5', 'E5', 'Ab5', 'C6'];

  const SOURCES = {
    guitar:  { folder: 'acoustic_guitar_steel-mp3/', volumeDb: -8 },
    ukulele: { folder: 'acoustic_guitar_nylon-mp3/', volumeDb: -8 },
  };

  const STRUM_GAP = 0.1;
  const SCHEDULE_BUFFER = 0.04;

  let master = null;
  let contextTuned = false;
  const samplers = {};

  function getMaster() {
    if (!master) {
      master = new Tone.Compressor({
        threshold: -10, ratio: 12, attack: 0.003, release: 0.08,
      }).toDestination();
    }
    return master;
  }

  function getSampler(instrument) {
    if (samplers[instrument]) return samplers[instrument];
    const src = SOURCES[instrument] || SOURCES.guitar;
    const urls = {};
    SAMPLE_NOTES.forEach(n => { urls[n] = n + '.mp3'; });
    const sampler = new Tone.Sampler({
      urls,
      baseUrl: SAMPLE_BASE + src.folder,
      attack: 0,
      release: 1,
    }).connect(getMaster());
    sampler.volume.value = src.volumeDb;
    samplers[instrument] = { sampler, loading: Tone.loaded() };
    return samplers[instrument];
  }

  const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  function midiToNoteName(m) {
    const oct = Math.floor(m / 12) - 1;
    return FLAT_NAMES[m % 12] + oct;
  }

  async function playChord(midiArray, instrument) {
    if (typeof Tone === 'undefined') return;
    if (!midiArray || !midiArray.some(m => m !== null)) return;
    if (Tone.context.state !== 'running') await Tone.start();
    if (!contextTuned) {
      Tone.context.lookAhead = SCHEDULE_BUFFER;
      contextTuned = true;
    }
    const entry = getSampler(instrument || 'guitar');
    if (entry.loading) await entry.loading;
    const start = Tone.now();
    let i = 0;
    midiArray.forEach(m => {
      if (m === null) return;
      entry.sampler.triggerAttackRelease(midiToNoteName(m), '2n', start + i * STRUM_GAP);
      i++;
    });
  }

  window.ChordPlayer = { playChord };
})();
