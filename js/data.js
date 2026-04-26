/* Data loader — fetch flowers.json with graceful fallback for file:// */
(function (global) {
  const URL_ = "data/flowers.json";

  async function load() {
    try {
      const res = await fetch(URL_);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const list = await res.json();
      return list;
    } catch (err) {
      console.error("Nie udało się wczytać flowers.json", err);
      const msg = "Nie udało się wczytać bazy kwiatów. Uruchom stronę przez serwer (np. `python3 -m http.server`) lub GitHub Pages — przeglądarki blokują fetch z file://";
      const div = document.createElement("div");
      div.style.cssText = "position:fixed;top:0;left:0;right:0;background:#7a2c1a;color:#fff;padding:14px;font-family:sans-serif;z-index:999;text-align:center";
      div.textContent = msg;
      document.body.appendChild(div);
      return [];
    }
  }

  function imageUrl(flower) {
    return "images/" + encodeURIComponent(flower.image_file);
  }

  global.ZielnikData = { load, imageUrl };
})(window);
