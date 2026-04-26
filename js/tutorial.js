/* Tutorial led by Pan Paszczak — per-page sequences with skip */
(function (global) {
  const KEY_SKIP = "zielnik.tutorial.skip.v1";
  const KEY_DONE = "zielnik.tutorial.done.v1"; // JSON: { menu: true, game: true, herbarium: true }

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(KEY_DONE) || "{}") || {}; }
    catch { return {}; }
  }
  function saveDone(o) { localStorage.setItem(KEY_DONE, JSON.stringify(o)); }
  function isSkipped() { return localStorage.getItem(KEY_SKIP) === "1"; }
  function setSkipped(b) { localStorage.setItem(KEY_SKIP, b ? "1" : "0"); }

  // Steps per page. Each: { text, target?: selector, position?: 'auto'|'top'|... }
  const STEPS = {
    menu: [
      { text: "Witaj! Jestem <strong>Pan Paszczak</strong> — twój przewodnik po Zielniku. Pokażę ci, jak korzystać z tej księgi pełnej kwiatów." },
      { text: "Tutaj zaczynasz każdą wyprawę. Kliknij <em>Rozpocznij grę</em>, by łączyć kwiaty w pary.", target: ".btn--primary" },
      { text: "A tu otworzysz <em>Zielnik</em> — encyklopedię odkrytych przez ciebie roślin.", target: 'a[href="herbarium.html"]' },
      { text: "Pasek postępu pokazuje, ile kwiatów już odkryłeś. Każda partia może dodać nowe wpisy.", target: "#progressPanel" },
      { text: "Powodzenia, młody botaniku! Kliknij <em>Rozpocznij grę</em>, gdy będziesz gotów." },
    ],
    game: [
      { text: "To plansza memo. <strong>Odkrywaj karty parami</strong> — jeśli kwiaty się zgadzają, zostają odsłonięte." },
      { text: "Tutaj śledzisz <em>czas</em>, <em>liczbę ruchów</em> i <em>znalezione pary</em>.", target: ".topbar__nav" },
      { text: "Tutaj jest twój zielnik — każdy nowo odkryty kwiat dolatuje do tej księgi z fanfarą!", target: "#herbariumTarget" },
      { text: "Łącz pary, odkrywaj kwiaty, zdobywaj pieczątki. Powodzenia!" },
    ],
    herbarium: [
      { text: "Oto Zielnik! Każdy odkryty kwiat ma tu swoją kartę z opisem, łacińską nazwą i wymaganiami." },
      { text: "Tu możesz <em>szukać</em> i <em>filtrować</em> kwiaty po kategorii lub cyklu życia.", target: ".filters" },
      { text: "Zablokowane kwiaty (z napisem „???”) odkryjesz, łącząc je w pary w grze." },
      { text: "Pamiętaj o <strong>pieczątkach</strong> — zdobywasz je za osiągnięcia botaniczne!", target: "#openStamps" },
    ],
  };

  function detectPage() {
    if (document.body.classList.contains("page-menu")) return "menu";
    if (document.body.classList.contains("page-game")) return "game";
    if (document.body.classList.contains("page-herbarium")) return "herbarium";
    return null;
  }

  let root = null;
  let bubble = null;
  let highlight = null;
  let currentSteps = [];
  let idx = 0;

  function ensureUI() {
    if (root) return;
    root = document.createElement("div");
    root.className = "tutorial-root";
    root.innerHTML = `
      <div class="tutorial-highlight" hidden></div>
      <div class="tutorial-paszczak">
        <img class="tutorial-paszczak__img" src="images/paszczak.webp" alt="Pan Paszczak" />
      </div>
      <div class="tutorial-bubble" role="dialog" aria-live="polite">
        <button class="tutorial-skip" type="button" aria-label="Pomiń tutorial">Pomiń tutorial</button>
        <div class="tutorial-bubble__text" id="tutText"></div>
        <div class="tutorial-bubble__nav">
          <button class="tutorial-btn tutorial-btn--ghost" id="tutBack" type="button">← Wstecz</button>
          <span class="tutorial-bubble__progress" id="tutProgress"></span>
          <button class="tutorial-btn" id="tutNext" type="button">Dalej →</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    bubble = root.querySelector(".tutorial-bubble");
    highlight = root.querySelector(".tutorial-highlight");

    root.querySelector(".tutorial-skip").addEventListener("click", () => {
      setSkipped(true);
      const d = loadDone(); d.menu = d.game = d.herbarium = true; saveDone(d);
      teardown();
    });
    root.querySelector("#tutBack").addEventListener("click", () => { if (idx > 0) { idx--; renderStep(); } });
    root.querySelector("#tutNext").addEventListener("click", () => {
      if (idx < currentSteps.length - 1) { idx++; renderStep(); }
      else finishPage();
    });

    window.addEventListener("resize", () => { if (root && !root.classList.contains("is-hidden")) positionHighlight(); });
    window.addEventListener("scroll", () => { if (root && !root.classList.contains("is-hidden")) positionHighlight(); }, { passive: true });
  }

  function renderStep() {
    const step = currentSteps[idx];
    document.getElementById("tutText").innerHTML = step.text;
    document.getElementById("tutProgress").textContent = `${idx + 1} / ${currentSteps.length}`;
    document.getElementById("tutBack").disabled = idx === 0;
    document.getElementById("tutNext").textContent = idx === currentSteps.length - 1 ? "Zaczynamy!" : "Dalej →";
    positionHighlight();
  }

  function positionHighlight() {
    const step = currentSteps[idx];
    if (!step.target) { highlight.hidden = true; return; }
    const el = document.querySelector(step.target);
    if (!el) { highlight.hidden = true; return; }
    const r = el.getBoundingClientRect();
    const pad = 8;
    highlight.hidden = false;
    highlight.style.left = (r.left - pad) + "px";
    highlight.style.top = (r.top - pad) + "px";
    highlight.style.width = (r.width + pad * 2) + "px";
    highlight.style.height = (r.height + pad * 2) + "px";
  }

  function finishPage() {
    const page = detectPage();
    const d = loadDone();
    d[page] = true;
    saveDone(d);
    teardown();
  }

  function teardown() {
    if (root) { root.remove(); root = null; bubble = null; highlight = null; }
  }

  function start() {
    const page = detectPage();
    if (!page) return;
    if (isSkipped()) return;
    if (loadDone()[page]) return;
    currentSteps = STEPS[page] || [];
    if (!currentSteps.length) return;

    // Wait for the herbarium book cover to be opened before starting the tour
    if (page === "herbarium") {
      const cover = document.getElementById("bookCover");
      if (cover && !cover.hidden) {
        const obs = new MutationObserver(() => {
          if (cover.hidden) {
            obs.disconnect();
            setTimeout(launch, 300);
          }
        });
        obs.observe(cover, { attributes: true, attributeFilter: ["hidden"] });
        return;
      }
    }
    launch();
  }
  function launch() {
    idx = 0;
    ensureUI();
    renderStep();
  }

  // Public: replay (called from "Pokaż tutorial" button in menu)
  function replay() {
    setSkipped(false);
    saveDone({});
    start();
  }

  // Auto-start when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  global.ZielnikTutorial = { start, replay };
})(window);
