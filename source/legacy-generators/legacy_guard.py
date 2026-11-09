"""Stops the legacy generators before they write anything.

These scripts rebuilt public/index.html from the September 2026 export in
reference/original-netlify-index.html. The current app is hand-edited and
newer than that export, so running them would replace it with an older page
and overwrite figure assets. See source/legacy-generators/README.md.
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOW = 'WAVE_ALLOW_LEGACY_REGEN'


def refuse_unless_allowed(script):
    """Exit unless the caller opted in and public/index.html is not the hand-edited app."""
    if os.environ.get(ALLOW) != '1':
        sys.exit(f'{script} is inactive and was not run. It would overwrite the current app '
                 f'with an older export. See source/legacy-generators/README.md.')
    index = ROOT / 'public' / 'index.html'
    # The hand-edited app loads chooser.css; generated pages never did.
    if index.is_file() and 'chooser.css' in index.read_text(encoding='utf-8'):
        sys.exit(f'{script} refused: public/index.html is the hand-edited app and must not be '
                 f'regenerated. Run legacy generators only in a separate copy of the repository.')
