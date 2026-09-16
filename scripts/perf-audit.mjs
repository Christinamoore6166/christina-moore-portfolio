// Headless Chrome performance + layout audit over the DevTools protocol.
//
// Measures LCP, CLS and total image transfer bytes for a page load, and
// captures a full-page screenshot at each given width. Runs actual Chrome
// (not the hidden in-app browser pane, which never paints, so Performance
// Observer entries never fire there).
//
//   node scripts/perf-audit.mjs <url> <outDir> <width1,width2,...>
//
// Writes <outDir>/metrics.json and <outDir>/<width>.png per width.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [url, outDir, widthsArg] = process.argv.slice(2);
if (!url || !outDir || !widthsArg) {
  console.error("usage: node scripts/perf-audit.mjs <url> <outDir> <width1,width2,...>");
  process.exit(1);
}
const widths = widthsArg.split(",").map(Number);

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

const PORT = 9334;
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
const listeners = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m);
    pending.delete(m.id);
  } else if (m.method) {
    const fn = listeners.get(m.method);
    if (fn) fn(m.params);
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
const on = (method, fn) => listeners.set(method, fn);
const waitFor = (method) =>
  new Promise((resolve) => {
    const prev = listeners.get(method);
    listeners.set(method, (p) => {
      listeners.set(method, prev);
      resolve(p);
    });
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Network.setCacheDisabled", { cacheDisabled: true });

let imageBytes = 0;
let imageCount = 0;
const requestTypes = new Map();
on("Network.requestWillBeSent", (p) => {
  requestTypes.set(p.requestId, p.type);
});
on("Network.loadingFinished", (p) => {
  const type = requestTypes.get(p.requestId);
  if (type === "Image") {
    imageBytes += p.encodedDataLength;
    imageCount += 1;
  }
});

async function measure(width, height) {
  imageBytes = 0;
  imageCount = 0;
  requestTypes.clear();
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  const loaded = waitFor("Page.loadEventFired");
  await send("Page.navigate", { url });
  await loaded;
  await sleep(2500); // settle: lazy images near the fold, fonts, layout

  const { result } = await send("Runtime.evaluate", {
    expression: `
      new Promise((resolve) => {
        const out = { lcp: [], cls: [], fcp: null };
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              out.lcp.push({ startTime: e.startTime, size: e.size, url: e.url || null });
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) { out.lcpError = String(e); }
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) {
              if (!e.hadRecentInput) out.cls.push({ value: e.value, startTime: e.startTime });
            }
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) { out.clsError = String(e); }
        const paint = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');
        out.fcp = paint ? paint.startTime : null;
        out.docWidth = document.documentElement.scrollWidth;
        out.docHeight = document.documentElement.scrollHeight;
        out.clientWidth = document.documentElement.clientWidth;
        setTimeout(() => resolve(JSON.stringify(out)), 600);
      })
    `,
    awaitPromise: true,
    returnByValue: true,
  });
  const metrics = JSON.parse(result.value);
  metrics.clsTotal = metrics.cls.reduce((s, e) => s + e.value, 0);
  metrics.lcpFinal = metrics.lcp.length ? metrics.lcp[metrics.lcp.length - 1] : null;
  metrics.imageBytes = imageBytes;
  metrics.imageCount = imageCount;
  return metrics;
}

async function fullPageScreenshot(name, width, viewportHeight) {
  // Keep the emulated viewport at its real height so vh-based CSS (the
  // BackdropBand height and EventFeature's max-h-[70vh]) computes the same
  // way it does for an actual visitor; captureBeyondViewport lets the clip
  // rect exceed that viewport without inflating vh units against the full
  // page height.
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: viewportHeight,
    deviceScaleFactor: 1,
    mobile: width < 768,
  });
  await sleep(300);

  // The site's scroll-reveal (IntersectionObserver + [data-reveal]) only
  // fires once a section actually crosses the viewport, which never
  // happens under captureBeyondViewport alone. Walk the page top to
  // bottom first so every section is in its post-reveal state, same as a
  // real visitor scrolling through, before the full-page capture.
  await send("Runtime.evaluate", {
    expression: `
      new Promise((resolve) => {
        // Small steps with a real pause between each: the IntersectionObserver
        // needs an actual animation frame at each scroll position to fire,
        // and jumping in full-viewport strides skips right past it.
        const step = 400;
        const max = document.documentElement.scrollHeight;
        let y = 0;
        const tick = () => {
          window.scrollTo(0, y);
          y += step;
          if (y <= max + step) setTimeout(tick, 220);
          else { window.scrollTo(0, 0); setTimeout(resolve, 300); }
        };
        tick();
      })
    `,
    awaitPromise: true,
  });
  await sleep(500);
  const { contentSize } = await send("Page.getLayoutMetrics").then(
    (r) => ({ contentSize: r.cssContentSize || r.contentSize }),
  );
  const height = Math.ceil(contentSize.height);
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height, scale: 1 },
    captureBeyondViewport: true,
  });
  fs.writeFileSync(path.join(outDir, `${name}.png`), Buffer.from(data, "base64"));
  return { width, height };
}

const report = {};
try {
  for (const w of widths) {
    const m = await measure(w, 1200);
    const shot = await fullPageScreenshot(`w${w}`, w, w < 768 ? 800 : 900);
    report[w] = { ...m, screenshot: shot };
    console.log(w, JSON.stringify({ lcp: m.lcpFinal, cls: m.clsTotal, fcp: m.fcp, imageBytes: m.imageBytes, imageCount: m.imageCount, doc: shot }));
  }
  fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(report, null, 2));
} finally {
  ws.close();
  chrome.kill();
}
