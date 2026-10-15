---
name: qa-web-testing
description: End-to-end manual + automated QA of web apps (customer site and admin back-office), from a QA brief (Notion link or pasted) to a filled Google Sheet in the team's design with HD screenshot/MP4 evidence linked from Google Drive. Use when the user asks to QA-test, regression-test or bug-hunt a website or admin portal, re-capture QA evidence, or "follow the QA prompt"; especially identity / eKYC / onboarding flows.
---

# QA web testing

Run a complete QA job the way the team expects, without the user re-explaining it.

## Always read first

- [references/safety-rules.md](references/safety-rules.md) — non-negotiable (no typed passwords,
  no real ID documents, synthetic data, only your own test records, disclose side effects).
- [references/workflow.md](references/workflow.md) — the step-by-step run (intake → discover →
  test → HD evidence → bugs → Drive links → Sheet → summary).
- [references/sheet-design.md](references/sheet-design.md) — the deliverable format and exactly how
  to fill a Google Sheet through the browser pane.
- [references/lessons-learned.md](references/lessons-learned.md) — problems already solved; check
  before improvising.

## Tools this needs

- Built-in browser pane (`mcp__Claude_Browser__*`) for exploring and for filling Google Sheets.
- Notion connector (to read the brief), Google Drive connector (find uploaded files, create files).
- Node 18+, Microsoft Edge, Python 3 with Pillow for HD capture:
  `bash scripts/setup.sh` once (installs Playwright + ffmpeg into `~/.qa-tester-tools`), then run
  capture scripts with that folder as the working directory.

## Scripts

| Script | Purpose |
|---|---|
| `scripts/hd-capture-lib.js` | `launch`, `scenario` (one recorded context per bug), `makeShot`, `mark`/`unmark` (red outline), `startRecorder` (full-res MP4), `step`, `loginBanner` |
| `scripts/make_specimen_images.py <dir>` | specimen passport, ID front/back, drawn selfie, `notes.txt` |
| `scripts/build_sheet_rows.py results.json links.json out/` | rows → `<tab>.tsv` + `<tab>.paste.js` with `=HYPERLINK()` evidence cells |
| `scripts/capture_template.js` | starting point: public-page scenarios (field bug, real file chooser, skipped step) and a headed admin login with approve + reload check |
| `references/results.example.json` | input format for `build_sheet_rows.py` |

For a new system, copy `capture_template.js`, keep the structure (one `scenario`/`step` per bug, `mark` the
evidence element, `PASS_TC_` / `<BUG-ID>_` file names) and replace URLs and selectors after
exploring the pages in the browser pane.
