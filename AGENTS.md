# Working on Wave Breathing

- Launch the current main app and Studio together with `python3 launch.py --no-open` from this repository (or omit `--no-open` to open both pages).
- Use only `http://127.0.0.1:8766/app/` for the main app and `http://127.0.0.1:8766/studio/` for Studio. Verify `/api/workspace` identifies `wave-breathing-local-v1` and this repository's `public` folder before browser work.
- Do not launch another static server/Vite preview or use another port. The shared launcher reuses/reloads the same workspace and redirects known old addresses.

- Production files are in `public/`; Netlify publishes that folder without a build step.
- Preserve the practice wording, stage order, and breathing instructions unless the user requests changes.
- Preview visual and animation changes in a browser on desktop and mobile before reporting completion.
- Keep asset paths relative and verify images load successfully.
- The standalone HTML under `reference/` is a different version with missing source images, not the current production entry point.
- Keep experiments on branches and avoid overwriting the production baseline with an unverified export.
