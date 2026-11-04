# Wave Breathing

A static guided practice: an Introduction, then six parts (Posture, Breath, Mantra, Visualization, Integration, and Compassion and Thanks), with a choice of environment and avatar.

## Working copy and local preview

- **Working directory:** `~/Desktop/kriya1_wb`
- **Start:** `python3 launch.py`, or `python3 launch.py --no-open` for agents. This runs the shared launcher in `../Wave_Breathing_Assets`, which serves the app and the separate Asset Studio together.
- **App:** http://127.0.0.1:8766/app/. **Studio:** http://127.0.0.1:8766/studio/
- Check `http://127.0.0.1:8766/api/workspace`: it should report `wave-breathing-local-v1` and this repository's `public` folder. Don't start a separate static server or use another port. Running the command again reuses the same workspace.
- **Tests:** `node --test tests/*.test.js`

## Entry point and source of truth

`public/index.html` is the app and is edited by hand. It loads `chooser.js`, `chooser.css`, `practice.css` and `environment.js` from the same folder. The Studio launcher expects these five files at the top of `public/`, so don't move them. Details are in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Active assets

- Avatars: `public/assets/avatars/` (Man, Boy, Girl stills and all thumbnails), plus `public/assets/female-*.svg` for the Woman's breath and posture frames
- Environments: `public/assets/environments/{grove,mountain,office}/` (day, night and thumbnails)
- Other practice art: `public/assets/grove.svg`, `babaji-mountain-v1.png`, `mantra-arrow-original.png`, `share-preview-v1.png` (link preview)
- Runtime and fonts: `public/assets/preview-bundle/`

Every file's size, transparency and roles: [docs/ASSETS.md](docs/ASSETS.md). How to add or replace an avatar or environment: [docs/EDITING.md](docs/EDITING.md).

## Do not regenerate

`public/index.html`, `public/assets/figures/`, and the other files the legacy pipeline wrote must **not** be regenerated. The Python scripts in `source/legacy-generators/` built the September 2026 page and would overwrite the current app with it. They are locked by a guard. See `source/legacy-generators/README.md`.

## How the folders relate

| Folder | Role |
| --- | --- |
| `public/` | The app as served locally and published by Netlify (publish directory `public`, no build). Also holds `figure-review.html`, an artwork review page for the registered figures. |
| `source/legacy-generators/` | Inactive generator pipeline. It produced earlier versions of `public/`. |
| `reference/` | Original exports and supplied artwork the generators read from. Not served. |
| `archive/` | Superseded pages (the last generated page and three early variants) kept for recovery |
| `docs/` | Architecture, asset manifest, editing guide, the 2 Nov 2026 audit with screenshots, and historical deployment notes |
| `tests/` | Checks of `environment.js` and the practice's progress rules, run against the shipped files |

## Publish

Netlify deploys GitHub branch `main` with publish directory `public`. Experiments stay on branches. Don't overwrite the production baseline with an unverified export. `docs/DEPLOYMENT.md` records the 15 Sep 2026 release and is historical. Don't commit credentials or local caches.
