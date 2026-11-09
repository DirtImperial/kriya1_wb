# Editing workflow

## Safe workflow

1. Work on a branch. Keep `main` as the production baseline.
2. Start the app: `python3 launch.py --no-open`. Open http://127.0.0.1:8766/app/.
3. Edit the files named in [ARCHITECTURE.md](ARCHITECTURE.md#source-of-truth). Edit `public/index.html` directly; it's the authoritative page.
4. Run `node --test tests/*.test.js`. (`node --test tests/` doesn't work on Node 22.)
5. Open http://127.0.0.1:8766/app/ on desktop and at phone width. Step through every part, change Appearance, and check the console and network for errors or 404s.
6. Keep asset paths relative (`assets/...`) and commit the artwork together with the code that uses it.

Never run `source/legacy-generators/` against this repository. Don't copy archived or reference pages into `public/`.

## Replace or add an avatar

Avatar art is copied into `public/assets/` with the practice files that use it.

1. Prepare `public/assets/avatars/<id>.png`: 1024×1024 RGBA with a transparent background, aligned to the existing avatars. Crown, pelvis and seat must sit where `female-cloud-0.svg` and `avatars/woman.png` put them; compare it in the practice and in the chooser preview. Prepare `public/assets/avatars/thumbs/<id>.png` at 192×192 RGBA.
2. To replace an existing avatar, overwrite those two files. No code change is needed.
3. To add one, add an entry to `CHARACTERS` in `public/chooser.js`. For example, `rowan: { label: 'Rowan', slots: stillSlots('avatars/rowan.png') }` uses one still image for every breath and pose frame. To give an avatar its own frames, map each `female-*.svg` name in `slots` to its own file.
4. The chooser renders buttons from `CHARACTERS`. Check that the button, thumbnail and practice figure all appear.

## Replace or add an environment

1. Prepare `public/assets/environments/<id>/day.png` and `night.png`: 1536×1024, opaque. Prepare `thumb-day.jpg` and `thumb-night.jpg` at 240×160.
2. To replace an existing environment, overwrite those files. If the composition moved, adjust that scene's `stage` (`scale`, `x`, `y`) in `public/environment-layouts.js`. The figure stays fixed and the background moves under it. One transform is shared by the day/night pair.
3. To add a scene, copy all four files into its folder and add an entry in `environment-layouts.js` with `label` and `stage`. The chooser lists every scene `environment.js` accepts.
4. If the placement contract or path layout changes, update `tests/environment.test.js`, then run the tests.
5. `index.html` hardcodes `assets/environments/grove/night.png` as the image shown before the script runs. Keep that file present.

## Lesson and UI changes

- Practice wording, stage order and breathing instructions are in the stage list in `public/index.html`. Change them only when asked (see `AGENTS.md`). `tests/progress.test.js` reads that script and checks the progress rules.
- Styling is in `practice.css` and `chooser.css`. The inline `<style>` blocks in `index.html` came from the original export.
