// Smoke tests for Hesabak, run in CI on every push and pull request.
// Serves the app, opens it in Chromium and checks what users and search engines rely on.
//
//   cd scripts && npm install && npx playwright install chromium && npm test
/* global document, window */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png",
  ".webmanifest": "application/manifest+json", ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain", ".webp": "image/webp", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = join(ROOT, p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
}).listen(0);
const SITE = `http://127.0.0.1:${server.address().port}/`;
const URL_ = `${SITE}app/`; // the app; the landing page is at SITE

let failed = 0;
async function check(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); }
  catch (e) { failed++; console.log(`  ✗ ${name}\n      ${e.message}`); }
}
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };
const pdfPages = buf => (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(e.message));
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(URL_);
await page.waitForTimeout(300);
const sheet = async () => (await page.locator("#sheet").innerText()).replace(/\s+/g, " ");


console.log("Landing");
for (const [name, w, h] of [["desktop", 1440, 900], ["laptop", 1280, 720], ["phone", 390, 844], ["small phone", 360, 640]]) {
  await check(`fits in one screen on a ${name} (${w}x${h}) with no scrolling`, async () => {
    const p = await browser.newPage({ viewport: { width: w, height: h } });
    await p.goto(SITE); await p.waitForTimeout(1300);
    const m = await p.evaluate(() => ({ sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth }));
    await p.close();
    assert(m.sh <= h && m.sw <= w, `page is ${m.sw}x${m.sh}`);
  });
}
await check("the call to action opens the app", async () => {
  const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto(SITE); await p.click("#go"); await p.waitForURL(/\/app\/$/); await p.waitForSelector("#sheet");
  const ok = (await p.title()).includes("Hesabak");
  await p.close();
  assert(ok, "app did not open");
});
await check("landing page has a title, canonical, Open Graph and JSON-LD", async () => {
  const p = await browser.newPage();
  await p.goto(SITE);
  const t = await p.title(), canon = await p.getAttribute('link[rel="canonical"]', "href"), og = await p.getAttribute('meta[property="og:image"]', "content");
  const ld = JSON.parse(await p.evaluate(() => document.querySelector('script[type="application/ld+json"]').textContent));
  await p.close();
  assert(t.includes("Hesabak") && canon === "https://hesabak.hatemsoliman.dev/" && /^https:\/\//.test(og), `title=${t} canonical=${canon}`);
  assert(ld["@graph"].some(n => n["@type"] === "WebApplication"), "JSON-LD has no WebApplication");
});
await check("landing images and fonts exist", async () => {
  const html = readFileSync(join(ROOT, "index.html"), "utf8");
  const missing = [...html.matchAll(/(?:src|href|url\()=?["']?(landing\/[^"')\s]+)/g)].map(m => m[1]).filter(f => !existsSync(join(ROOT, f)));
  assert(!missing.length, missing.join(", "));
});

console.log("App");
await check("loads with the Hesabak title", async () => assert((await page.title()).includes("Hesabak"), `title was "${await page.title()}"`));
await check("opens on the sample invoice with the right balance", async () => {
  const t = await sheet();
  assert(t.includes("NILE-2026-01"), "sample invoice number missing");
  assert(t.includes("EGP 6,400"), "balance due should be EGP 6,400 (40 h ÷ 7 = 5.7 days × 2,000 − 5,000)");
});
for (const tpl of ["standard", "studio", "ledger", "bold"]) {
  await check(`${tpl} invoice prints on one A4 page`, async () => {
    await page.click("[data-tab=design]"); await page.click(`[data-tpl=${tpl}]`);
    await page.emulateMedia({ media: "print" });
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
    await page.emulateMedia({ media: "screen" });
    assert(pdfPages(pdf) === 1, `printed ${pdfPages(pdf)} pages`);
  });
}
await check("Make receipt records both payments and shows Paid in full", async () => {
  await page.click("[data-tpl=standard]"); await page.click("#bReceipt"); await page.waitForTimeout(150);
  const t = await sheet();
  assert(/paid in full/i.test(t), "no Paid in full stamp");
  assert(t.includes("EGP 11,400"), "amount paid should be EGP 11,400");
  await page.emulateMedia({ media: "print" });
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: "screen" });
  assert(pdfPages(pdf) === 1, `receipt printed ${pdfPages(pdf)} pages`);
});
await check("saves to the browser and survives a reload", async () => {
  await page.click("#bSave"); await page.reload(); await page.waitForTimeout(300);
  await page.click("[data-tab=saved]");
  assert((await page.locator("#hist").innerText()).includes("NILE-2026-01-R"), "saved receipt missing after reload");
});
await check("no console errors", async () => assert(errors.length === 0, errors.join(" | ")));

console.log("Phone");
await check("no sideways scrolling at 390 px", async () => {
  const p = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(URL_); await p.waitForTimeout(200);
  const w = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.close();
  assert(w <= 390, `page is ${w} px wide`);
});

console.log("Search and sharing");
await check("JSON-LD parses and names the app", async () => {
  const raw = await page.evaluate(() => document.querySelector('script[type="application/ld+json"]')?.textContent);
  assert(raw, "no JSON-LD block"); assert(JSON.parse(raw).name === "Hesabak", "JSON-LD name is not Hesabak");
});
await check("Open Graph image and canonical URL are absolute", async () => {
  const og = await page.getAttribute('meta[property="og:image"]', "content");
  const canon = await page.getAttribute('link[rel="canonical"]', "href");
  assert(/^https:\/\//.test(og) && /^https:\/\//.test(canon), `og:image=${og} canonical=${canon}`);
  assert(existsSync(join(ROOT, "og.png")), "og.png missing from the site root");
});
await check("manifest, robots.txt and sitemap.xml are valid", async () => {
  const m = JSON.parse(readFileSync(join(ROOT, "manifest.webmanifest"), "utf8"));
  assert(m.name && m.icons?.length, "manifest needs a name and icons");
  for (const i of m.icons) assert(existsSync(join(ROOT, i.src)), `manifest icon missing: ${i.src}`);
  assert(/^Sitemap: https:\/\//m.test(readFileSync(join(ROOT, "robots.txt"), "utf8")), "robots.txt has no Sitemap line");
  for (const f of ["llms.txt", "humans.txt", ".well-known/security.txt"]) assert(existsSync(join(ROOT, f)), `${f} missing`);
  const sm = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
  assert(sm.includes("<urlset") && sm.includes("<loc>https://") && sm.includes("/app/</loc>"), "sitemap.xml should list the landing page and the app");
});
await check("vercel.json parses and keeps the content security policy", async () => {
  const v = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  assert(JSON.stringify(v).includes("connect-src 'self'"), "CSP lost connect-src 'self'");
});

console.log("Docs");
await check("every wiki link points to a page", async () => {
  const dir = join(ROOT, "docs/wiki");
  const bad = [];
  for (const f of ["Home", "_Sidebar", "FAQ", "Getting-Started", "Contributing"]) {
    for (const [, n] of readFileSync(join(dir, `${f}.md`), "utf8").matchAll(/\[\[([^\]]+)\]\]/g))
      if (!existsSync(join(dir, `${n.replace(/ /g, "-")}.md`))) bad.push(`${f}: [[${n}]]`);
  }
  assert(!bad.length, bad.join(", "));
});
await check("every README image exists", async () => {
  const r = readFileSync(join(ROOT, "README.md"), "utf8");
  const missing = [...r.matchAll(/(?:src|srcset)="((?:docs|scripts)\/[^"]+)"/g)].map(m => m[1]).filter(p => !existsSync(join(ROOT, p)));
  assert(!missing.length, missing.join(", "));
});

await browser.close(); server.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
