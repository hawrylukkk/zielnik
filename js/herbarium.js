/* Herbarium / Pokédex */
(async function () {
  const flowers = await ZielnikData.load();
  const listEl = document.getElementById("flowerList");
  const detailEl = document.getElementById("detail");
  const progressLabel = document.getElementById("progressLabel");
  const searchInput = document.getElementById("searchInput");
  const filterCategory = document.getElementById("filterCategory");
  const filterLifecycle = document.getElementById("filterLifecycle");
  const filterUnlocked = document.getElementById("filterUnlocked");

  // Sort alphabetically by Polish locale
  flowers.sort((a, b) => a.name.localeCompare(b.name, "pl"));

  populateFilter(filterCategory, uniqueValues("category"));
  populateFilter(filterLifecycle, uniqueValues("lifecycle"));

  let activeName = null;

  function uniqueValues(key) {
    return [...new Set(flowers.map((f) => f.category && f[key]).filter(Boolean))].sort((a,b) => a.localeCompare(b, "pl"));
  }

  function populateFilter(sel, values) {
    values.forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    });
  }

  function render() {
    const unlocked = ZielnikStorage.getUnlocked();
    const q = searchInput.value.trim().toLowerCase();
    const fc = filterCategory.value;
    const fl = filterLifecycle.value;
    const onlyUnlocked = filterUnlocked.checked;

    listEl.innerHTML = "";
    let visible = 0;
    flowers.forEach((f) => {
      const isUnlocked = unlocked.has(f.name);
      if (onlyUnlocked && !isUnlocked) return;
      if (fc && f.category !== fc) return;
      if (fl && f.lifecycle !== fl) return;
      if (q) {
        const hay = (f.name + " " + (f.latin_name || "")).toLowerCase();
        if (!hay.includes(q)) return;
      }
      visible++;

      const li = document.createElement("li");
      li.className = "flower-item" + (isUnlocked ? "" : " is-locked") + (activeName === f.name ? " is-active" : "");
      li.setAttribute("role", "option");
      li.innerHTML = `
        <img class="flower-item__thumb" src="${ZielnikData.imageUrl(f)}" alt="" loading="lazy" />
        <div class="flower-item__text">
          <span class="flower-item__name">${isUnlocked ? escapeHtml(f.name) : "???"}</span>
          <span class="flower-item__sub">${isUnlocked ? "<em>" + escapeHtml(f.latin_name || "") + "</em>" : "kwiat nieodkryty"}</span>
        </div>
      `;
      li.addEventListener("click", () => {
        activeName = f.name;
        render();
        renderDetail(f, isUnlocked);
      });
      listEl.appendChild(li);
    });

    progressLabel.textContent = `${unlocked.size} / ${flowers.length}`;

    if (!visible) {
      const empty = document.createElement("li");
      empty.style.cssText = "padding:16px; color:var(--ink-faint); text-align:center; font-style:italic;";
      empty.textContent = "Brak wyników.";
      listEl.appendChild(empty);
    }
  }

  function renderDetail(f, isUnlocked) {
    if (!isUnlocked) {
      detailEl.innerHTML = `
        <div class="detail__placeholder">
          <div class="ornament">✦ ❦ ✦</div>
          <p>Ten kwiat jest jeszcze nieodkryty.<br />
          Wróć do gry, aby połączyć go w parę i odblokować jego kartę w zielniku.</p>
        </div>
      `;
      return;
    }
    detailEl.innerHTML = `
      <div class="detail__hero">
        <div>
          <div class="detail__image-frame">
            <img class="detail__image" src="${ZielnikData.imageUrl(f)}" alt="${escapeHtml(f.name)}" />
          </div>
          <div class="detail__caption">${escapeHtml(f.name)} — <em>${escapeHtml(f.latin_name || "")}</em></div>
        </div>
        <div>
          <h2 class="detail__title">${escapeHtml(f.name)}</h2>
          <p class="detail__latin"><em>${escapeHtml(f.latin_name || "")}</em></p>
          <div class="detail__stamps">
            ${f.category ? `<span class="stamp">${escapeHtml(f.category)}</span>` : ""}
            ${f.lifecycle ? `<span class="stamp">${escapeHtml(f.lifecycle)}</span>` : ""}
          </div>
          <div class="detail__icons">
            <div class="icon-card"><div class="icon-card__label">☀ Słońce</div><div class="icon-card__value">${escapeHtml(f.sun || "—")}</div></div>
            <div class="icon-card"><div class="icon-card__label">🌱 Gleba</div><div class="icon-card__value">${escapeHtml(f.soil_needs || "—")}</div></div>
            <div class="icon-card"><div class="icon-card__label">🌸 Kwitnienie</div><div class="icon-card__value">${escapeHtml(f.blooms_in || "—")}</div></div>
          </div>
        </div>
      </div>
      <div class="detail__divider">— ❦ —</div>
      <div class="detail__body">
        <p>${escapeHtml(f.basic_information || "")}</p>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }

  [searchInput, filterCategory, filterLifecycle, filterUnlocked].forEach((el) => {
    el.addEventListener("input", render);
    el.addEventListener("change", render);
  });

  // Re-check achievements when entering herbarium (covers collection-based ones)
  if (window.ZielnikAchievements) {
    ZielnikAchievements.check({ flowers, unlocked: ZielnikStorage.getUnlocked(), rounds: null });
  }

  // Stamps dialog
  const stampsDialog = document.getElementById("stampsDialog");
  const stampsGrid = document.getElementById("stampsGrid");
  document.getElementById("openStamps").addEventListener("click", () => {
    renderStamps();
    stampsDialog.hidden = false;
  });
  document.getElementById("closeStamps").addEventListener("click", () => { stampsDialog.hidden = true; });
  stampsDialog.addEventListener("click", (e) => { if (e.target === stampsDialog) stampsDialog.hidden = true; });

  function renderStamps() {
    if (!window.ZielnikAchievements) return;
    const earned = ZielnikAchievements.getEarned();
    const all = ZielnikAchievements.getAll();
    stampsGrid.innerHTML = all.map((a) => {
      const got = earned.has(a.id);
      return `
        <div class="stamp-card ${got ? "is-earned" : "is-locked"}">
          <div class="stamp-card__icon">${got ? a.icon : "🔒"}</div>
          <div class="stamp-card__name">${escapeHtml(a.name)}</div>
          <div class="stamp-card__desc">${escapeHtml(a.description)}</div>
        </div>
      `;
    }).join("");
  }

  render();
})();
