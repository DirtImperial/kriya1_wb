# Asset manifest

Every file under `public/assets/`, as of the 4 Nov 2026 cleanup. Nothing in this folder was moved, merged or deleted during that cleanup.

Roles come from searching the app files, the review page, the archived pages, the legacy generators and the tests, and from loading the app in a browser. A file can have more than one role. **"Unreferenced in the audited code"** means no file in this repository refers to it. It may still matter as source artwork, so don't delete it on that basis.

## How the app uses artwork

**Coordinate systems**

- **Figure:** every seated figure is drawn in a 1024×1024 box. The page markup in `index.html` refers to the original female frames (`female-cloud-0..3.svg` for breath, `female-pose-0..3.svg` for posture). These are SVGs that wrap embedded PNGs in a `0 0 1024 1024` viewBox. The browser still loads them when the page loads.
- **Environment:** every background is 1536×1024 and opaque. The practice shows the `0 210 1536 814` window of it (`xMidYMid slice`). The figure never moves. Each environment's `stage` matrix in `environment-layouts.js` shifts or scales the background under the figure, and mirrored copies normally fill the edges. A scene may define an `edgeFill.bottom` source strip and an optional side-floor line when clean floor should continue instead of mirrored objects. Mountain Sky uses scale 0.8145, offset (150.8, 75.4), which puts the peak on the third eye and the horizon through the navel. Sunlit Office uses offset (−140, −100) plus its wood-floor extension, keeping the chair centered and the avatar inside the single rug without repeating the carpet below or beside it.

**Avatars**

`chooser.js` (`CHARACTERS`) swaps every `female-*.svg` reference for the chosen avatar's still image, `avatars/{man,woman,boy,girl}.png`. These are 1024×1024 RGBA and aligned to the same box. All four avatars use stills, so after the swap the SVG frames are not shown.

**Thumbnails**

- Avatar thumbnails: `avatars/thumbs/<id>.png`, 192×192 RGBA.
- Environment thumbnails: `environments/<id>/thumb-<day|night>.jpg`, 240×160.

**Day and night**

`environment.js` loads the generated placements, then picks day from 07:00 to 19:00 device-local time, otherwise night. The choice is frozen when a practice begins. Missing or invalid generated data falls back to the three built-in scene placements.

## Unresolved observations (left as found)

- **Mountain night:** `environments/mountain/night.png` is byte-identical to `day.png`, and so are the two mountain thumbnails. It may be a placeholder.
- **Woman avatar:** an earlier `chooser.js` drew the woman from the `female-*.svg` frames. The version in the checkpoint maps her to `avatars/woman.png`, like the others. `index.html` still loads the SVGs as base markup.
- **Authorship:** for `reference/uploads/` and the older `public/assets/` artwork, authorship isn't recorded in the repository and is **unknown**. Four files in `reference/uploads/` named `chatgpt image may 22, 2026, …` are byte-identical to `assets/poster.png`, `assets/wave-diagram.png`, `assets/01-landscape.png` and `assets/chakra-body.png`.
- **Unused figure:** `figures/chakra-body.png` isn't written by the current `process_figures.py` and isn't referenced.
- **Concurrent edits:** while this cleanup ran on 4 Nov 2026, another process (an Asset Studio session) edited files here:
  - **Before the checkpoint (included in `d61dcf0`):** `chooser.js` at 11:12, which switched the Woman to `avatars/woman.png`, and the boy avatar and its thumbnail at 11:16.
  - **After the checkpoint (uncommitted in the working tree, not reverted):** `avatars/{girl,man,woman}.png` and `avatars/thumbs/{girl,man}.png`, between 11:21 and 11:25.
  - **The table below** measures the files on disk at the time of writing.

## Files

