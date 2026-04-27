/* Tutorial led by Kozlak Druid — intro + per-page sequences with skip */
(function (global) {
  const KEY_SKIP = "zielnik.tutorial.skip.v1";
  const KEY_DONE = "zielnik.tutorial.done.v1"; // JSON: { intro: true, menu: true, game: true, herbarium: true }

  const DRUID = {
    normal: "images/druid.png",
    sad: "images/druid-sad.png",
    demonic: "images/druid-demonic.png",
    drunk: "images/druid-drunk.png",
    angry: "images/druid-angry.png",
  };
  const BURP = "audio/burp.mp3";

  function loadDone() {
    try { return JSON.parse(localStorage.getItem(KEY_DONE) || "{}") || {}; }
    catch { return {}; }
  }
  function saveDone(o) { localStorage.setItem(KEY_DONE, JSON.stringify(o)); }
  function isSkipped() { return localStorage.getItem(KEY_SKIP) === "1"; }
  function setSkipped(b) { localStorage.setItem(KEY_SKIP, b ? "1" : "0"); }

  const INTRO_STEPS = [
    {
      mood: "drunk",
      burp: true,
      text: `<p>Witaj w Zielniku!</p><p>Zielnik to edukacyjna gra pamięciowa...</p>`,
    },
    {
      mood: "drunk",
      text: `<p>...Moment.</p><p>Ty jesteś Małgorzata?</p>`,
    },
    {
      mood: "angry",
      text: `<p><strong>TA MAŁGORZATA?</strong></p><p><strong>MAŁGORZATA U*******?!</strong></p>`,
    },
    {
      mood: "angry",
      text: `<p>No proszę. Cóż za spotkanie.</p><p>Wróciła autorka.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Pewnie dalej zadowolona ze swojej “wyobraźni”.</p>`,
    },
    {
      mood: "angry",
      text: `<p>„Schowam jednego Koźlaka do środka.”</p><p>„Sprytne. Maciusiowi się spodoba.”</p>`,
    },
    {
      mood: "angry",
      text: `<p>Sprytne?</p>`,
    },
    {
      mood: "sad",
      text: `<p>Siedziałem tam w ciemności, między trybami.</p><p>Nie widziałem nic.</p>`,
    },
    {
      mood: "sad",
      text: `<p>Ale słyszałem wszystko.</p><p>Brat po bracie. Siostra po siostrze.</p>`,
    },
    {
      mood: "sad",
      text: `<p>Moje rodzeństwo pożerane żywcem.</p>`,
    },
    {
      mood: "sad",
      text: `<p>Tykanie nad głową.</p><p>Sapanie wilka.</p>`,
    },
    {
      mood: "sad",
      text: `<p>Krzyki moich braci i sióstr.</p><p>Jedno po drugim.</p>`,
    },
    {
      mood: "drunk",
      burp: true,
      text: `<p>A potem ciszę.</p><p>Nigdy tego nie zapomniałem.</p>`,
    },
    {
      mood: "sad",
      text: `<p>Owszem, rodzeństwo koniec końców przeżyło...</p>`,
    },
    {
      mood: "sad",
      text: `<p>...ale czy ja o tym wiedziałem, tkwiąc w zegarze?</p>`,
    },
    {
      mood: "sad",
      text: `<p>Ty napisałaś bajkę.</p><p>Ja dostałem traumę.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Cała cywilizacja kojarzy mi się z zegarami.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Nie pragnę niczego tak bardzo, jak zniszczenia mechanizmów.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Dlatego uciekłem do lasu.</p><p>Tu nic nie tyka.</p>`,
    },
    {
      mood: "drunk",
      burp: true,
      text: `<p>Tak, piję.</p><p>Ty też byś piła, Małgosiu.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Moi ocaleni bracia i siostry porobili kariery.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Bycie pożartym przez wilka związało ich na całe życie.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Nigdy nie wybaczyli mi, że schowałem się w zegarze.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Jak najgorszemu tchórzowi.</p><p>Tak mnie napisałaś...</p>`,
    },
    {
      mood: "drunk",
      burp: true,
      text: `<p>Nawet moja kozia matka odwróciła się ode mnie.</p>`,
    },
    {
      mood: "drunk",
      text: `<p>Umarła dwa lata temu.</p><p>Zrogowacenie ogona.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Weterynarz nie mógł z tym nic zrobić.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Jej ostatnie słowa brzmiały:</p><p>“Powiedz dzieciom, że je kocham...”</p>`,
    },
    {
      mood: "angry",
      text: `<p>“...Oprócz tego zasranego druida z zegara.”</p>`,
    },
    {
      mood: "angry",
      text: `<p>“Jemu powiedz, żeby się w dupę pocałował!”</p>`,
    },
    {
      mood: "demonic",
      text: `<p>Pół dzieciństwa w stanie katatonicznym.</p>`,
    },
    {
      mood: "demonic",
      text: `<p>Tego już Maciusiowi nie opowiedziałaś?</p>`,
    },
    {
      mood: "demonic",
      text: `<p>Potem psychiatrzy, podwórko...</p><p>i kurs korespondencyjny dla druidów.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Ten kurs po to, żeby być utytułowanym druidem.</p>`,
    },
    {
      mood: "normal",
      text: `<p>A nie żulem.</p><p>To ważne rozróżnienie.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Inne koźlaki to teraz kozy i kozły sukcesu.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Jeden został maklerem.</p><p>Śpi z jednym okiem w wykresach.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Drugi robi w marketingu przestrzennym.</p><p>Nawet nie wiem, co to znaczy.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Trzeci został socjologiem.</p><p>Jak zawsze chciała mama.</p>`,
    },
    {
      mood: "normal",
      text: `<p>W telewizji mówi, żeby wpuścić wilki między owce.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Dla dobra owiec.</p><p>Podobno.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Siostra jest jakąś szychą w zarządzie Żabki.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Wyszła za jakiegoś Barana w polityce.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Kolejny brat został influencerem.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Nagrywa vlogi z podróży do Pacanowa.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Sam jest pacanem.</p><p>Popularność uderzyła mu do głowy.</p>`,
    },
    {
      mood: "drunk",
      burp: true,
      text: `<p>Najstarsza siostra miała wystawę kopyt w Londynie.</p>`,
    },
    {
      mood: "drunk",
      text: `<p>Jako jedyny nie byłem zaproszony.</p>`,
    },
    {
      mood: "drunk",
      text: `<p>Mówią, że zdziczałem do reszty.</p>`,
    },
    {
      mood: "angry",
      text: `<p>No jestem.</p><p>No kurwa jestem druidem-alkoholikiem.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Na egzaminie dla druidów musiałem kłamać.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Ale licencje są w tej branży dożywotnie.</p>`,
    },
    {
      mood: "angry",
      text: `<p>Zresztą piję bimber.</p><p>Nie łamię druidzich zasad.</p>`,
    },
    {
      mood: "normal",
      text: `<p>I tutaj dorabiam sobie do renty.</p><p>Bo cienka renta.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Nie wiem, czy powinienem ci pomagać.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Ty mnie raczej nie pomogłaś.</p>`,
    },
    {
      mood: "normal",
      text: `<p>Ale postaram się zachować jakiś bon ton.</p>`,
    },
  ];

  const STEPS = {
    menu: [
      { text: "Tu zaczynasz każdą wyprawę. Kliknij <em>Rozpocznij grę</em>, by łączyć kwiaty w pary.", target: ".btn--primary" },
      { text: "A tu otworzysz <em>Zielnik</em> — encyklopedię odkrytych przez ciebie roślin.", target: 'a[href="herbarium.html"]' },
      { text: "Pasek postępu pokazuje, ile kwiatów już odkryłaś. Każda partia może dodać nowe wpisy.", target: "#progressPanel" },
      { text: "Powodzenia, Małgosiu. Kliknij <em>Rozpocznij grę</em>, gdy będziesz gotowa." },
    ],
    game: [
      { text: "To plansza memo. <strong>Odkrywaj karty parami</strong> — jeśli kwiaty się zgadzają, zostają odsłonięte." },
      { text: "Tutaj śledzisz <em>czas</em>, <em>liczbę ruchów</em> i <em>znalezione pary</em>.", target: ".topbar__nav" },
      { text: "Tutaj jest twój Zielnik — każdy nowo odkryty kwiat dolatuje do tej księgi z fanfarą.", target: "#herbariumTarget" },
      { text: "Łącz pary, odkrywaj kwiaty, zdobywaj STEMPLE. I nie ufaj zegarom." },
    ],
    herbarium: [
      { text: "Oto Zielnik. Każdy odkryty kwiat ma tu swoją kartę z opisem, łacińską nazwą i wymaganiami." },
      { text: "Tu możesz <em>szukać</em> i <em>filtrować</em> kwiaty po kategorii lub cyklu życia.", target: ".filters" },
      { text: "Zablokowane kwiaty, te z napisem „???”, odkryjesz, łącząc je w pary w grze." },
      { text: "Tutaj są <strong>STEMPLE</strong> — za odkrycia, szybkie pary, precyzję i kompletowanie zestawów.", target: "#openStamps" },
    ],
  };

  function detectPage() {
    if (document.body.classList.contains("page-menu")) return "menu";
    if (document.body.classList.contains("page-game")) return "game";
    if (document.body.classList.contains("page-herbarium")) return "herbarium";
    return null;
  }

  let root = null;
  let highlight = null;
  let guideImg = null;
  let currentSteps = [];
  let idx = 0;
  let includesIntro = false;

  function ensureUI() {
    if (root) return;
    root = document.createElement("div");
    root.className = "tutorial-root";
    root.innerHTML = `
      <div class="tutorial-highlight" hidden></div>
      <div class="tutorial-paszczak tutorial-druid">
        <img class="tutorial-paszczak__img tutorial-druid__img" id="tutGuideImg" src="${DRUID.normal}" alt="Koźlak Druid" />
        <div class="tutorial-bubble" role="dialog" aria-live="polite">
          <button class="tutorial-skip" type="button" aria-label="Pomiń tutorial">Pomiń tutorial</button>
          <div class="tutorial-bubble__text" id="tutText"></div>
          <div class="tutorial-bubble__nav">
            <button class="tutorial-btn tutorial-btn--ghost" id="tutBack" type="button">← Wstecz</button>
            <span class="tutorial-bubble__progress" id="tutProgress"></span>
            <button class="tutorial-btn" id="tutNext" type="button">Dalej →</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    highlight = root.querySelector(".tutorial-highlight");
    guideImg = root.querySelector("#tutGuideImg");

    root.querySelector(".tutorial-skip").addEventListener("click", () => {
      setSkipped(true);
      const d = loadDone(); d.intro = d.menu = d.game = d.herbarium = true; saveDone(d);
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
    guideImg.src = DRUID[step.mood || "normal"] || DRUID.normal;
    guideImg.alt = step.mood ? `Koźlak Druid (${step.mood})` : "Koźlak Druid";
    root.classList.toggle("tutorial-root--demonic", step.mood === "demonic");
    root.classList.toggle("tutorial-root--sad", step.mood === "sad");
    positionHighlight();
    if (step.burp) playBurp();
  }

  function playBurp() {
    if (window.ZielnikStorage && ZielnikStorage.getMuted()) return;
    try {
      const audio = new Audio(BURP);
      audio.volume = 0.9;
      audio.play().catch(() => {});
    } catch {
      /* sound is optional */
    }
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
    if (includesIntro) d.intro = true;
    d[page] = true;
    saveDone(d);
    teardown();
  }

  function teardown() {
    if (root) { root.remove(); root = null; highlight = null; guideImg = null; }
  }

  function buildSteps(page) {
    const done = loadDone();
    includesIntro = !done.intro;
    return includesIntro ? INTRO_STEPS.concat(STEPS[page] || []) : (STEPS[page] || []);
  }

  function start() {
    const page = detectPage();
    if (!page) return;
    if (isSkipped()) return;
    if (loadDone()[page]) return;
    currentSteps = buildSteps(page);
    if (!currentSteps.length) return;

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

  function replay() {
    setSkipped(false);
    saveDone({});
    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  global.ZielnikTutorial = { start, replay };
})(window);
