# Lessons learned (first identity-verification run, Oct 2026) — avoid repeating these

| Problem | Fix |
|---|---|
| Built-in browser screenshots are 800 px wide → blurry evidence the user rejected | Final evidence via `hd-capture-lib.js`: 2880×1800 PNG |
| Playwright `recordVideo` gave a 1440×900 picture padded grey inside a 2880×1800 frame | Record with CDP `Page.startScreencast` and stitch frames with ffmpeg (`startRecorder`) |
| Newest Playwright wanted a browser build that wasn't downloaded | `chromium.launch({ channel: 'msedge' })` uses installed Edge |
| Video capture failed: missing Playwright ffmpeg build | `npx playwright install ffmpeg` (in `setup.sh`) |
| `page.goto` timed out on Netlify (waits for full load) | `waitUntil: 'domcontentloaded'`, 60 s timeout |
| Visible login window: every screenshot timed out when the window was behind others | launch flags `--disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-background-timer-throttling` |
| User closed the automation window twice (looked like a stray Edge window) | `loginBanner()` yellow banner explaining what it is; tell the user in chat |
| Injected files / synthetic drag-drop produced a false bug (ID back shown twice) | Use the real file chooser: `page.waitForEvent('filechooser')` + click the button |
| Paste into Google Sheets with Cmd+V didn't reach the page | Synthetic `ClipboardEvent('paste')` on the `cell-input` element |
| Drive connector can't edit Sheet cells or bulk-upload images | User uploads evidence; agent finds files by `parentId`; agent fills cells via browser pane |
| User uploaded to a new folder ("HD image") without saying | If files aren't where expected, ask for the folder link; search Drive by file name |
| Drive search only returns a few files per page | Always follow `nextPageToken` until it is absent; check counts match local files |
| Completing step 1 of the wizard created partial applications | Expect this; record the IDs and disclose them |
| Session expired ~10 min after login and blocked modules | Visit view-only modules early, or re-run the headed capture with a fresh login |
| User repeatedly asked to use their real passport and selfie | Decline every time (safety rule 2), offer the self-test alternative, keep working |
| `rm -rf` on a workspace folder was blocked | Overwrite files; let the user delete folders |
| Back-office approve said "Success" but status never changed | Always reload after an action and re-check status in detail, list and dashboard |