| File | Size | Pixels | Transparency | Roles | Identical to |
|---|---|---|---|---|---|
| `01-landscape.png` | 2,039 KB | 1271×1237 | opaque | archived: walkthrough.dc.html; legacy generator input | `mountain.png`, `preview-bundle/5ef5d747-4a87-4a12-98d6-a181fd9c0495.png` |
| `avatars/boy.png` | 204 KB | 1024×1024 | alpha | app: chooser.js |  |
| `avatars/girl.png` | 213 KB | 1024×1024 | alpha | app: chooser.js |  |
| `avatars/man.png` | 352 KB | 1024×1024 | alpha | app: chooser.js |  |
| `avatars/thumbs/boy.png` | 13 KB | 192×192 | alpha | app: chooser.js |  |
| `avatars/thumbs/girl.png` | 15 KB | 192×192 | alpha | app: chooser.js |  |
| `avatars/thumbs/man.png` | 22 KB | 192×192 | alpha | app: chooser.js |  |
| `avatars/thumbs/woman.png` | 20 KB | 192×192 | alpha | app: chooser.js |  |
| `avatars/woman.png` | 313 KB | 1024×1024 | alpha | app: chooser.js |  |
| `babaji-16bit-v1.png` | 1,834 KB | 1254×1254 | opaque | unreferenced in the audited code |  |
| `babaji-mountain-v1.png` | 2,233 KB | 1254×1254 | opaque | app: index.html |  |
| `breath-0.png` | 315 KB | 400×672 | alpha channel, fully opaque | archived: walkthrough.dc.html; legacy generator input | `preview-bundle/aa3d671f-a844-4ba6-b1e4-8f7db5ce66df.png` |
| `breath-1.png` | 332 KB | 400×672 | alpha channel, fully opaque | archived: walkthrough.dc.html; legacy generator input | `preview-bundle/101d078d-2787-4b30-ba54-d42ca695a0ce.png` |
| `breath-2.png` | 356 KB | 400×672 | alpha channel, fully opaque | archived: walkthrough.dc.html; legacy generator input | `preview-bundle/50033585-c7b7-483c-aa1f-d0b31768ff6c.png` |
| `breath-3.png` | 383 KB | 400×672 | alpha channel, fully opaque | archived: walkthrough.dc.html; legacy generator input | `preview-bundle/4940886d-4dfa-4385-8c85-6f01b6098d54.png` |
| `chakra-body.png` | 1,345 KB | 1158×1359 | opaque | archived: cosmic.dc.html |  |
| `empty-vessel-outline-v1.png` | 391 KB | 1254×1254 | alpha | unreferenced in the audited code |  |
| `empty-vessel-outline-v2.png` | 554 KB | 1254×1254 | opaque | legacy generator markup (not in current app) |  |
| `environments/grove/day.png` | 1,006 KB | 1536×1024 | opaque | app: environment.js; tests |  |
| `environments/grove/night.png` | 767 KB | 1536×1024 | opaque | app: index.html; app: environment.js; tests |  |
| `environments/grove/thumb-day.jpg` | 15 KB | 240×160 | opaque | app: chooser.js |  |
| `environments/grove/thumb-night.jpg` | 9 KB | 240×160 | opaque | app: chooser.js |  |
| `environments/mountain/day.png` | 982 KB | 1536×1024 | opaque | app: environment.js; tests | `environments/mountain/night.png` |
| `environments/mountain/night.png` | 982 KB | 1536×1024 | opaque | app: environment.js; tests | `environments/mountain/day.png` |
| `environments/mountain/thumb-day.jpg` | 12 KB | 240×160 | opaque | app: chooser.js | `environments/mountain/thumb-night.jpg` |
| `environments/mountain/thumb-night.jpg` | 12 KB | 240×160 | opaque | app: chooser.js | `environments/mountain/thumb-day.jpg` |
| `environments/office/day.png` | 875 KB | 1536×1024 | opaque | app: environment.js; tests |  |
| `environments/office/night.png` | 694 KB | 1536×1024 | opaque | app: environment.js; tests |  |
| `environments/office/thumb-day.jpg` | 13 KB | 240×160 | opaque | app: chooser.js |  |
| `environments/office/thumb-night.jpg` | 9 KB | 240×160 | opaque | app: chooser.js |  |
| `female-cloud-0.svg` | 1,896 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js; app: chooser.js |  |
| `female-cloud-1.svg` | 1,896 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-cloud-2.svg` | 1,896 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-cloud-3.svg` | 1,896 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-pose-0.svg` | 1,389 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-pose-1.svg` | 1,389 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-pose-2.svg` | 1,389 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `female-pose-3.svg` | 1,389 KB | viewBox 0 0 1024 1024 | embedded PNG | app: index.html base figure markup, replaced at runtime by chooser.js |  |
| `figure2.png` | 373 KB | 372×548 | alpha channel, fully opaque | archived: pixel.dc.html |  |
| `figures/breath-0.png` | 277 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/breath-1.png` | 299 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/breath-2.png` | 325 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/breath-3.png` | 360 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/chakra-body.png` | 470 KB | 1024×1024 | alpha | unreferenced in the audited code |  |
| `figures/registration.json` | 6 KB | — | — | legacy generator output |  |
| `figures/seat-chin.png` | 133 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-column.png` | 180 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-crown.png` | 187 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-cushions.png` | 142 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-hands.png` | 163 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-heart.png` | 179 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-shoulders.png` | 167 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `figures/seat-spine.png` | 133 KB | 1024×1024 | alpha | review: figure-review.html; legacy generator output |  |
| `grove-expanse.png` | 2,193 KB | 1536×1024 | opaque | archived: transparent-preview.html |  |
| `grove.svg` | 2,680 KB | viewBox 20 88 738 858 | embedded PNG | app: index.html |  |
| `hands-down-v1.png` | 726 KB | 1254×1254 | opaque | unreferenced in the audited code |  |
| `hands-down-v2.png` | 950 KB | 1254×1254 | opaque | legacy generator markup (not in current app) |  |
| `hands-lap-v1.png` | 695 KB | 1254×1254 | opaque | legacy generator markup (not in current app) |  |
| `hands-up-v1.png` | 707 KB | 1254×1254 | opaque | legacy generator markup (not in current app) |  |
| `mantra-arrow-original.png` | 49 KB | 98×512 | alpha channel, fully opaque | app: index.html |  |
| `mountain.png` | 2,039 KB | 1271×1237 | opaque | archived: cosmic.dc.html; archived: pixel.dc.html | `01-landscape.png`, `preview-bundle/5ef5d747-4a87-4a12-98d6-a181fd9c0495.png` |
| `poster.png` | 1,397 KB | 1402×1122 | opaque | archived: cosmic.dc.html; archived: pixel.dc.html |  |
| `preview-bundle/01e37831-08a3-4279-847f-0c50d2829dc4.png` | 163 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-chin.png` |
| `preview-bundle/101d078d-2787-4b30-ba54-d42ca695a0ce.png` | 332 KB | 400×672 | alpha channel, fully opaque | legacy generator output | `breath-1.png` |
| `preview-bundle/144015fc-6494-4c21-8f38-c74672a15cfd.png` | 188 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-heart.png` |
| `preview-bundle/18913378-d597-4929-a556-2a6640bf4402.woff2` | 63 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/2929ab07-8c93-4035-9a49-4149906e82c8.png` | 182 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-column.png` |
| `preview-bundle/2df13d11-775d-47ea-ac61-3e1533837a08.woff2` | 18 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/3aedb2c6-deb6-422a-8871-8d4e17860b1f.woff2` | 27 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/3b886dff-b7a0-4b52-ac17-b400b468af1c.woff2` | 85 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/4940886d-4dfa-4385-8c85-6f01b6098d54.png` | 383 KB | 400×672 | alpha channel, fully opaque | legacy generator output | `breath-3.png` |
| `preview-bundle/4e8e22c2-fca4-4a9a-9cb9-91cebe2cdf97.woff2` | 22 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/50033585-c7b7-483c-aa1f-d0b31768ff6c.png` | 356 KB | 400×672 | alpha channel, fully opaque | legacy generator output | `breath-2.png` |
| `preview-bundle/5ef5d747-4a87-4a12-98d6-a181fd9c0495.png` | 2,039 KB | 1271×1237 | opaque | legacy generator output | `01-landscape.png`, `mountain.png` |
| `preview-bundle/67de5182-decc-4a23-945f-48d8abceaeb2.png` | 175 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-crown.png` |
| `preview-bundle/7325ff7d-ca0d-4097-b309-b431babf845e.png` | 1,024 KB | 1536×1024 | opaque | legacy generator output | `wave-diagram.png` |
| `preview-bundle/77786296-5512-4195-ab6e-47bf2677bcbb.png` | 184 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-shoulders.png` |
| `preview-bundle/7e8b2662-a710-4ded-8b4c-1583a67736bb.woff2` | 12 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/9fe4a81b-e03d-49dc-b605-9597a71b2e6c.png` | 154 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-spine.png` |
| `preview-bundle/aa3d671f-a844-4ba6-b1e4-8f7db5ce66df.png` | 315 KB | 400×672 | alpha channel, fully opaque | legacy generator output | `breath-0.png` |
| `preview-bundle/b771d888-f701-4cbf-919a-1ac4917e1da8.png` | 175 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-hands.png` |
| `preview-bundle/b7d63beb-e716-498e-820d-d360601dbf75.js` | 53 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/c079ed76-abe5-4543-abce-b0bfda29ef47.png` | 154 KB | 368×402 | alpha channel, fully opaque | legacy generator output | `seat-cushions.png` |
| `preview-bundle/cb3564b3-54fa-4b8f-befb-1df88c05f29f.woff2` | 7 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/d47db4b0-5438-4aaf-b00b-4a3aeb8a2d11.woff2` | 129 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `preview-bundle/d87ef5ec-18c9-4a9a-9508-152db8761133.woff2` | 38 KB | — | — | app: index.html (runtime/fonts); legacy generator output |  |
| `registered-landscape.png` | 1,707 KB | 1024×1024 | alpha channel, fully opaque | review: figure-review.html; legacy generator output |  |
| `seat-chin.png` | 163 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/01e37831-08a3-4279-847f-0c50d2829dc4.png` |
| `seat-column.png` | 182 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/2929ab07-8c93-4035-9a49-4149906e82c8.png` |
| `seat-crown.png` | 175 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/67de5182-decc-4a23-945f-48d8abceaeb2.png` |
| `seat-cushions.png` | 154 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/c079ed76-abe5-4543-abce-b0bfda29ef47.png` |
| `seat-hands.png` | 175 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/b771d888-f701-4cbf-919a-1ac4917e1da8.png` |
| `seat-heart.png` | 188 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/144015fc-6494-4c21-8f38-c74672a15cfd.png` |
| `seat-shoulders.png` | 184 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/77786296-5512-4195-ab6e-47bf2677bcbb.png` |
| `seat-spine.png` | 154 KB | 368×402 | alpha channel, fully opaque | archived: walkthrough.dc.html | `preview-bundle/9fe4a81b-e03d-49dc-b605-9597a71b2e6c.png` |
| `share-preview-v1.png` | 2,276 KB | 1731×909 | opaque | link preview (og:image, absolute live URL) |  |
| `spine-supplied-v1.png` | 1,266 KB | 1254×1254 | opaque | unreferenced in the audited code |  |
| `visualization-landscape.png` | 1,919 KB | 5120×1024 | opaque | legacy generator output |  |
| `wave-diagram-clean.png` | 900 KB | 1536×1024 | alpha | legacy generator output |  |
| `wave-diagram.png` | 1,024 KB | 1536×1024 | opaque | archived: walkthrough.dc.html; legacy generator input | `preview-bundle/7325ff7d-ca0d-4097-b309-b431babf845e.png` |
