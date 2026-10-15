#!/usr/bin/env bash
# Installs the HD capture toolchain into a working folder (default: ~/.qa-tester-tools).
# Needs Node 18+ and Microsoft Edge installed. Run capture scripts with this folder as cwd.
set -euo pipefail
TOOLS="${1:-$HOME/.qa-tester-tools}"
mkdir -p "$TOOLS"
cd "$TOOLS"
[ -f package.json ] || npm init -y >/dev/null
npm i playwright ffmpeg-static >/dev/null
# Playwright's own ffmpeg build is needed for CDP screencasts in some versions.
npx playwright install ffmpeg >/dev/null
node -e "require('playwright'); console.log('ffmpeg:', require('ffmpeg-static'))"
echo "Tools ready in $TOOLS"
