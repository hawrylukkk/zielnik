/* Menu screen — progress widget + mute + reset */
(async function () {
  const flowers = await ZielnikData.load();
  const total = flowers.length || 94;
  const unlocked = ZielnikStorage.getUnlocked().size;
  const stats = ZielnikStorage.getStats();
  const pct = total ? Math.round((unlocked / total) * 100) : 0;

  const panel = document.getElementById("progressPanel");
  panel.innerHTML = `
    <h3>Postęp w zielniku</h3>
    <div class="progress-bar"><div class="progress-bar__fill" style="width:${pct}%"></div></div>
    <div class="progress-meta">
      <span>${unlocked} / ${total} odkrytych</span>
      <span>${pct}%</span>
    </div>
    <div class="progress-meta" style="margin-top:10px">
      <span>Rozegrane partie: <strong>${stats.gamesPlayed}</strong></span>
      <span>${stats.bestTimeSec != null ? "Rekord: " + formatTime(stats.bestTimeSec) : ""}</span>
    </div>
  `;

  // Mute toggle
  const muteBtn = document.getElementById("muteToggle");
  function syncMute() {
    const muted = ZielnikStorage.getMuted();
    muteBtn.textContent = muted ? "🔇 Dźwięk: wyciszony" : "🔊 Dźwięk: włączony";
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  }
  syncMute();
  muteBtn.addEventListener("click", () => {
    ZielnikStorage.setMuted(!ZielnikStorage.getMuted());
    syncMute();
  });

  // Reset
  document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("Na pewno zresetować cały postęp? Tej operacji nie da się cofnąć.")) {
      ZielnikStorage.resetAll();
      location.reload();
    }
  });

  function formatTime(s) {
    const m = Math.floor(s / 60), r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }
})();
