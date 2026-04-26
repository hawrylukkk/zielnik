# 🌿 Zielnik — Memo Botaniczne

Piękna gra pamięciowa w stylu klasycznego pergaminowego zielnika. Łącz w pary kwiaty, aby odblokowywać je w **Zielniku** — encyklopedii w stylu Pokédexa, zawierającej 94 gatunki z polskimi i łacińskimi nazwami oraz informacjami o cyklu życia, glebie, słońcu i kwitnieniu.

## ✨ Funkcje

- 🌸 **Gra memo** — stała plansza 12 par (24 karty), karty poziome, animowany flip 3D.
- 📖 **Zielnik (Pokédex)** — lista 94 kwiatów, szczegółowa karta z opisem i piktogramami.
- 🔐 **Ścisły gating** — kwiat odblokowuje się **tylko po połączeniu pary w grze**.
- 💾 **Trwały postęp** — `localStorage`: odblokowane kwiaty, statystyki, wyciszenie.
- 🔊 **Dźwięki WOW** — combo-system: każdy kolejny nowo odblokowany kwiat w rundzie odpala mocniejszą fanfarę.
- 🪶 **Klasyczna estetyka** — pergamin, sepia, serify (Cormorant Garamond / EB Garamond).
- 🕊️ **Animacja przelotu** — po wygranej każda nowo odblokowana karta przelatuje do ikony zielnika w rogu.
- 🏅 **Pieczątki / osiągnięcia** — 12 achievementów (kolekcje, mistrz pamięci, błyskawica, combo…).
- 📱 **PWA / offline** — działa po dodaniu do ekranu głównego, cache obrazów i audio przez service worker.

## 🚀 Uruchomienie

Strona wymaga prostego serwera HTTP (przeglądarki blokują `fetch` dla `file://`):

```bash
python3 -m http.server 8000
# otwórz http://localhost:8000
```

## 📦 Wdrożenie na GitHub Pages

1. Stwórz repozytorium na GitHubie.
2. W folderze projektu:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:<user>/<repo>.git
   git push -u origin main
   ```
3. W repo: **Settings → Pages → Source: Deploy from branch → main / root**.
4. Po chwili strona dostępna pod `https://<user>.github.io/<repo>/`.

## 🗂️ Struktura

```
.
├── index.html          # menu główne
├── game.html           # gra memo
├── herbarium.html      # zielnik (Pokédex)
├── css/                # style
├── js/                 # logika
├── data/flowers.json   # baza 94 kwiatów (z flowers.xml)
├── assets/
│   ├── images/         # zdjęcia kwiatów + back.png (rewers karty)
│   └── audio/          # WAV-y (combo / cheers / start / exit)
├── tools/xml_to_json.py  # jednorazowa konwersja XML → JSON
└── ASSETS/, AUDIO/     # oryginalne źródła (zostawione dla referencji)
```

## 🔄 Aktualizacja danych

Jeżeli zmienisz `ASSETS/flowers.xml`, regeneruj JSON:

```bash
python3 tools/xml_to_json.py
```

## 📜 Licencja

MIT — patrz [LICENSE](LICENSE).

Zdjęcia kwiatów pochodzą z artykułu [bouqs.com](https://bouqs.com/blog/types-of-flowers-annual-perennial-biennial/) (źródło wskazane w `flowers.xml`).
