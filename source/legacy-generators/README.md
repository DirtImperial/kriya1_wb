# Legacy generators (inactive)

From 14 to 25 September 2026, these scripts built `public/index.html` from the original bundled export. Since then, the app has been edited by hand: the chooser, environments, avatars, `practice.css` and the practice navigation. **The scripts can't reproduce it.** Running them would replace the current app with an older page and overwrite figure assets.

`legacy_guard.py` stops both writing entry points before they write anything. They exit unless `WAVE_ALLOW_LEGACY_REGEN=1` is set, **and** they also refuse whenever `public/index.html` loads `chooser.css`, which marks the hand-edited app. They only work in a separate copy of the repository with an old `index.html`. Don't remove the guard to rebuild the current app.

| Script | Status | What it did | Wrote to (paths relative to the repository) |
| --- | --- | --- | --- |
| `process_figures.py` | **Dangerous; guarded at the top of the file, before imports** | Entry point. Extracted and registered seated and breath figures from `reference/uploads/seating seqeunce.png` and `public/assets/breath-0..3.png`. Rebuilt the page from `reference/original-netlify-index.html` by applying the modules below. Extracted the export's bundled resources. | `public/index.html`, `public/transparent-preview.html` (now `archive/`), `public/assets/figures/*.png`, `figures/registration.json`, `assets/wave-diagram-clean.png`, `assets/registered-landscape.png`, `assets/preview-bundle/*`, `figure-review.jpg` (repository root) |
| `visualization_scene.py` | **Writes a file; guarded inside `apply_visualization_scene()`, before the write** | Built the landscape scene for Part 4. | `public/assets/visualization-landscape.png` |
| `chapter_structure.py` | Stale; no file writes | Inserted chapter copy, hand poses, the closing page and the Part menu into the template string. | — |
| `mantra_scene.py` | Stale; no file writes | SO / HUM scenes | — |
| `solar_spiral.py` | Stale; no file writes | Solar-plexus spiral and crown glow | — |
| `wave_loop.py` | Stale; no file writes | Figure-eight breath diagram. The live page no longer matches its output. The Asset Studio's metadata still refers to it as `kriya1_wb/wave_loop.py`. | — |

Only `process_figures.py` runs code when imported. The other modules define functions plus one constant (`CHAPTERS`).

Moved here from the repository root on 4 Nov 2026. In `process_figures.py`, `ROOT` changed to `parents[2]` and the seating sheet now loads from `reference/uploads/`. In `visualization_scene.py`, the public path changed the same way. Nothing else changed. The generators weren't run during or after the move.
