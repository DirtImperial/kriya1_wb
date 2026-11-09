# Reference material

These are original exports and supplied artwork, preserved byte-for-byte. They aren't served by the app. Authorship isn't recorded in the repository and is **unknown** unless stated.

| Path | What it is |
| --- | --- |
| `original-netlify-index.html` | The original bundled deployment page (8.5 MB, all resources inline). It was the input to `source/legacy-generators/process_figures.py` (commit `28a90b4`). |
| `standalone-index.html` | A separately supplied standalone version (commit `8691e74`). It refers to `assets/04-chakra.png`, `05-complete.png` and `seated/Seat_01.png`, which don't exist here, so it doesn't render fully. It isn't the production entry point. |
| `uploads/` | Storyboards, source sheets and images supplied on 14 Sep 2026 (commit `3068140`, "Preserve original artwork and breathing storyboards"). Moved from `public/uploads/` on 4 Nov 2026. `seating seqeunce.png` (spelling preserved) is the legacy generator's input, and `public/assets/figures/registration.json` still records it as `uploads/seating seqeunce.png`. Four `chatgpt image may 22, 2026, …` files are byte-identical to assets in `public/assets/`. |
