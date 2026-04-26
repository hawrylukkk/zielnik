/* STEMPLE — osiągnięcia zdobywane w grze i pokazywane w Zielniku */
(function (global) {
  const KEY = "zielnik.stamps.v1";
  const LEGACY_KEY = "zielnik.achievements.v1";

  const STEMPLE = [
    {
      id: "first-bloom",
      icon: "🌱",
      group: "Odkrywanie",
      name: "Pierwszy okaz",
      description: "Odblokuj pierwszy kwiat w Zielniku.",
      test: ({ unlocked }) => unlocked.size >= 1,
    },
    {
      id: "small-pressing",
      icon: "☘️",
      group: "Odkrywanie",
      name: "Mała prasa",
      description: "Odblokuj 5 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 5,
    },
    {
      id: "bouquet",
      icon: "💐",
      group: "Odkrywanie",
      name: "Bukiet",
      description: "Odblokuj 10 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 10,
    },
    {
      id: "meadow",
      icon: "🌼",
      group: "Odkrywanie",
      name: "Łąka",
      description: "Odblokuj 20 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 20,
    },
    {
      id: "garden",
      icon: "🌷",
      group: "Odkrywanie",
      name: "Ogród",
      description: "Odblokuj 30 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 30,
    },
    {
      id: "botanist",
      icon: "🔬",
      group: "Odkrywanie",
      name: "Botanik",
      description: "Odblokuj 60 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 60,
    },
    {
      id: "master",
      icon: "👑",
      group: "Odkrywanie",
      name: "Mistrz Zielnika",
      description: "Odblokuj wszystkie kwiaty.",
      test: ({ unlocked, flowers }) => flowers.length > 0 && unlocked.size >= flowers.length,
    },
    {
      id: "first-round",
      icon: "📖",
      group: "Runda",
      name: "Pierwsza karta",
      description: "Ukończ pierwszą rundę memo.",
      test: ({ round }) => Boolean(round && round.completed),
    },
    {
      id: "quick-first-pair",
      icon: "⏱️",
      group: "Tempo",
      name: "Szybki start",
      description: "Znajdź pierwszą parę w czasie 10 sekund.",
      test: ({ round }) => Boolean(round && round.firstPairSec != null && round.firstPairSec <= 10),
    },
    {
      id: "three-pairs-30",
      icon: "⏳",
      group: "Tempo",
      name: "Trzy w pół minuty",
      description: "Odkryj 3 kolejne pary w czasie 30 sekund.",
      test: ({ round }) => Boolean(round && bestWindow(round.pairIntervals, 3) <= 30),
    },
    {
      id: "six-pairs-70",
      icon: "⚙️",
      group: "Tempo",
      name: "Rytm zielnika",
      description: "Odkryj 6 kolejnych par w czasie 70 sekund.",
      test: ({ round }) => Boolean(round && bestWindow(round.pairIntervals, 6) <= 70),
    },
    {
      id: "lightning",
      icon: "⚡",
      group: "Tempo",
      name: "Błyskawica",
      description: "Ukończ rundę w mniej niż 60 sekund.",
      test: ({ round }) => Boolean(round && round.timeSec < 60),
    },
    {
      id: "swift-round",
      icon: "🕯️",
      group: "Tempo",
      name: "Szybka ekspedycja",
      description: "Ukończ rundę w mniej niż 90 sekund.",
      test: ({ round }) => Boolean(round && round.timeSec < 90),
    },
    {
      id: "flawless",
      icon: "✨",
      group: "Precyzja",
      name: "Bez pomyłki",
      description: "Ukończ rundę dokładnie 12 ruchami.",
      test: ({ round }) => Boolean(round && round.moves === round.pairs),
    },
    {
      id: "sharp-mind",
      icon: "🧠",
      group: "Precyzja",
      name: "Mistrz pamięci",
      description: "Ukończ rundę w nie więcej niż 16 ruchach.",
      test: ({ round }) => Boolean(round && round.moves <= 16),
    },
    {
      id: "steady-hand",
      icon: "🖋️",
      group: "Precyzja",
      name: "Pewna ręka",
      description: "Ukończ rundę w nie więcej niż 20 ruchach.",
      test: ({ round }) => Boolean(round && round.moves <= 20),
    },
    {
      id: "combo-3",
      icon: "🌸",
      group: "Odkrywanie",
      name: "Nowa wiązanka",
      description: "Odblokuj 3 nowe kwiaty w jednej rundzie.",
      test: ({ round }) => Boolean(round && round.newUnlocks >= 3),
    },
    {
      id: "combo-5",
      icon: "🔥",
      group: "Odkrywanie",
      name: "Combo botaniczne",
      description: "Odblokuj 5 nowych kwiatów w jednej rundzie.",
      test: ({ round }) => Boolean(round && round.newUnlocks >= 5),
    },
    {
      id: "full-specimen-page",
      icon: "📚",
      group: "Odkrywanie",
      name: "Pełna karta okazów",
      description: "Odblokuj 12 nowych kwiatów w jednej rundzie.",
      test: ({ round }) => Boolean(round && round.newUnlocks >= 12),
    },
    {
      id: "set-cut",
      icon: "✂️",
      group: "Kolekcje",
      name: "Zestaw: kwiaty cięte",
      description: "Odblokuj wszystkie kwiaty z kategorii „Kwiaty cięte”.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "category", "Kwiaty cięte"),
    },
    {
      id: "set-wild",
      icon: "🌾",
      group: "Kolekcje",
      name: "Zestaw: kwiaty dzikie",
      description: "Odblokuj wszystkie kwiaty z kategorii „Kwiaty dzikie”.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "category", "Kwiaty dzikie"),
    },
    {
      id: "set-garden",
      icon: "🏡",
      group: "Kolekcje",
      name: "Zestaw: ogród",
      description: "Odblokuj wszystkie kwiaty z kategorii „Kwiaty do ogrodu”.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "category", "Kwiaty do ogrodu"),
    },
    {
      id: "set-annual",
      icon: "🗓️",
      group: "Kolekcje",
      name: "Zestaw: jednoroczne",
      description: "Odblokuj wszystkie kwiaty jednoroczne.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "lifecycle", "Kwiaty jednoroczne"),
    },
    {
      id: "set-perennial",
      icon: "🌿",
      group: "Kolekcje",
      name: "Zestaw: wieloletnie",
      description: "Odblokuj wszystkie kwiaty wieloletnie.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "lifecycle", "Kwiaty wieloletnie"),
    },
    {
      id: "set-biennial",
      icon: "🌙",
      group: "Kolekcje",
      name: "Zestaw: dwuletnie",
      description: "Odblokuj wszystkie kwiaty dwuletnie.",
      test: ({ unlocked, flowers }) => allUnlocked(flowers, unlocked, "lifecycle", "Kwiaty dwuletnie"),
    },
  ];

  function allUnlocked(flowers, unlocked, key, value) {
    const subset = flowers.filter((f) => f[key] === value);
    return subset.length > 0 && subset.every((f) => unlocked.has(f.name));
  }

  function bestWindow(values, count) {
    if (!Array.isArray(values) || values.length < count) return Infinity;
    let best = Infinity;
    for (let i = 0; i <= values.length - count; i++) {
      const sum = values.slice(i, i + count).reduce((acc, n) => acc + n, 0);
      best = Math.min(best, sum);
    }
    return best;
  }

  function readSet(key) {
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  function loadEarned() {
    const earned = readSet(KEY);
    readSet(LEGACY_KEY).forEach((id) => earned.add(id));
    return earned;
  }

  function saveEarned(set) {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  }

  function normalizeContext(ctx) {
    return {
      flowers: ctx.flowers || [],
      unlocked: ctx.unlocked || new Set(),
      round: ctx.round || ctx.rounds || null,
    };
  }

  function check(ctx) {
    const normalized = normalizeContext(ctx || {});
    const earned = loadEarned();
    const newly = [];
    STEMPLE.forEach((stamp) => {
      if (earned.has(stamp.id)) return;
      try {
        if (stamp.test(normalized)) {
          earned.add(stamp.id);
          newly.push(stamp);
        }
      } catch {
        /* Invalid stamp tests are ignored so one bad definition does not break gameplay. */
      }
    });
    if (newly.length) saveEarned(earned);
    return newly;
  }

  function getEarned() { return loadEarned(); }
  function getAll() { return STEMPLE.slice(); }
  function getProgress() {
    const earned = getEarned();
    return { earned: earned.size, total: STEMPLE.length };
  }

  const api = { check, getEarned, getAll, getProgress };
  global.ZielnikStemple = api;
  global.ZielnikAchievements = api;
})(window);
