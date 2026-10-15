# QA run — step by step

The order follows the team's QA brief: discover → test → record bugs
with evidence → upload and link → summarise. Keep a task list visible to the user the whole time.

## 0. Intake (before touching any system)

1. Read the brief. If it is a Notion link, fetch it with the Notion connector; if it is pasted text,
   use it as-is. Pull out:
   - systems under test (URLs) and user roles (e.g. customer website + admin back-office);
   - the Google Sheet to fill (the deliverable) and the design to follow
     (default: [sheet-design.md](sheet-design.md));
   - the Drive folders for evidence and issue logs;
   - any QA rules in the brief (they add to [safety-rules.md](safety-rules.md), never replace it).
2. Ask the user **once, together** (AskUserQuestion), and record the answers:
   - may I submit test applications with **synthetic** data?
   - may I approve / reject **only the test records I create**?
   - may I write to the Sheet and the Drive folders?
3. Login: credentials in a brief are for the user. Tell the user they must log in themselves
   (built-in browser pane, or the yellow-banner Edge window for HD capture). Never type passwords.
4. Create the working folder: `evidence/` (quick screenshots), `evidence_hd/` (final),
   `test-data/` (run `scripts/make_specimen_images.py test-data`).

## 1. Discover modules (read-only)

- Use the built-in browser pane. Visit every page/route reachable without submitting anything:
  landing, each wizard step, status pages, login page, and — after the user logs in — every menu.
- Also probe routes directly in a fresh session (e.g. the review / status step of a
  wizard, admin routes while logged out). Skipped steps and missing route guards are common bugs.
- Write the module inventory per system: Module | URL | Functionality found | Coverage.

## 2. Functional testing

For every module, test happy path **and** negatives:
- required fields empty; invalid formats (email, names with digits/symbols); boundaries
  (max length counters, future/under-age dates); wrong file types; consent gates;
- direct URL access to later steps; empty submissions; refresh/reload persistence;
- admin: search (match / no match), every status tab/filter, pagination, detail view,
  each action (approve / reject / manual review) **and reload afterwards** to confirm the status
  really changed; dashboards vs list counts; timestamps vs the customer-side time (timezone).
- identity flows: does a drawn/cartoon face pass "face verified"? does a clearly fake specimen
  document pass? (use the specimen images, never real IDs).
- End-to-end: customer submits → admin decides → status visible to both sides
  (and can the customer look it up later in a new session?).

Status per test: **Passed / Failed / Blocked / To-Do** — never mark Passed without seeing it.
Mark Blocked (with the reason) when the environment prevents a test (no camera, session expired,
no permission). Anything only partly checked gets a remark saying exactly what was and wasn't checked.

Disclose side effects: some apps save a partial record as soon as step 1 is completed — note the
record IDs you created in the summary and in the relevant remark.

## 3. Evidence (HD)

- Quick screenshots from the built-in browser are only 800 px wide — use them while exploring,
  not as final evidence.
- Final evidence: run Playwright scripts with `scripts/hd-capture-lib.js` (start from
  `scripts/capture_template.js`). Output 2880×1800 PNG + full-resolution MP4 per bug flow, with a red outline on
  the element that shows the bug.
- Public pages: headless. Pages behind a login: `launch({ headed: true })`, `loginBanner(page)`,
  wait for the user to log in, then continue automatically. Tell the user to keep that window open.
- Name files `<BUG-ID>_<Short_Description>.png|mp4`; passes `PASS_TC_<What>.png`;
  re-checks `RECHECK_...`; view-only captures `VIEW_...`.
- Look at the key images yourself before reporting — re-checks can overturn a bug (example: a
  "back side shown twice" National ID bug was really the tester's simulated drag-and-drop).

## 4. Bugs

Bug ID prefixes per system (`WEB-001`, `BO-001`, `E2E-001`). Fields: Bug ID, System, Module and
Functionality, Issue Title, Preconditions, Steps to Reproduce, Expected, Actual, Severity
(Critical / High / Medium / Low), Priority (P1–P3), Environment, Status, Evidence link(s),
Developer notes. Severity guide: Critical = security bypass or core workflow broken
(e.g. fake face verified, approve never saves); High = feature unusable; Medium = wrong behaviour
with a workaround or missing validation; Low = cosmetic / minor data display.

## 5. Upload and link evidence

- The Drive connector cannot upload images/videos in bulk. Ask the user to drag the `evidence_hd`
  files into the evidence folder they choose, then **find them yourself**: search the folder by
  `parentId`, page through all results, build `links.json` {filename: file id}. Verify every local
  file has a Drive match; report any missing ones. Don't assume the upload worked — check.
- Mention when the evidence folder is shared "anyone with the link".

## 6. Fill the Sheet

Follow [sheet-design.md](sheet-design.md). Build rows with `scripts/build_sheet_rows.py`, paste
them through the browser pane, convert to a table, set the status dropdown colours, fit columns,
then spot-check cells (formula bar shows the HYPERLINK) and statuses.

## 7. Summary

Report in chat (and in a Summary tab if the brief asks): modules found / tested, test counts by
status (computed from the rows, not estimated), bugs by severity, critical & unresolved issues,
what was Blocked and why, records created by QA, links to the Sheet and evidence, recommended
fixes and regression tests. Say plainly what is not done.
