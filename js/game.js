/* Memo board logic — fixed 12 pairs (24 cards) */
(async function () {
  const PAIRS = 12;
  const FLIP_BACK_MS = 900;

  const flowers = await ZielnikData.load();
  if (flowers.length < PAIRS) return;

  const boardEl = document.getElementById("board");
  const statTime = document.getElementById("statTime");
  const statMoves = document.getElementById("statMoves");
  const statPairs = document.getElementById("statPairs");
  const muteBtn = document.getElementById("muteToggle");
  const winDialog = document.getElementById("winDialog");
  const toastStack = document.getElementById("toastStack");

  let state = null;

  function chooseFlowers() {
    const unlocked = ZielnikStorage.getUnlocked();
    const locked = flowers.filter((f) => !unlocked.has(f.name));
    const already = flowers.filter((f) => unlocked.has(f.name));
    // Bias toward locked: take up to PAIRS from locked first, fill rest from already.
    const lockedShuffled = shuffle(locked.slice());
    const alreadyShuffled = shuffle(already.slice());
    const picked = lockedShuffled.slice(0, PAIRS);
    while (picked.length < PAIRS) picked.push(alreadyShuffled[picked.length - lockedShuffled.length]);
    return picked.slice(0, PAIRS);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck(chosen) {
    const deck = [];
    chosen.forEach((f, i) => {
      deck.push({ pairId: i, flower: f, key: i + "a" });
      deck.push({ pairId: i, flower: f, key: i + "b" });
    });
    return shuffle(deck);
  }

  function startGame() {
    boardEl.innerHTML = "";
    const chosen = chooseFlowers();
    const deck = buildDeck(chosen);

    state = {
      deck,
      first: null,
      second: null,
      lock: false,
      moves: 0,
      matched: 0,
      startedAt: null,
      timerId: null,
      newUnlocks: 0,
      comboLevel: 0,
      newUnlockNames: [],
      newUnlockCards: [],
      pairTimes: [],
      pairIntervals: [],
      lastPairAtSec: 0,
    };

    deck.forEach((entry) => {
      const card = document.createElement("button");
      card.className = "card";
      card.type = "button";
      card.dataset.pair = entry.pairId;
      card.dataset.key = entry.key;
      card.innerHTML = `
        <div class="card__face card__face--back" aria-hidden="true"></div>
        <div class="card__face card__face--front">
          <div class="card__image" style="background-image:url('${ZielnikData.imageUrl(entry.flower)}')"></div>
          <div class="card__name">${escapeHtml(entry.flower.name)}</div>
        </div>
      `;
      card.addEventListener("click", () => onCardClick(card, entry));
      boardEl.appendChild(card);
    });

    updateHUD();
    updateHerbCount();
    ZielnikAudio.start();
  }

  function onCardClick(card, entry) {
    if (state.lock) return;
    if (card.classList.contains("is-flipped") || card.classList.contains("is-matched")) return;
    if (!state.startedAt) startTimer();

    card.classList.add("is-flipped");

    if (!state.first) {
      state.first = { card, entry };
      return;
    }
    state.second = { card, entry };
    state.moves += 1;
    updateHUD();

    if (state.first.entry.pairId === state.second.entry.pairId) {
      state.first.card.classList.add("is-matched");
      state.second.card.classList.add("is-matched");
      recordPairTiming();
      onMatched(state.second.entry.flower);
      state.first = null;
      state.second = null;
      state.matched += 1;
      if (state.matched === PAIRS) finish();
    } else {
      state.lock = true;
      setTimeout(() => {
        state.first.card.classList.remove("is-flipped");
        state.second.card.classList.remove("is-flipped");
        state.first = null;
        state.second = null;
        state.lock = false;
      }, FLIP_BACK_MS);
    }
  }

  function onMatched(flower) {
    const wasNew = ZielnikStorage.unlock(flower.name);
    if (!wasNew) return;

    state.newUnlocks += 1;
    state.comboLevel += 1;
    state.newUnlockNames.push(flower.name);
    state.newUnlockCards.push({
      cards: [state.first.card, state.second.card],
      flower,
    });

    ZielnikAudio.unlockCombo(state.comboLevel);

    [state.first, state.second].forEach((side) => {
      if (side) side.card.classList.add("is-new-unlock");
    });

    updateHerbCount();
    showToast(flower);
  }

  function recordPairTiming() {
    const now = elapsedSec();
    state.pairTimes.push(now);
    state.pairIntervals.push(now - state.lastPairAtSec);
    state.lastPairAtSec = now;
  }

  function updateHerbCount() {
    const el = document.getElementById("herbCount");
    if (el) el.textContent = String(ZielnikStorage.getUnlocked().size);
  }

  function flyCardsToHerbarium() {
    return new Promise((resolve) => {
      const target = document.getElementById("herbariumTarget");
      if (!target || !state.newUnlockCards.length) { resolve(); return; }
      const targetRect = target.getBoundingClientRect();
      const tx = targetRect.left + targetRect.width / 2;
      const ty = targetRect.top + targetRect.height / 2;

      let pulses = 0;
      state.newUnlockCards.forEach((entry, idx) => {
        // Use the front face of the first card to clone
        const src = entry.cards[0];
        const r = src.getBoundingClientRect();
        const clone = document.createElement("div");
        clone.className = "fly-card";
        clone.style.left = r.left + "px";
        clone.style.top = r.top + "px";
        clone.style.width = r.width + "px";
        clone.style.height = r.height + "px";
        clone.style.backgroundImage = `url('${ZielnikData.imageUrl(entry.flower)}')`;
        document.body.appendChild(clone);

        const dx = tx - (r.left + r.width / 2);
        const dy = ty - (r.top + r.height / 2);
        const rot = (Math.random() * 720 - 360).toFixed(0) + "deg";

        setTimeout(() => {
          clone.style.setProperty("--fly-dx", dx + "px");
          clone.style.setProperty("--fly-dy", dy + "px");
          clone.style.setProperty("--fly-rot", rot);
          clone.classList.add("is-flying");
        }, 80 + idx * 140);

        setTimeout(() => {
          target.classList.add("is-pulsing");
          setTimeout(() => target.classList.remove("is-pulsing"), 600);
          clone.remove();
          pulses++;
          if (pulses === state.newUnlockCards.length) resolve();
        }, 80 + idx * 140 + 1100);
      });

      // Safety timeout
      setTimeout(resolve, 80 + state.newUnlockCards.length * 140 + 1400);
    });
  }

  function showToast(flower) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `
      <img class="toast__thumb" src="${ZielnikData.imageUrl(flower)}" alt="" />
      <div>
        <div class="toast__title">🌸 Odblokowano: ${escapeHtml(flower.name)}</div>
        <div class="toast__sub"><em>${escapeHtml(flower.latin_name || "")}</em></div>
      </div>
    `;
    toastStack.appendChild(t);
    setTimeout(() => {
      t.classList.add("is-leaving");
      setTimeout(() => t.remove(), 400);
    }, 2800);
  }

  function startTimer() {
    state.startedAt = Date.now();
    state.timerId = setInterval(updateHUD, 250);
  }
  function elapsedSec() {
    return state.startedAt ? Math.floor((Date.now() - state.startedAt) / 1000) : 0;
  }
  function updateHUD() {
    statTime.textContent = formatTime(elapsedSec());
    statMoves.textContent = String(state.moves);
    statPairs.textContent = `${state.matched}/${PAIRS}`;
  }
  function formatTime(s) {
    const m = Math.floor(s / 60), r = s % 60;
    return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
  }

  async function finish() {
    const t = elapsedSec();
    clearInterval(state.timerId);
    ZielnikStorage.recordGame({ timeSec: t, moves: state.moves, newUnlocks: state.newUnlocks });

    // Check STEMPLE (returns newly earned)
    const newStamps = window.ZielnikStemple
      ? window.ZielnikStemple.check({
          flowers,
          unlocked: ZielnikStorage.getUnlocked(),
          round: {
            completed: true,
            timeSec: t,
            moves: state.moves,
            pairs: PAIRS,
            newUnlocks: state.newUnlocks,
            pairTimes: state.pairTimes.slice(),
            pairIntervals: state.pairIntervals.slice(),
            firstPairSec: state.pairTimes[0] ?? null,
          },
        })
      : [];

    await flyCardsToHerbarium();

    ZielnikAudio.cheers();
    document.getElementById("winTime").textContent = formatTime(t);
    document.getElementById("winMoves").textContent = String(state.moves);
    document.getElementById("winNew").textContent = String(state.newUnlocks);
    document.getElementById("winLead").textContent = state.newUnlocks > 0
      ? `Do zielnika trafiło ${state.newUnlocks} ${plural(state.newUnlocks, "nowy kwiat", "nowe kwiaty", "nowych kwiatów")}.`
      : "Wszystkie pary były już znane — wspaniała pamięć!";

    const achEl = document.getElementById("winAchievements");
    if (newStamps.length) {
      achEl.hidden = false;
      achEl.innerHTML = `<div class="ornament">— nowe stemple —</div>` +
        newStamps.map((a) =>
          `<div class="achievement-pill"><span class="achievement-pill__icon">${a.icon}</span><div><div class="achievement-pill__name">${a.name}</div><div class="achievement-pill__desc">${a.description}</div></div></div>`
        ).join("");
    } else {
      achEl.hidden = true;
      achEl.innerHTML = "";
    }

    winDialog.hidden = false;
  }

  function plural(n, one, few, many) {
    const a = n % 10, b = n % 100;
    if (n === 1) return one;
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
    return many;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  // Mute toggle
  function syncMute() {
    const m = ZielnikStorage.getMuted();
    muteBtn.textContent = m ? "🔇" : "🔊";
    muteBtn.setAttribute("aria-pressed", m ? "true" : "false");
  }
  syncMute();
  muteBtn.addEventListener("click", () => { ZielnikAudio.setMuted(!ZielnikStorage.getMuted()); syncMute(); });

  // Play again
  document.getElementById("playAgain").addEventListener("click", () => {
    winDialog.hidden = true;
    startGame();
  });

  startGame();
})();
