#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web (remote) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install the Google Workspace CLI (gws) globally so it's on PATH for
# every session in this environment. Idempotent: re-running npm install -g
# on an already-installed package is a fast no-op.
npm install -g @googleworkspace/cli
