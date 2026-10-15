# Cladue-AI

Personal Claude Code plugin marketplace.

## Plugins

### `qa-tester` — QA agent for web apps

Runs a full QA job the way the team expects, from a brief to a finished report:

1. **Intake**: reads the brief (Notion link or pasted text), asks once for permissions
   (submit synthetic test data, approve/reject only its own test records, write to Sheet/Drive).
2. **Discover** every module of the customer site and admin back-office.
3. **Test** happy and negative paths, plus end to end (submit → admin decision → final status).
4. **HD evidence**: 2880×1800 screenshots and sharp MP4 videos per bug (Playwright + Edge), with the
   bug highlighted in red. You log in yourself in a yellow-banner window when a login is needed.
5. **Bugs** with IDs (`WEB-`, `BO-`, `E2E-`), steps, expected/actual, severity.
6. **Drive**: you drag the evidence into your Drive folder; the agent finds and links every file.
7. **Google Sheet** in the team design (module groups, coloured status dropdown, remarks, linked
   attachments) filled through the browser pane.
8. **Summary** with real counts, critical issues, blocked items and what's left.

Safety built in: never types passwords, never uses real passports/IDs/faces (generates SPECIMEN
images), only touches its own test records, discloses every record it created.

#### Install

In Claude Code:

```
/plugin marketplace add leeyipon/Cladue-AI
/plugin install qa-tester@cladue-ai
```

One-time tool setup for HD capture (Node 18+, Microsoft Edge, Python 3 + Pillow):

```
bash "$(find ~/.claude/plugins -path '*qa-tester*' -name setup.sh | head -1)"
```

(The plugin lives under `~/.claude/plugins/cache/` or `~/.claude/plugins/marketplaces/` depending on
how the marketplace was added; the command above finds it either way.)

#### Use

```
/qa-run https://www.notion.so/<your-QA-brief> <Google Sheet link> <Drive evidence folder link>
```

or just ask: "Use the qa-tester agent to run QA from this brief: <link>".

#### What's inside

```
plugins/qa-tester/
  agents/qa-tester.md                 the agent (role, process, never-do list)
  commands/qa-run.md                  /qa-run command
  skills/qa-web-testing/
    SKILL.md                          playbook entry point
    references/workflow.md            step-by-step run
    references/safety-rules.md        non-negotiable rules
    references/sheet-design.md        team Sheet design + how to fill it
    references/lessons-learned.md     problems already solved
    scripts/hd-capture-lib.js         HD screenshots + full-res MP4 + login banner
    scripts/make_specimen_images.py   fake passport / ID / drawn selfie
    scripts/build_sheet_rows.py       results → Sheet rows with Drive links
    scripts/setup.sh                  installs Playwright + ffmpeg
    scripts/capture_template.js       starting point for a project's capture script
    references/results.example.json   input format for the Sheet row builder
```
