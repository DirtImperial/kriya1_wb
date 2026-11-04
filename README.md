# Wave Breathing

Static website with five chapters: Posture, Breath, Mantra, Visualization and Integration.

## Publish

Netlify should deploy GitHub branch `main` with publish directory `public` and no build command. `public/index.html` is the current release, including all animations, wording and artwork. Commit changes to this branch to trigger publication once the repository connection is configured.

## Edit and preview

Run `python3 launch.py` to launch both the current main app and Asset Studio.
They share one local workspace: [main app](http://127.0.0.1:8766/app/) and
[Studio](http://127.0.0.1:8766/studio/). Running the command again reuses the same
workspace, or reloads changed server code after checking that no image is generating.
Agents should use `python3 launch.py --no-open` and verify `/api/workspace` before
browser work. Do not start a separate static server or choose another port.

The Python source modules `chapter_structure.py`, `solar_spiral.py`, and `visualization_scene.py` define the chapters and custom graphics. `process_figures.py` regenerates both `public/index.html` and `public/transparent-preview.html` using Python, Pillow and NumPy. The original export used as its input is preserved in `reference/original-netlify-index.html`.

The generated HTML and assets are committed, so Netlify does not need Python or image libraries. Keep generator changes and generated files together in each commit.

`public/figure-review.html` is an artwork review gallery. Original source images remain available for future edits. Do not commit credentials or local caches.
