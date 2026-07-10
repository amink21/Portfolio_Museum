/**
 * QA pass against a deployed build: BASE_URL=https://… node scripts/qa-deployed.mjs
 * Landing (hero, 12 projects, marquee), single-wing museum (sections, inspect),
 * /gallery/* redirects, mobile chips, console errors.
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? ".";
const results = [];
const ok = (name, pass, note = "") =>
  results.push(`${pass ? "PASS" : "FAIL"}  ${name}${note ? ` — ${note}` : ""}`);

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error")
    errors.push(`console: ${m.text()} @ ${m.location().url}`);
});

// --- Landing ---
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(4200); // preloader runs ~2.5s on first visit
ok("landing loads", (await page.title()).includes("Amin Kadawala"));
ok(
  "hero museum link present",
  await page.locator("h1 >> text=in a museum").isVisible()
);
const cards = await page.locator("[data-project]").count();
ok("12 coding projects", cards === 12, `found ${cards}`);
ok("marquee band present", (await page.locator(".marquee-track").count()) === 1);
ok(
  "new projects present",
  (await page.locator("text=Klovio").count()) >= 1 &&
    (await page.locator("text=Who Funds Québec?").count()) >= 1 &&
    (await page.locator("text=MTLParking").count()) >= 1
);
ok(
  "museum CTA present",
  (await page.locator("text=ENTER THE MUSEUM").count()) >= 1
);
await page.screenshot({ path: `${OUT}/q0-landing.png` });

// --- Museum: straight into the 3D wing ---
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(13000); // entry card + shader compile
ok("museum canvas renders", (await page.locator("canvas").count()) === 1);
const sectionButtons = await page
  .locator("nav[aria-label=Sections] button")
  .count();
ok("5 section jumps in index", sectionButtons === 5, `found ${sectionButtons}`);
await page.screenshot({ path: `${OUT}/q1-museum.png` });

// Jump to a later section, then inspect a piece
await page.locator("nav[aria-label=Sections] button").nth(2).click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/q2-section-jump.png` });

// Inspect: click a hung piece (left wall first, then right as fallback)
let inspectOpen = false;
for (const [x, y] of [
  [260, 470],
  [1340, 470],
  [420, 460],
]) {
  await page.mouse.click(x, y);
  await page.waitForTimeout(1400);
  inspectOpen = await page.locator("text=RETURN TO THE WING").isVisible();
  if (inspectOpen) break;
  if (await page.evaluate(() => !!document.pointerLockElement)) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
  }
}
ok("inspect overlay opens on click", inspectOpen);
if (inspectOpen) {
  await page.screenshot({ path: `${OUT}/q3-inspect.png` });
  await page.keyboard.press("Escape");
}

// --- Old wing routes redirect into the museum ---
const resp = await page.goto(`${BASE}/gallery/cover-art`, {
  waitUntil: "domcontentloaded",
});
ok(
  "old wing URL redirects to /museum",
  resp.status() === 200 && page.url().includes("/museum"),
  page.url()
);

// --- Mobile: museum is desktop-only, small screens get the gate ---
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
ok(
  "mobile gets desktop-only gate",
  await page.locator("text=DESKTOP EXPERIENCE").isVisible()
);
ok(
  "gate has no 3D canvas",
  (await page.locator("canvas").count()) === 0
);
await page.screenshot({ path: `${OUT}/q4-mobile-gate.png` });

const benign = /favicon|third-party cookie|Slow network/i;
const realErrors = errors.filter((e) => !benign.test(e));
ok("no console/page errors", realErrors.length === 0, realErrors.join(" | "));

console.log(results.join("\n"));
await browser.close();
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
