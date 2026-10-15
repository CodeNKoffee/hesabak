// Records the README's banner, GIFs and screenshots from the real app, using the built-in fictional
// sample (Layla Mansour, Nile Bakery Co.), so the README never shows anyone's real data.
//
//   cd scripts && npm install && npm run media            # everything
//   npm run media -- templates receipt                    # only some scenes (templates, profile,
//                                                        receipt, blocks, diagram, stills)
//
// Needs ffmpeg and gifsicle on PATH. Writes to docs/readme/.
/* global document, window */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const OUT = join(ROOT, "docs/readme");
const TMP = join(HERE, ".media-tmp");
const want = n => process.argv.length <= 2 || process.argv.includes(n);
mkdirSync(OUT, { recursive: true }); rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });

/* --- a tiny static server for the app (the app has no build step) --- */
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".svg":"image/svg+xml", ".png":"image/png", ".webmanifest":"application/manifest+json", ".woff2":"font/woff2", ".json":"application/json" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p === "/") p = "/index.html";
  const f = join(ROOT, p);
  if (!f.startsWith(ROOT) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "content-type": TYPES[extname(f)] || "application/octet-stream" }); res.end(readFileSync(f));
}).listen(0);
const URL_ = `http://127.0.0.1:${server.address().port}/`;

const ARABIC = readFileSync(join(HERE, "readme/fonts/noto-sans-arabic-arabic-600-normal.woff2")).toString("base64");
const browser = await chromium.launch();

async function openApp(viewport = { width: 1280, height: 800 }) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(URL_);
  // Arabic in the top bar: Linux CI machines often have no Arabic font at all
  await page.addStyleTag({ content: `@font-face{font-family:MediaArabic;src:url(data:font/woff2;base64,${ARABIC})} .brand .ar{font-family:MediaArabic,sans-serif}` });
  await page.waitForTimeout(250);
  return { ctx, page };
}
const openSections = page => page.evaluate(() => document.querySelectorAll("details").forEach(d => d.open = true));

/* --- GIF recorder: screenshots with hold times, stitched by ffmpeg, squeezed by gifsicle --- */
function recorder(page, name, width = 960) {
  const dir = join(TMP, name); mkdirSync(dir, { recursive: true });
  const frames = [];
  return {
    async snap(seconds = 0.12) {
      const f = join(dir, `${String(frames.length).padStart(4, "0")}.png`);
      await page.screenshot({ path: f }); frames.push([f, seconds]);
    },
    async type(selector, text, every = 2) {
      await page.click(selector); await page.fill(selector, "");
      for (let i = 0; i < text.length; i += every) { await page.type(selector, text.slice(i, i + every)); await this.snap(0.07); }
    },
    build() {
      const list = frames.map(([f, d]) => `file '${f}'\nduration ${d}`).join("\n") + `\nfile '${frames.at(-1)[0]}'\n`;
      writeFileSync(join(dir, "list.txt"), list);
      const raw = join(dir, "raw.gif");
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
        "-vf", `scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=none:diff_mode=rectangle`,
        "-vsync", "vfr", raw]);
      execFileSync("gifsicle", ["-O3", "--lossy=60", "--colors", "128", raw, "-o", join(OUT, `${name}.gif`)]);
      console.log(`✓ ${name}.gif (${(statSync(join(OUT, `${name}.gif`)).size / 1e6).toFixed(1)} MB)`);
    }
  };
}

/* --- printing a sheet to PNG, the same way Save PDF does --- */
async function sheetPng(page, file, dpi = 110) {
  await page.emulateMedia({ media: "print" });
  const pdf = join(TMP, file.replace(/\.png$/, ".pdf"));
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  await page.emulateMedia({ media: "screen" });
  const base = join(TMP, file.replace(/\.png$/, ""));
  execFileSync("pdftoppm", ["-r", String(dpi), "-png", "-singlefile", pdf, base]);
  return base + ".png";
}
async function fillReceipt(page) {
  await page.click("#bReceipt"); await page.click("[data-tab=details]"); await openSections(page);
  await page.fill("#py-d-0", "2026-10-02"); await page.fill("#py-m-0", "Bank transfer");
  await page.fill("#py-m-1", "InstaPay"); await page.fill("#py-r-1", "IPN-4471-2026");
}

