// Template for an HD evidence run. Copy it per project, explore the pages in the browser pane
// first, then replace the URLs, selectors and file names. One scenario/step per bug or pass.
//
// Usage (cwd = tools folder from setup.sh):
//   node capture_<project>.js <out_dir> <test_data_dir>
const path = require('path');
const fs = require('fs');
const os = require('os');
const { launch, makeShot, mark, unmark, scenario, startRecorder, step, loginBanner, pause, log, VIEW, SCALE } =
  require(process.env.QA_LIB || path.join(__dirname, 'hd-capture-lib'));

const SITE = 'https://customer.example.com';  // public customer site
const ADMIN = 'https://admin.example.com';     // back-office behind a login
const OUT = path.resolve(process.argv[2] || 'evidence_hd');
const DATA = path.resolve(process.argv[3] || 'test-data');
const shot = makeShot(OUT);
const open = (page, url) => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

async function publicSite() {
  const browser = await launch(); // headless is fine without a login

  // Pattern: validation bug on a form field.
  await scenario(browser, OUT, 'WEB-001_Name_Accepts_Symbols.mp4', async page => {
    await open(page, SITE + '/register');
    const name = page.getByLabel('First Name');
    await name.fill('12345!@#');
    await mark(name);                                          // red outline = the evidence
    await mark(page.getByRole('button', { name: 'Next' }));
    await shot(page, 'WEB-001_Name_Accepts_Symbols.png');
  });

  // Pattern: file upload through the REAL file chooser (don't inject files / fake drag-drop).
  await scenario(browser, OUT, 'PASS_TC_Document_Upload.mp4', async page => {
    await open(page, SITE + '/upload');
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'Browse files' }).click()]);
    await chooser.setFiles(path.join(DATA, 'specimen_passport.jpg'));
    await page.getByText('uploaded').first().waitFor();
    await shot(page, 'PASS_TC_Document_Upload.png');
  });

  // Pattern: skipping a step by opening a later URL in a fresh session.
  await scenario(browser, OUT, 'WEB-002_Later_Step_Reachable_Without_Data.mp4', async page => {
    await open(page, SITE + '/register/review');
    await pause(page, 2000);
    await shot(page, 'WEB-002_Later_Step_Reachable_Without_Data.png');
  });

  await browser.close();
}

async function adminSite() {
  // Visible window; the USER logs in (never type credentials). One recorder, saved per step.
  const browser = await launch({ headed: true });
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  const rec = await startRecorder(ctx, page, fs.mkdtempSync(path.join(os.tmpdir(), 'qa-frames-')));

  await open(page, ADMIN + '/login');
  await loginBanner(page);
  log('WAITING FOR LOGIN - the user logs in in the Edge window (up to 10 minutes)');
  await page.waitForURL(u => !u.pathname.startsWith('/login'), { timeout: 600000 });

  // Pattern: action + reload to prove whether the status really changed. Only YOUR test record.
  await step('approve test record', async () => {
    rec.reset();
    await open(page, ADMIN + '/applications/TEST_RECORD_ID');
    await page.getByRole('button', { name: 'Approve' }).first().click();
    await page.getByRole('button', { name: 'Approve' }).last().click();   // confirm dialog
    await shot(page, 'BO-001_Approve_Success_Message.png');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await pause(page, 2000);
    await mark(page.getByText('Pending', { exact: true }).first());
    await shot(page, 'BO-001b_After_Reload_Status.png');
    await unmark(page);
    rec.save(OUT, 'BO-001_Approve_Status.mp4');
  });

  await rec.stop();
  await browser.close();
}

(async () => {
  await publicSite();
  await adminSite();
  log('done');
})().catch(e => { console.error('FAILED:', e.message.split('\n')[0]); process.exit(1); });
