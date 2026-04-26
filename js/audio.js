/* Audio manager — combo-aware unlock fanfares + UI sfx */
(function (global) {
  const BASE = "audio/";
  const FILES = {
    start: "START.WAV",
    exit: "EXIT.WAV",
    cheers: ["CHEERS.WAV", "CHEERS2.WAV"],
    boos: "BOOS.WAV",
    combo: [
      ["COMBO1A.WAV", "COMBO1B.WAV"],
      ["COMBO2A.WAV", "COMBO2B.WAV"],
      ["COMBO3A.WAV", "COMBO3B.WAV"],
      ["COMBO4A.WAV", "COMBO4B.WAV"],
      ["COMBO5A.WAV", "COMBO5B.WAV"],
      ["COMBO6A.WAV", "COMBO6B.WAV"],
      ["COMBO7A.WAV", "COMBO7B.WAV"],
    ],
  };

  const cache = new Map();
  function load(file) {
    if (!cache.has(file)) {
      const a = new Audio(BASE + file);
      a.preload = "auto";
      cache.set(file, a);
    }
    return cache.get(file);
  }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function play(file, { volume = 0.85 } = {}) {
    if (ZielnikStorage.getMuted()) return;
    try {
      const proto = load(file);
      const node = proto.cloneNode(true);
      node.volume = volume;
      node.play().catch(() => { /* autoplay block — ignore */ });
    } catch { /* noop */ }
  }

  const Audio_ = {
    start() { play(FILES.start, { volume: 0.7 }); },
    exit() { play(FILES.exit, { volume: 0.7 }); },
    cheers() { play(pick(FILES.cheers), { volume: 0.85 }); },
    boos() { play(FILES.boos, { volume: 0.6 }); },
    /** comboLevel: 1..7+, plays only on actual NEW unlock */
    unlockCombo(comboLevel) {
      const idx = Math.min(Math.max(comboLevel, 1), FILES.combo.length) - 1;
      play(pick(FILES.combo[idx]), { volume: 0.9 });
    },
    isMuted() { return ZielnikStorage.getMuted(); },
    setMuted(b) {
      ZielnikStorage.setMuted(b);
      if (b) Music.pause(); else Music.resume();
    },
  };

  /* Background music — single shared instance, loops at low volume,
     starts on first user interaction (autoplay policy). */
  const Music = (function () {
    let el = null;
    let started = false;
    let wantPlaying = true;
    const VOL = 0.18;

    function ensure() {
      if (el) return el;
      el = new Audio(BASE + "music.mp3");
      el.loop = true;
      el.volume = VOL;
      el.preload = "auto";
      return el;
    }
    function start() {
      ensure();
      if (started) return;
      if (ZielnikStorage.getMuted()) return;
      el.play().then(() => { started = true; }).catch(() => { /* will retry on next gesture */ });
    }
    function pause() { if (el) el.pause(); }
    function resume() {
      ensure();
      if (ZielnikStorage.getMuted()) return;
      el.play().then(() => { started = true; }).catch(() => {});
    }

    // Try once on load (will likely fail — Chrome blocks), then on first user gesture.
    document.addEventListener("DOMContentLoaded", () => {
      ensure();
      start();
    });
    const onGesture = () => {
      if (wantPlaying) start();
      // keep listener until music actually starts
      if (started) {
        ["click", "keydown", "touchstart", "pointerdown"].forEach((e) =>
          window.removeEventListener(e, onGesture, true)
        );
      }
    };
    ["click", "keydown", "touchstart", "pointerdown"].forEach((e) =>
      window.addEventListener(e, onGesture, true)
    );

    return { start, pause, resume };
  })();

  Audio_.music = Music;
  global.ZielnikAudio = Audio_;
})(window);