/* ================= scenes ================= */

if (want("templates")) {
  const { ctx, page } = await openApp(); const r = recorder(page, "templates");
  await page.click("[data-tab=design]"); await r.snap(1.0);
  for (const t of ["studio", "ledger", "bold", "standard"]) { await page.click(`[data-tpl=${t}]`); await r.snap(1.3); }
  for (const c of ["#F26A1B", "#2F5BEA", "#B4232C", "#1F6F5C"]) { await page.fill("#accentHex", c); await r.snap(0.8); }
  r.build(); await ctx.close();
}

if (want("profile")) {
  const { ctx, page } = await openApp(); const r = recorder(page, "profile");
  await r.snap(1.0);
  // "Duplicate" keeps the sample client and figures on the page, so you can watch the identity change
  await page.click("[data-tab=profiles]"); await page.click("#bDupProfile"); await r.snap(0.6);
  await r.type("#pLabel", "Omar's studio", 3);
  await r.type("#fName", "Omar Adel", 2);
  await r.type("#fRole", "Motion designer", 3);
  await r.type("#fEmail", "omar@example.com", 4);
  await r.type("#fLines", "Heliopolis, Cairo", 4);
  await page.click("[data-tab=design]"); await r.snap(0.4);
  await r.type("#bMain", "omaradel", 2);
  await r.type("#bAcc", ".studio", 2);
  await page.fill("#accentHex", "#6D3CE8"); await r.snap(0.6);
  await page.click("[data-tpl=bold]"); await r.snap(2.2);
  r.build(); await ctx.close();
}

if (want("receipt")) {
  const { ctx, page } = await openApp(); const r = recorder(page, "receipt");
  await r.snap(1.2);
  await page.click("#bReceipt"); await r.snap(1.0);
  await page.click("[data-tab=details]"); await openSections(page);
  await page.locator("#pays").scrollIntoViewIfNeeded(); await r.snap(0.6);
  await r.type("#py-m-0", "Bank transfer", 4);
  await page.fill("#py-d-0", "2026-10-02"); await r.snap(0.5);
  await r.type("#py-m-1", "InstaPay", 3);
  await r.type("#py-r-1", "IPN-4471-2026", 4);
  await r.snap(2.4);
  r.build(); await ctx.close();
}

if (want("blocks")) {
  const { ctx, page } = await openApp(); const r = recorder(page, "blocks");
  await page.click("[data-tab=design]"); await page.locator("#blocks").scrollIntoViewIfNeeded(); await r.snap(1.0);
  const idx = name => page.$$eval(".blk .nm", (els, n) => els.findIndex(e => e.textContent.startsWith(n)), name);
  for (let i = 0; i < 3; i++) { await page.click(`[data-up="${await idx("Notes")}"]`); await r.snap(0.7); }
  await page.uncheck("#blk-parties"); await r.snap(1.0);
  await page.check("#blk-parties"); await r.snap(0.5);
  await page.click("#bResetBlocks"); await r.snap(0.8);
  await page.click("[data-tab=details]"); await openSections(page);
  await page.locator("#chips").scrollIntoViewIfNeeded();
  await page.fill("#extraNote", ""); await page.click("#extraNote"); await r.snap(0.5);
  for (const bit of ["Thanks, ", "{client}", ". Balance on ", "{invoice}", ": ", "{balance}", "."]) {
    if (bit.startsWith("{")) await page.click(`.chip[data-token="${bit}"]`); else await page.type("#extraNote", bit);
    await r.snap(0.45);
  }
  await r.snap(2.2);
  r.build(); await ctx.close();
}

