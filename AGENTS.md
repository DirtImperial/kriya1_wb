# Working on Wave Breathing

- Launch with `python3 launch.py --no-open` from this repository (or omit `--no-open` to open the page). Use `http://127.0.0.1:8766/app/` for the main app.
- Do not launch another server or use another port. `launch.py` serves and reuses the app on port 8766.

- Production files are in `public/`; Netlify publishes that folder without a build step.
- `public/index.html` is hand-edited and authoritative. Keep it, `chooser.js`, `chooser.css`, `practice.css`, `environment.js`, and `environment-layouts.js` at the top of `public/`. The practice page loads them from there.
- Never run `source/legacy-generators/`; they would overwrite the current app with the September 2026 export. See `docs/ARCHITECTURE.md`, `docs/ASSETS.md`, and `docs/EDITING.md`.
- Run tests with `node --test tests/*.test.js`. The app server reuse checks are `python3 -m unittest tests/test_launch_reuse.py`.
- Do not copy `archive/` or `reference/` pages into `public/`; preview them from a temporary copy as described in `docs/ARCHITECTURE.md`.
- Preserve the practice wording, stage order, and breathing instructions unless the user requests changes.
- Preview visual and animation changes in a browser on desktop and mobile before reporting completion.
- Keep asset paths relative and verify images load successfully.
- The standalone HTML under `reference/` is a different version with missing source images, not the current production entry point.
- Keep experiments on branches and avoid overwriting the production baseline with an unverified export.
