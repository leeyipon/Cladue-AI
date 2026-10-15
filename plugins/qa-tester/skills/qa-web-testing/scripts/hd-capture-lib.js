// HD evidence capture helpers for QA runs (Playwright + Microsoft Edge on macOS).
//
// Screenshots: 2880x1800 PNG (1440x900 viewport at deviceScaleFactor 2).
// Videos: full-resolution MP4 stitched from CDP screencast frames. Playwright's own
// recordVideo only records at CSS-pixel size (1440x900) and pads the rest grey, so it is not used.
//
// Run scripts from the folder created by setup.sh (it holds `playwright` and `ffmpeg-static`).
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');

const req = name => require(require.resolve(name, { paths: [process.cwd(), __dirname] }));
const { chromium } = req('playwright');
const ffmpeg = req('ffmpeg-static');

const VIEW = { width: 1440, height: 900 };
const SCALE = 2;

// Visible windows stop painting when covered by other windows; screenshots then time out.
const NO_THROTTLE = ['--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'];

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const pause = (page, ms = 900) => page.waitForTimeout(ms);

async function launch({ headed = false } = {}) {
  // channel 'msedge' uses the installed Edge, so no browser download is needed.
  return chromium.launch({ channel: 'msedge', headless: !headed, slowMo: 120, args: headed ? NO_THROTTLE : [] });
}

function makeShot(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  return async (page, name) => {
    await pause(page, 700);
    await page.screenshot({ path: path.join(outDir, name) });
    log('shot', name);
  };
}

// Red outline around the element the bug is about; remove with unmark() before the next shot.
async function mark(locator) {
  await locator.evaluate(el => { el.style.outline = '4px solid #e11d48'; el.style.outlineOffset = '3px'; }).catch(() => {});
}
async function unmark(page) {
  await page.evaluate(() => document.querySelectorAll('[style*="outline"]').forEach(e => { e.style.outline = ''; }));
}

async function startRecorder(ctx, page, frameDir) {
  fs.mkdirSync(frameDir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  let frames = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = path.join(frameDir, `f${Date.now()}_${frames.length}.jpg`);
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    frames.push({ file, t: metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: VIEW.width * SCALE, maxHeight: VIEW.height * SCALE });
  return {
    reset() { frames = []; },
    // Writes <outDir>/<name>.mp4 from the frames captured since the last reset/save.
    save(outDir, name) {
      if (!frames.length) return null;
      const list = path.join(frameDir, 'list.txt');
      const lines = [];
      frames.forEach((f, i) => {
        const dur = i + 1 < frames.length ? Math.max(frames[i + 1].t - f.t, 0.02) : 1.5;
        lines.push(`file '${f.file}'`, `duration ${dur.toFixed(3)}`);
      });
      lines.push(`file '${frames[frames.length - 1].file}'`);
      fs.writeFileSync(list, lines.join('\n'));
      const mp4 = path.join(outDir, name);
      execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list,
        '-vf', `fps=30,scale=${VIEW.width * SCALE}:${VIEW.height * SCALE}:flags=lanczos`, '-c:v', 'libx264', '-preset', 'slow', '-crf', '14',
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
      log('video', name, frames.length, 'frames', (fs.statSync(mp4).size / 1e6).toFixed(2), 'MB');
      frames = [];
      return mp4;
    },
    async stop() { await cdp.send('Page.stopScreencast').catch(() => {}); },
  };
}

// One isolated browser context per scenario, recorded to <outDir>/<videoName>.
async function scenario(browser, outDir, videoName, fn) {
  log('scenario', videoName);
  const frameDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'qa-frames-'));
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: SCALE });
  const page = await ctx.newPage();
  const rec = await startRecorder(ctx, page, frameDir);
  try { await fn(page); } finally {
    await pause(page, 1500);
    await rec.stop();
    await ctx.close();
    rec.save(outDir, videoName);
    fs.rmSync(frameDir, { recursive: true, force: true });
  }
}

// Keep a run going when one step fails; the log shows what was skipped.
async function step(name, fn) {
  try { await fn(); } catch (e) { log('STEP FAILED', name, '-', e.message.split('\n')[0]); }
}

// Banner for a visible window the user must log into themselves (the agent never types passwords).
async function loginBanner(page, text = 'QA HD capture (Claude): please log in here - do NOT close this window. It closes itself when done.') {
  await page.evaluate(t => {
    const b = document.createElement('div');
    b.textContent = t;
    Object.assign(b.style, { position: 'fixed', top: '0', left: '0', right: '0', zIndex: '99999', background: '#facc15', color: '#111', font: 'bold 16px sans-serif', padding: '10px', textAlign: 'center' });
    document.body.appendChild(b);
  }, text);
  await page.bringToFront();
}

module.exports = { VIEW, SCALE, log, pause, launch, makeShot, mark, unmark, startRecorder, scenario, step, loginBanner };