if (want("diagram")) {
  // Drawn here rather than as a mermaid block in the README: GitHub's mermaid viewer is an iframe that
  // fails in some browsers and private repos ("Unable to render rich display"). A PNG always shows.
  const MJS = process.env.MERMAID_JS || createRequire(import.meta.url).resolve("mermaid/dist/mermaid.min.js");
  const src = readFileSync(join(HERE, "readme/billing.mmd"), "utf8");
  const looks = {
    light: { theme: "base", themeVariables: { fontFamily: "Helvetica, Arial, sans-serif", fontSize: "15px", primaryColor: "#ffffff", primaryBorderColor: "#141414", primaryTextColor: "#141414", lineColor: "#F26A1B", edgeLabelBackground: "#ffffff", tertiaryTextColor: "#141414" } },
    dark:  { theme: "base", themeVariables: { fontFamily: "Helvetica, Arial, sans-serif", fontSize: "15px", primaryColor: "#161b22", primaryBorderColor: "#e6edf3", primaryTextColor: "#e6edf3", lineColor: "#F26A1B", edgeLabelBackground: "#0d1117", tertiaryTextColor: "#e6edf3" } }
  };
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 400 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  for (const [name, cfg] of Object.entries(looks)) {
    await page.setContent(`<body style="margin:0;padding:12px;background:${name === "dark" ? "#0d1117" : "#ffffff"}"><div id="d"></div></body>`);
    await page.addScriptTag({ path: MJS });
    await page.evaluate(async ({ src, cfg }) => {
      window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict", ...cfg });
      document.getElementById("d").innerHTML = (await window.mermaid.render("billing", src)).svg;
    }, { src, cfg });
    await page.locator("#d").screenshot({ path: join(OUT, `diagram-${name}.png`) });
  }
  console.log("✓ diagram-light.png, diagram-dark.png");
  await ctx.close();
}

if (want("stills") || want("banner")) {
  const { ctx, page } = await openApp();
  await page.screenshot({ path: join(OUT, "app.png") });
  await page.click("[data-tab=design]"); await page.fill("#accentHex", "#F26A1B"); // printed sheets in the brand orange
  await page.click("[data-tab=details]");
  const sheets = {};
  for (const t of ["standard", "studio", "ledger", "bold"]) {
    await page.click("[data-tab=design]"); await page.click(`[data-tpl=${t}]`);
    sheets[t] = await sheetPng(page, `sheet-${t}.png`);
  }
  await page.click("[data-tpl=standard]"); await fillReceipt(page);
  sheets["standard-receipt"] = await sheetPng(page, "sheet-standard-receipt.png");
  await page.click("[data-tab=design]"); await page.click("[data-tpl=studio]");
  sheets["studio-receipt"] = await sheetPng(page, "sheet-studio-receipt.png");
  for (const [k, f] of Object.entries(sheets)) execFileSync("cp", [f, join(OUT, `sheet-${k}.png`)]);
  console.log("✓ app.png, sheet-*.png");
  await ctx.close();

  const phone = await openApp({ width: 390, height: 844 });
  await phone.page.screenshot({ path: join(OUT, "phone.png") });
  await phone.ctx.close();
  console.log("✓ phone.png");

  // banner: HTML laid over the sheets just printed
  const html = readFileSync(join(HERE, "readme/banner.html"), "utf8");
  const bdir = join(TMP, "banner"); mkdirSync(join(bdir, "fonts"), { recursive: true });
  writeFileSync(join(bdir, "banner.html"), html);
  execFileSync("sh", ["-c", `cp "${join(HERE, "readme/fonts")}"/*.woff2 "${join(bdir, "fonts")}/" && cp "${OUT}"/sheet-*.png "${bdir}/"`]);
  const bp = await (await browser.newContext({ viewport: { width: 1280, height: 640 } })).newPage();
  for (const theme of ["light", "dark"]) {
    await bp.goto(`file://${join(bdir, "banner.html")}?theme=${theme}`);
    await bp.evaluate(() => document.fonts.ready); await bp.waitForTimeout(200);
    await bp.screenshot({ path: join(OUT, `banner-${theme}.png`) });
  }
  console.log("✓ banner-light.png, banner-dark.png");
}

await browser.close(); server.close();
rmSync(TMP, { recursive: true, force: true });
