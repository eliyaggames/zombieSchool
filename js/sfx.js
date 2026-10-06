/**
 * Procedural SFX + short jingles via Web Audio API.
 * Exposes window.Sfx
 */
(() => {
  let ctx = null;
  let master = null;
  let muted = false;
  let musicGain = null;
  let musicTimer = null;
  let unlocked = false;

  try {
    muted = localStorage.getItem("eliya_sfx_muted") === "1";
  } catch (_) {}

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.55;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = muted ? 0 : 0.18;
      musicGain.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    unlocked = true;
    return ctx;
  }

  function now() {
    return ensure() ? ctx.currentTime : 0;
  }

  function envGain(start, peak, attack, hold, release) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(peak, start + attack);
    g.gain.setValueAtTime(peak, start + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, start + attack + hold + release);
    g.connect(master);
    return g;
  }

  function tone(freq, dur, type, peak, when) {
    if (!ensure() || muted) return;
    const t0 = when != null ? when : now();
    const o = ctx.createOscillator();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    const g = envGain(t0, peak || 0.2, 0.01, Math.max(0.01, dur * 0.45), dur * 0.55);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function sweep(f0, f1, dur, type, peak) {
    if (!ensure() || muted) return;
    const t0 = now();
    const o = ctx.createOscillator();
    o.type = type || "sawtooth";
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    const g = envGain(t0, peak || 0.22, 0.005, dur * 0.3, dur * 0.7);
    o.connect(g);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noiseBurst(dur, peak, filterFreq) {
    if (!ensure() || muted) return;
    const t0 = now();
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = filterFreq || 800;
    filter.Q.value = 0.8;
    const g = envGain(t0, peak || 0.25, 0.005, dur * 0.2, dur * 0.8);
    src.connect(filter);
    filter.connect(g);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  function melody(notes, gap) {
    if (!ensure() || muted) return;
    let t = now();
    const step = gap || 0.12;
    for (const n of notes) {
      const [freq, dur, type, peak] = n;
      tone(freq, dur, type || "triangle", peak || 0.18, t);
      t += step;
    }
  }

  // Note helpers (Hz)
  const Bb2 = 116.54,
    G3 = 196.0,
    A3 = 220.0,
    B3 = 246.94,
    E3 = 164.81,
    Bb3 = 233.08,
    C4 = 261.63,
    D4 = 293.66,
    E4 = 329.63,
    F4 = 349.23,
    G4 = 392.0,
    A4 = 440.0,
    Bb4 = 466.16,
    B4 = 493.88,
    C5 = 523.25,
    D5 = 587.33,
    E5 = 659.25,
    F5 = 698.46,
    G5 = 783.99,
    A5 = 880.0;

  function playLoopNote(freq, type, peak, dur) {
    if (!ctx || muted || !musicGain) return;
    const t0 = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = type || "triangle";
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak || 0.22, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + (dur || 0.28));
    o.connect(g);
    g.connect(musicGain);
    o.start(t0);
    o.stop(t0 + (dur || 0.28) + 0.04);
  }

  const Sfx = {
    unlock() {
      ensure();
    },

    isMuted() {
      return muted;
    },

    setMuted(on) {
      muted = !!on;
      try {
        localStorage.setItem("eliya_sfx_muted", muted ? "1" : "0");
      } catch (_) {}
      if (master) master.gain.value = muted ? 0 : 0.55;
      if (musicGain) musicGain.gain.value = muted ? 0 : 0.18;
      if (muted) Sfx.stopMusic();
    },

    toggleMute() {
      Sfx.setMuted(!muted);
      return muted;
    },

    // --- Event sounds ---
    uiClick() {
      tone(660, 0.06, "square", 0.08);
    },

    throwBook() {
      sweep(520, 180, 0.18, "triangle", 0.2);
      noiseBurst(0.08, 0.12, 1400);
    },

    zombieHit() {
      // impact
      noiseBurst(0.12, 0.28, 400);
      sweep(220, 90, 0.2, "sawtooth", 0.2);
      // zombie scream (wobbly descending)
      if (!ensure() || muted) return;
      const t0 = now();
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(480, t0);
      o.frequency.exponentialRampToValueAtTime(120, t0 + 0.45);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 18;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 35;
      lfo.connect(lfoGain);
      lfoGain.connect(o.frequency);
      const g = envGain(t0, 0.32, 0.02, 0.15, 0.35);
      o.connect(g);
      o.start(t0);
      lfo.start(t0);
      o.stop(t0 + 0.55);
      lfo.stop(t0 + 0.55);
    },

    keyPickup() {
      melody(
        [
          [E5, 0.08, "sine", 0.15],
          [G5, 0.08, "sine", 0.15],
          [C5, 0.14, "triangle", 0.18],
        ],
        0.09
      );
    },

    coin() {
      melody(
        [
          [B4, 0.06, "sine", 0.14],
          [E5, 0.08, "triangle", 0.16],
          [G5, 0.12, "sine", 0.18],
        ],
        0.08
      );
    },

    levelClear() {
      melody(
        [
          [C5, 0.1, "triangle", 0.16],
          [E5, 0.1, "triangle", 0.16],
          [G5, 0.1, "triangle", 0.16],
          [C5 * 2, 0.22, "sine", 0.22],
        ],
        0.11
      );
    },

    win() {
      // Victory fanfare
      melody(
        [
          [C5, 0.12, "square", 0.16],
          [E5, 0.12, "square", 0.16],
          [G5, 0.12, "square", 0.16],
          [C5 * 2, 0.28, "triangle", 0.22],
          [G5, 0.1, "square", 0.14],
          [C5 * 2, 0.35, "triangle", 0.24],
        ],
        0.13
      );
    },

    fail() {
      melody(
        [
          [E4, 0.16, "sawtooth", 0.18],
          [D4, 0.16, "sawtooth", 0.16],
          [C4, 0.28, "sawtooth", 0.2],
        ],
        0.16
      );
      noiseBurst(0.25, 0.15, 200);
    },

    catch() {
      noiseBurst(0.2, 0.3, 180);
      sweep(300, 70, 0.35, "sawtooth", 0.25);
    },

    revive() {
      melody(
        [
          [A4, 0.1, "sine", 0.14],
          [C5, 0.1, "sine", 0.14],
          [E5, 0.18, "triangle", 0.18],
        ],
        0.1
      );
    },

    sabotageThrow() {
      sweep(300, 700, 0.15, "square", 0.15);
    },

    /** Bright “bing” when a player is hit by a shot */
    bing() {
      if (!ensure() || muted) return;
      const t0 = now();
      tone(1046.5, 0.09, "sine", 0.28, t0); // C6
      tone(1568.0, 0.14, "triangle", 0.2, t0 + 0.04); // G6
      tone(2093.0, 0.1, "sine", 0.12, t0 + 0.08); // C7 sparkle
    },

    sabotageHit() {
      this.bing();
    },

    storyPage() {
      tone(392, 0.08, "sine", 0.08);
      tone(523, 0.1, "sine", 0.1);
    },

    invite() {
      melody(
        [
          [G4, 0.1, "triangle", 0.14],
          [C5, 0.12, "triangle", 0.16],
          [E5, 0.16, "sine", 0.16],
        ],
        0.11
      );
    },

    startPlay() {
      melody(
        [
          [G4, 0.08, "square", 0.12],
          [B4, 0.08, "square", 0.12],
          [D5, 0.14, "triangle", 0.16],
        ],
        0.09
      );
      Sfx.startMusic();
    },

    stopMusic() {
      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
    },

    /** Soft looping school-escape motif during play */
    startMusic() {
      if (!ensure() || muted) return;
      Sfx.stopMusic();
      const pattern = [G4, B4, D5, B4, A4, G4, E4, G4];
      let i = 0;
      musicTimer = setInterval(() => {
        if (!ctx || muted || !musicGain) return;
        const t0 = ctx.currentTime;
        const o = ctx.createOscillator();
        o.type = "triangle";
        o.frequency.value = pattern[i % pattern.length];
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.09, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
        o.connect(g);
        g.connect(musicGain);
        o.start(t0);
        o.stop(t0 + 0.32);
        i += 1;
      }, 320);
    },
  };

  window.Sfx = Sfx;

  // Unlock audio on first user gesture
  const unlock = () => {
    Sfx.unlock();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
})();
