# Team Google Sheet design (default deliverable)

Reference: the team's testing workbook in Drive (one sheet per system, e.g. "<Project> Back-Office", "<Project> Website").
The user prefers this look: "clean, better to read". Fill the user's own Sheet in this design
(the one named in the brief); one tab per system.

## Columns

| Col | Header | Content |
|---|---|---|
| A | `<System> Module` (e.g. "Website Module", "Back-Office Module") | module name, **only on the first row of each group** |
| B | Functionalities | feature-level row (not one row per micro test) |
| C | Test Status | dropdown chip: **Passed** (light green), **Failed** (light red), **To-Do** (light grey), **Blocked** (light yellow) |
| D | Remark Issued | what actually happened; failed rows start with the bug ID, e.g. `BO-006 (Critical): popup 'now Approved' but badge stays Pending after reload` |
| E | Test Attachment jpg/mp4 | `=HYPERLINK("<drive file url>","<file name>")` — main HD screenshot |
| F | Extra evidence | second file: the MP4 video of the flow, or a second screenshot |

## How to fill it (Google Sheets in the built-in browser pane)

The Drive connector can create files but cannot edit cells of an existing Sheet, and Sheets has no
reliable keyboard paste from the OS clipboard in the pane. What works:

1. Open the Sheet in the browser pane. If it shows "View only" / a Sign-in button, ask the user to
   sign in **in the pane** (not their own browser). The pane keeps the session afterwards.
2. Select the target tab and cell **A1** (Name box → `A1` → Enter). Check
   `document.activeElement.className === 'cell-input'`.
3. Run the `.paste.js` produced by `scripts/build_sheet_rows.py` with the JavaScript tool. It fires a
   synthetic paste event; HYPERLINK formulas evaluate on paste. If data lands one row low, the
   selection had moved — delete the extra row (right-click row header → Delete row).
4. First time only: Format → **Convert to table** (dark green header). Then the Test Status column
   menu → Edit column type → **Dropdown**; set chip colours (Passed light green, Failed light red,
   To-Do light grey, Blocked light yellow) → Done.
5. Select columns A–F → right-click header → Resize columns → **Fit to data**.
6. Re-running: paste over A1 again — the existing table, dropdown and colours are kept; a new
   column F joins the table automatically.
7. Verify: Name box → a few cells; read the formula bar (`#t-formula-bar-input`) to confirm the
   link is the new Drive file; screenshot the bottom rows to check the status chips.

## Optional extra tabs (when the brief asks for a full tracker)

Functional Test Cases, Bug Reports (all bug fields), Regression Testing, QA Summary — upload as
separate Google Sheets via the Drive connector (`create_file`, `text/csv`), one per tab, in a
"<Project> QA Tracker" folder. Keep those consistent with the main Sheet when results change.
