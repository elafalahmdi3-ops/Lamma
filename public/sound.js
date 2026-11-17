/* مؤثرات صوتية مولّدة بالكامل (بدون ملفات) */
(function () {
  'use strict';
  let ctx = null, master = null;
  let muted = false;
  try { muted = localStorage.getItem('lamma:mute') === '1'; } catch (e) {}
  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, t0, dur, type = 'sine', vol = 0.3, slide) {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, c.currentTime + t0 + dur);
    g.gain.setValueAtTime(0.0001, c.currentTime + t0);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    o.connect(g); g.connect(master); o.start(c.currentTime + t0); o.stop(c.currentTime + t0 + dur + 0.05);
  }
  function noise(t0, dur, vol = 0.2, f1 = 800, f2 = 4000, q = 1) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const s = c.createBufferSource(); s.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f1, c.currentTime + t0); bp.frequency.exponentialRampToValueAtTime(f2, c.currentTime + t0 + dur);
    const g = c.createGain(); g.gain.setValueAtTime(vol, c.currentTime + t0); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + t0 + dur);
    s.connect(bp); bp.connect(g); g.connect(master); s.start(c.currentTime + t0);
  }
  const arp = (notes, step, type = 'triangle', vol = 0.25, len = 0.25) => notes.forEach((n, i) => tone(n, i * step, len, type, vol));
  const FX = {
    count: () => { tone(660, 0, 0.12, 'square', 0.12); tone(660, 1, 0.12, 'square', 0.12); tone(660, 2, 0.12, 'square', 0.12); tone(990, 3, 0.25, 'square', 0.14); },
    beep: () => tone(660, 0, 0.12, 'square', 0.12),
    go: () => { tone(880, 0, 0.12, 'square', 0.2); tone(1320, 0.08, 0.25, 'square', 0.18); },
    open: () => tone(990, 0, 0.18, 'triangle', 0.2),
    whoosh: () => noise(0, 0.45, 0.25, 300, 3000, 0.8),
    flip: () => { noise(0, 0.08, 0.3, 2000, 5000, 2); noise(0.07, 0.08, 0.2, 2500, 6000, 2); },
    tap: () => tone(520, 0, 0.08, 'sine', 0.2, 780),
    correct: () => arp([660, 880, 1320], 0.07, 'triangle', 0.28),
    wrong: () => { tone(200, 0, 0.3, 'sawtooth', 0.15, 120); },
    buzz: () => { tone(140, 0, 0.4, 'square', 0.15, 90); },
    win: () => arp([523, 659, 784, 1046, 1318], 0.08, 'triangle', 0.25, 0.3),
    nobody: () => arp([392, 349, 311, 262], 0.12, 'triangle', 0.2, 0.3),
    fanfare: () => { arp([392, 523, 659, 784], 0.12, 'square', 0.12, 0.2); tone(1046, 0.5, 0.7, 'square', 0.13); tone(784, 0.5, 0.7, 'triangle', 0.15); },
    cheer: () => { arp([523, 659, 784, 1046, 1318, 1568], 0.06, 'triangle', 0.22, 0.4); noise(0.1, 1.2, 0.08, 1500, 3000, 0.5); },
    chime: () => arp([784, 988, 1175], 0.1, 'sine', 0.25, 0.5),
    ding: () => { tone(1318, 0, 0.6, 'sine', 0.25); tone(1976, 0.02, 0.5, 'sine', 0.1); },
    snap: () => { noise(0, 0.05, 0.5, 3000, 1500, 3); tone(220, 0, 0.1, 'sine', 0.3, 110); },
    drum: () => { for (let i = 0; i < 28; i++) noise(i * 0.07, 0.06, 0.05 + i * 0.006, 200, 120, 1); },
    reveal: () => { arp([523, 659, 784, 988, 1175, 1318, 1568, 2093], 0.09, 'sine', 0.2, 0.6); },
    tense: () => { tone(110, 0, 1.2, 'sine', 0.12, 116); },
    decoy: () => tone(330, 0, 0.15, 'square', 0.12),
    pop: () => tone(400, 0, 0.1, 'sine', 0.25, 900),
    swap: () => noise(0, 0.12, 0.12, 900, 1600, 1.5),
    pad0: () => tone(330, 0, 0.32, 'triangle', 0.28), pad1: () => tone(415, 0, 0.32, 'triangle', 0.28),
    pad2: () => tone(494, 0, 0.32, 'triangle', 0.28), pad3: () => tone(659, 0, 0.32, 'triangle', 0.28),
  };
  window.Sound = {
    play(name) { if (muted || !FX[name]) return; try { FX[name](); } catch (e) {} },
    unlock() { ac(); },
    get muted() { return muted; },
    toggle() { muted = !muted; try { localStorage.setItem('lamma:mute', muted ? '1' : '0'); } catch (e) {} return muted; },
  };
  ['pointerdown', 'keydown'].forEach((ev) => window.addEventListener(ev, () => ac(), { once: true, passive: true }));
})();
