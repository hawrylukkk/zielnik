/* localStorage facade — odblokowane kwiaty + statystyki + ustawienia */
(function (global) {
  const KEY_UNLOCKED = "zielnik.unlocked.v1";
  const KEY_STATS = "zielnik.stats.v1";
  const KEY_MUTED = "zielnik.muted.v1";

  function safeParse(raw, fallback) {
    try { return raw ? JSON.parse(raw) : fallback; }
    catch { return fallback; }
  }

  const Storage = {
    getUnlocked() {
      const arr = safeParse(localStorage.getItem(KEY_UNLOCKED), []);
      return new Set(Array.isArray(arr) ? arr : []);
    },
    setUnlocked(set) {
      localStorage.setItem(KEY_UNLOCKED, JSON.stringify([...set]));
    },
    isUnlocked(name) {
      return this.getUnlocked().has(name);
    },
    unlock(name) {
      const set = this.getUnlocked();
      if (set.has(name)) return false;
      set.add(name);
      this.setUnlocked(set);
      return true;
    },

    getStats() {
      return safeParse(localStorage.getItem(KEY_STATS), {
        gamesPlayed: 0,
        bestTimeSec: null,
        bestMoves: null,
        totalUnlocked: 0,
      });
    },
    setStats(s) {
      localStorage.setItem(KEY_STATS, JSON.stringify(s));
    },
    recordGame({ timeSec, moves, newUnlocks }) {
      const s = this.getStats();
      s.gamesPlayed += 1;
      if (s.bestTimeSec == null || timeSec < s.bestTimeSec) s.bestTimeSec = timeSec;
      if (s.bestMoves == null || moves < s.bestMoves) s.bestMoves = moves;
      s.totalUnlocked = this.getUnlocked().size;
      this.setStats(s);
    },

    getMuted() {
      return localStorage.getItem(KEY_MUTED) === "1";
    },
    setMuted(b) {
      localStorage.setItem(KEY_MUTED, b ? "1" : "0");
    },

    resetAll() {
      localStorage.removeItem(KEY_UNLOCKED);
      localStorage.removeItem(KEY_STATS);
    },
  };

  global.ZielnikStorage = Storage;
})(window);
