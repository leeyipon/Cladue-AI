"""Turn a results file into paste-ready rows for the team's Google Sheet design.

results.json:
{
  "tabs": [
    {"name": "Website",
     "header": ["Website Module", "Functionalities", "Test Status", "Remark Issued", "Test Attachment jpg/mp4", "Extra evidence"],
     "rows": [["Landing Page", "Landing page display", "Passed", "Start verification opens step 1.", "", ""],
              ["", "Nationality options", "Failed", "WEB-007: ...", "WEB-007_x.png", "WEB-007_x.mp4"]]}
  ]
}
links.json: {"WEB-007_x.png": "<Drive file id or full URL>", ...}

Writes <out_dir>/<tab>.tsv and <out_dir>/<tab>.paste.js. The .js is run in the Google Sheets tab
(cell A1 of the target tab selected); it pastes the rows through a synthetic paste event, which
Sheets accepts even when keyboard paste from the OS clipboard does not reach the page.

Usage: python build_sheet_rows.py results.json links.json out_dir
"""
import json
import os
import sys

STATUSES = {"Passed", "Failed", "Blocked", "To-Do"}


def link(name, links):
    if not name:
        return ""
    target = links.get(name)
    if not target:
        raise SystemExit(f"no Drive link for evidence file {name!r} - upload it and add it to links.json")
    url = target if target.startswith("http") else f"https://drive.google.com/file/d/{target}/view"
    return f'=HYPERLINK("{url}","{name}")'


def main(results_path, links_path, out_dir):
    results = json.load(open(results_path))
    links = json.load(open(links_path)) if os.path.exists(links_path) else {}
    os.makedirs(out_dir, exist_ok=True)
    for tab in results["tabs"]:
        header = tab["header"]
        n = len(header)
        lines = ["\t".join(header)]
        for row in tab["rows"]:
            row = (row + [""] * n)[:n]
            if row[2] not in STATUSES:
                raise SystemExit(f"{tab['name']}: status {row[2]!r} must be one of {sorted(STATUSES)}")
            cells = []
            for i, value in enumerate(row):
                if i >= 4:
                    cells.append(link(value, links))
                else:
                    if "\t" in value or "\n" in value:
                        raise SystemExit(f"tab/newline inside cell: {value[:40]!r}")
                    cells.append(value)
            lines.append("\t".join(cells))
        tsv = "\n".join(lines)
        base = os.path.join(out_dir, tab["name"].replace(" ", "_"))
        open(base + ".tsv", "w").write(tsv)
        open(base + ".paste.js", "w").write(
            "const data = " + json.dumps(tsv) + ";\n"
            "const t = document.activeElement; const dt = new DataTransfer(); dt.setData('text/plain', data);\n"
            "t.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true}));\n"
            "await new Promise(r => setTimeout(r, 3000)); 'pasted ' + data.split('\\n').length + ' lines';\n")
        print(f"{tab['name']}: {len(tab['rows'])} rows -> {base}.tsv / .paste.js")


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
