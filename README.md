# Wave Breathing

Version-controlled baseline of the supplied Netlify deployment for Wave Breathing / Full Body Kriya.

## Project layout

- `public/`: the complete, unchanged contents of Netlify deployment `6a3544079529297e0275f041`, including its bundled entry page, three alternate HTML versions, runtime, and image assets.
- `reference/standalone-index.html`: the separately supplied HTML. This version references a different `project/assets/` image set that was not in the deployment ZIP; it is preserved for reference and is not published.
- `netlify.toml`: publishes only `public/`. No build command is required for this static baseline.

## Local preview

From this folder, run `python -m http.server 5173 --directory public`, then open http://localhost:5173.

## Iteration and deployment

Open this repository folder in Codex. Make a branch for each substantial experiment, preview locally, check all stages on desktop and mobile, and commit the verified result. Configure the existing Netlify project to deploy this repository's production branch; pull requests can use Netlify Deploy Previews.

The deployed `public/index.html` is a bundled export containing embedded assets. A future source-cleanup task should unpack it into editable source while verifying visual and behavioral equivalence. This initial import deliberately preserves the working deployment.

Keep generated artwork and animation assets in the repository with the code that uses them. Avoid committing credentials, temporary renders, or dependency folders.
