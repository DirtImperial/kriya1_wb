# Architecture

Wave Breathing is a static page with no build step. Netlify publishes `public/` (`netlify.toml`). Locally, the shared Studio launcher serves the same folder at http://127.0.0.1:8766/app/.

## Source of truth

| Concern | Edit this file | Notes |
| --- | --- | --- |
| Practice steps, wording, stage order, step layers, navigation | `public/index.html` | Hand-edited. The stage list and handlers are in the `<script type="text/x-dc">` block near the end. It is **not** regenerated from anything. |
| Opening screen, Appearance sheet, avatar swap, saved choice (`localStorage` key `wave-skin`) | `public/chooser.js`, `public/chooser.css` | |
| Practice layout and navigation styling | `public/practice.css` | |
| Environments, day/night choice, the background's position under the figure | `public/environment.js` | |
| Runtime (DC/React loader) and fonts | `public/assets/preview-bundle/b7d63beb-….js`, `*.woff2` | Extracted from the original export. Treat as vendor files. React 18.3.1 loads from unpkg. |
| Artwork | `public/assets/` | See [ASSETS.md](ASSETS.md). |

The Studio launcher (`../Wave_Breathing_Assets/launch.py`) hardcodes `kriya1_wb/public`, and its workspace fingerprint reads `index.html`, `chooser.js`, `chooser.css`, `practice.css` and `environment.js` at that folder's top level. Keep those five files there.

## Folder layout

```
public/                     the app, served as-is
  index.html chooser.js chooser.css practice.css environment.js
  figure-review.html        artwork review tool (needs to sit next to assets/)
  assets/                   all runtime, review and legacy assets (see ASSETS.md)
source/legacy-generators/   inactive Python pipeline that built index.html in Sept 2026
reference/                  original exports, storyboards and uploaded artwork
archive/                    superseded pages kept for recovery
docs/                       this documentation, the 2 Nov audit and screenshots
tests/                      node:test checks of environment.js and the practice script
launch.py                   shim that runs the shared Studio launcher
```

## Relationship between the parts

- **Reference → generators → app (historical).** In September 2026, `source/legacy-generators/process_figures.py` read `reference/original-netlify-index.html` and `reference/uploads/seating seqeunce.png`, wrote figure PNGs into `public/assets/figures/`, and wrote `public/index.html` and `public/transparent-preview.html`. Since then, `index.html` has been edited by hand (chooser, environments, avatars, practice navigation). The pipeline can no longer reproduce it and is locked; see `source/legacy-generators/README.md`.
- **Studio → app.** The Asset Studio is a separate project. Avatar and environment files are exported from it and copied into `public/assets/` by hand (see [EDITING.md](EDITING.md)). The Studio also serves this folder. This repository does not change the Studio.
- **Review tool.** `public/figure-review.html` shows the registered figures from `assets/figures/` over `assets/registered-landscape.png`. Its link opens the current app. It used to open `transparent-preview.html`, the generated preview that used these same figures, which is now in `archive/`.

## Old path → new path (cleanup of 4 Nov 2026)

All of these moves are exact renames. File contents are unchanged except where noted.

| Old path | New path |
| --- | --- |
| `public/transparent-preview.html` | `archive/transparent-preview.html` |
| `public/wave breathing - cosmic.dc.html` | `archive/dc-variants/wave breathing - cosmic.dc.html` |
| `public/wave breathing - pixel.dc.html` | `archive/dc-variants/wave breathing - pixel.dc.html` |
| `public/wave breathing - walkthrough.dc.html` | `archive/dc-variants/wave breathing - walkthrough.dc.html` |
| `public/support.js` | `archive/dc-variants/support.js` |
| `public/uploads/` (12 files) | `reference/uploads/` |
| `process_figures.py` | `source/legacy-generators/process_figures.py` (guard added, paths repaired) |
| `visualization_scene.py` | `source/legacy-generators/visualization_scene.py` (guard added, path repaired) |
| `chapter_structure.py`, `mantra_scene.py`, `solar_spiral.py`, `wave_loop.py` | `source/legacy-generators/` (unchanged) |
| `AUDIT.md` | `docs/AUDIT.md` |
| `DEPLOYMENT.md` | `docs/DEPLOYMENT.md` (historical banner added) |
| `audit-screenshots/` | `docs/audit-screenshots/` (still next to `AUDIT.md`, so its image links work unchanged) |
| `prototype-screenshots/` | `docs/prototype-screenshots/` |

Not moved: the five app files, `public/figure-review.html` (one link changed), all of `public/assets/`, `reference/original-netlify-index.html`, `reference/standalone-index.html`, `tests/`, `launch.py`, `netlify.toml`.

Outside this repository, the Studio's `pipeline/data/pipeline.json` and `pipeline/engine.py` still name `kriya1_wb/wave_loop.py` as the source of the figure-eight. That is provenance text only, and the file is now `source/legacy-generators/wave_loop.py`. The Studio was intentionally left unchanged.

## Viewing archived pages

Archived pages use relative paths (`./support.js`, `assets/...`) and won't render from `archive/`. Don't copy them back into `public/`. Build a throwaway folder instead:

```sh
tmp=$(mktemp -d)
cp -R public/assets "$tmp/assets"
cp archive/transparent-preview.html "archive/dc-variants/"* "$tmp/"
python3 -m http.server 8799 --bind 127.0.0.1 --directory "$tmp"   # stop with Ctrl-C, then rm -rf "$tmp"
```

This is the only exception to the one-port rule in `AGENTS.md`. It serves a disposable copy, never `public/`.

| Archived page | Needs |
| --- | --- |
| `transparent-preview.html` | the same `assets/` files as the September `index.html`, plus `assets/grove-expanse.png`; unpkg React |
| `walkthrough.dc.html` | `./support.js`, `assets/01-landscape.png`, `assets/wave-diagram.png`, `assets/seat-*.png`, `assets/breath-0..3.png` |
| `cosmic.dc.html` | `./support.js`, `assets/chakra-body.png`, `assets/mountain.png`, `assets/poster.png` |
| `pixel.dc.html` | `./support.js`, `assets/figure2.png`, `assets/mountain.png`, `assets/poster.png` |
| `reference/standalone-index.html` | `assets/04-chakra.png`, `assets/05-complete.png`, `assets/seated/Seat_01.png`, which **do not exist** in this repository |
