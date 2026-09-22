// Headless Chrome captures over the DevTools protocol.
//
// Checks a page at desktop (1280), mobile (390) and dark (OS preference)
// without the in-app browser, which stops painting when its pane is hidden.
//
//   node scripts/screenshot.mjs <url> <outDir> [#anchor ...]
//
// Writes d-top.png, m-top.png, k-top.png, then d-/m-/k-<anchor>.png for
// each anchor, scrolled so the anchor sits at the top. Needs the dev
// server running and Chrome or Edge installed (or CHROME_PATH set).
// Set SHOT_EVAL to a JS expression to run on the page before each capture,
// e.g. to open a menu: SHOT_EVAL="document.querySelector('nav button').click()"
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [url, outDir, ...anchors] = process.argv.slice(2);
if (!url || !outDir) {
  console.error("usage: node scripts/screenshot.mjs <url> <outDir> [#anchor ...]");
  process.exit(1);
}

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean);
const CHROME = CANDIDATES.find((p) => fs.existsSync(p));
if (!CHROME) {
  console.error("no Chrome or Edge found; set CHROME_PATH");
  process.exit(1);
}

const PORT = 9333;
fs.mkdirSync(outDir, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(outDir, ".profile")}`,
    "--window-size=1280,900",
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pageWsUrl() {
  for (let i = 0; i < 100; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("chrome did not come up");
}

const ws = new WebSocket(await pageWsUrl());
await new Promise((r) => (ws.onopen = r));
let seq = 0;
const pending = new Map();
const waiters = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) {
    for (const w of [...waiters]) {
      if (w.method === m.method) {
        waiters.splice(waiters.indexOf(w), 1);
        w.resolve(m.params);
      }
    }
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, (m) =>
      m.error ? reject(new Error(m.error.message)) : resolve(m.result),
    );
    ws.send(JSON.stringify({ id, method, params }));
  });
const waitFor = (method) =>
  new Promise((resolve) => waiters.push({ method, resolve }));

await send("Page.enable");
await send("Runtime.enable");

async function shoot(name, width, height, { dark = false, sel = null } = {}) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "prefers-color-scheme", value: dark ? "dark" : "light" },
      {
        name: "prefers-reduced-motion",
        value: process.env.SHOT_REDUCED ? "reduce" : "no-preference",
      },
    ],
  });
  const loaded = waitFor("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await sleep(1200);
  await send("Runtime.evaluate", {
    expression: `document.documentElement.style.scrollBehavior='auto'; ${
      sel
        ? `(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (el) { el.scrollIntoView({block:'start'}); window.scrollBy(0, -16); } })();`
        : "window.scrollTo(0,0);"
    }`,
  });
  await sleep(1400);
  if (process.env.SHOT_EVAL) {
    await send("Runtime.evaluate", { expression: process.env.SHOT_EVAL });
    // Long enough for a scroll-reveal transition (up to ~duration-reveal
    // plus stagger delay) to finish before the screenshot fires.
    await sleep(1500);
  }
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, "base64"));
  console.log(name, "ok");
}

const slug = (a) => a.replace(/^#/, "");
const targets = [["top", null], ...anchors.map((a) => [slug(a), a])];

try {
  for (const [n, sel] of targets) await shoot(`d-${n}`, 1280, 1400, { sel });
  for (const [n, sel] of targets) await shoot(`m-${n}`, 390, 1600, { sel });
  for (const [n, sel] of targets) await shoot(`k-${n}`, 1280, 1400, { sel, dark: true });
} finally {
  ws.close();
  chrome.kill();
}
