/* Achievements / pieczątki — earned by gameplay */
(function (global) {
  const KEY = "zielnik.achievements.v1";

  /**
   * Each achievement has:
   *   id, icon, name, description,
   *   test(ctx) -> boolean   (ctx: { flowers, unlocked: Set, round })
   * round may be null when checking from herbarium page.
   */
  const ALL = [
    {
      id: "first-bloom",
      icon: "🌱",
      name: "Pierwszy kwiat",
      description: "Odblokuj swój pierwszy kwiat.",
      test: ({ unlocked }) => unlocked.size >= 1,
    },
    {
      id: "bouquet",
      icon: "💐",
      name: "Bukiet",
      description: "Odblokuj 10 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 10,
    },
    {
      id: "garden",
      icon: "🌷",
      name: "Ogród",
      description: "Odblokuj 30 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 30,
    },
    {
      id: "botanist",
      icon: "🔬",
      name: "Botanik",
      description: "Odblokuj 60 kwiatów.",
      test: ({ unlocked }) => unlocked.size >= 60,
    },
    {
      id: "master",
      icon: "👑",
      name: "Mistrz Zielnika",
      description: "Odblokuj wszystkie kwiaty.",
      test: ({ unlocked, flowers }) => flowers.length > 0 && unlocked.size >= flowers.length,
    },
    {
      id: "flawless",
      icon: "✨",
      name: "Bez pomyłki",
      description: "Ukończ rundę dokładnie 12 ruchami (bez ani jednej pomyłki).",
      test: ({ round }) => round && round.moves === round.pairs,
    },
    {
      id: "sharp-mind",
      icon: "🧠",
      name: "Mistrz pamięci",
      description: "Ukończ rundę w nie więcej niż 16 ruchach.",
      test: ({ round }) => round && round.moves <= 16,
    },
    {
      id: "lightning",
      icon: "⚡",
      name: "Błyskawica",
      description: "Ukończ rundę w mniej niż 60 sekund.",
      test: ({ round }) => round && round.timeSec < 60,
    },
    {
      id: "combo-5",
      icon: "🔥",
      name: "Combo botaniczne",
      description: "Odblokuj 5 nowych kwiatów w jednej rundzie.",
      test: ({ round }) => round && round.newUnlocks >= 5,
    },
    {
      id: "set-cut",
      icon: "✂",
      name: "Kolekcjoner: kwiaty cięte",
      description: "Odblokuj wszystkie kwiaty z kategorii „Kwiaty cięte".",
      test: ({ unlocked, flowers }) => allCategoryUnlocked(flowers, unlocked, "category", "Kwiaty cięte"),
    },
    {
      id: "set-wild",
      icon: "🌾",
      name: "Kolekcjoner: kwiaty dzikie",
      description: "Odblokuj wszystkie kwiaty z kategorii „Kwiaty dzikie".",
      test: ({ unlocked, flowers }) => allCategoryUnlocked(flowers, unlocked, "category", "Kwiaty dzikie"),
    },
    {
      id: "set-annual",
      icon: "🗓",
      name: "Kolekcjoner: jednoroczne",
      description: "Odblokuj wszystkie kwiaty jednoroczne.",
      test: ({ unlocked, flowers }) => allCategoryUnlocked(flowers, unlocked, "lifecycle", "Kwiaty jednoroczne"),
    },
  ];

  function allCategoryUnlocked(flowers, unlocked, key, value) {
    const subset = flowers.filter((f) => f[key] === value);
    if (!subset.length) return false;
    return subset.every((f) => unlocked.has(f.name));
  }

  function loadEarned() {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(arr) ? arr : []);
    } catch { return new Set(); }
  }
  function saveEarned(set) {
    localStorage.setItem(KEY, JSON.stringify([...set]));
  }

  /** Check all achievements. Returns array of newly-earned ones. */
  function check(ctx) {
    const earned = loadEarned();
    const newly = [];
    ALL.forEach((a) => {
      if (earned.has(a.id)) return;
      try {
        if (a.test({ flowers: ctx.flowers, unlocked: ctx.unlocked, round: ctx.rounds })) {
          earned.add(a.id);
          newly.push(a);
        }
      } catch { /* test errors ignored */ }
    });
    if (newly.length) saveEarned(earned);
    return newly;
  }

  function getEarned() { return loadEarned(); }
  function getAll() { return ALL.slice(); }

  global.ZielnikAchievements = { check, getEarned, getAll };
})(window);
