/**
 * QA pass against a deployed build: BASE_URL=https://… node scripts/qa-deployed.mjs
 * Checks console/page errors, timeline interactions, all gallery wings, inspect view.
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
await page.waitForTimeout(2200);
ok("landing loads", (await page.title()).includes("Amin Kadawala"));
const cards = await page.locator("#projects article").count();
ok("coding project cards", cards >= 9, `found ${cards}`);
ok(
  "museum CTA present",
  (await page.locator("text=ENTER THE MUSEUM").count()) >= 1
);
await page.screenshot({ path: `${OUT}/q0-landing.png` });

// --- Timeline ---
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(3200);
ok("timeline loads", (await page.title()).includes("Kadawala"));
const medallions = await page.locator(".fp-node").count();
ok("24 medallions on plan", medallions === 24, `found ${medallions}`);
ok("directory present", await page.locator("text=DIRECTORY").isVisible());
ok(
  "gallery entrances visible",
  (await page.locator("text=ENTER 3D GALLERY").count()) >= 6,
  "directory links + wing doors"
);
await page.screenshot({ path: `${OUT}/q1-timeline.png` });

// Filter: focus Cover Art wing, others dim
await page.locator("nav >> text=Cover Art").click();
await page.waitForTimeout(1600);
const dimmed = await page.locator(".fp-wing.dimmed").count();
ok("filter dims other wings", dimmed === 4, `dimmed ${dimmed}`);
await page.screenshot({ path: `${OUT}/q2-filter.png` });
await page.locator("nav >> text=All Wings").click();
await page.waitForTimeout(1200);

// Plaque card — real mouse click on a medallion (guards the pointer-capture regression)
await page.locator(".fp-node button").first().click();
await page.waitForTimeout(1400);
ok("plaque card opens", await page.locator("text=DRAFT RECORD").first().isVisible());
const enterLink = page.locator("a", { hasText: "ENTER WING" });
ok("enter-wing link present", (await enterLink.count()) === 1);
await page.screenshot({ path: `${OUT}/q3-plaque.png` });
await page.keyboard.press("Escape");

// --- All five galleries ---
const wings = [
  "logos-branding",
  "cover-art",
  "headers-banners",
  "print-stationery",
  "concept-illustration",
];
for (const wing of wings) {
  await page.goto(`${BASE}/gallery/${wing}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(6500);
  const hasCanvas = (await page.locator("canvas").count()) === 1;
  ok(`gallery ${wing} renders canvas`, hasCanvas);
}
await page.screenshot({ path: `${OUT}/q4-gallery-last.png` });

// Inspect overlay: click a hung piece (unlocked pointer uses normal raycast)
await page.goto(`${BASE}/gallery/cover-art`, { waitUntil: "networkidle" });
await page.waitForTimeout(6500);
await page.mouse.click(1350, 470); // right-wall piece
await page.waitForTimeout(1500);
let inspectOpen = await page.locator("text=RETURN TO THE WING").isVisible();
if (!inspectOpen) {
  await page.mouse.click(80, 470); // left-wall piece fallback
  await page.waitForTimeout(1500);
  inspectOpen = await page.locator("text=RETURN TO THE WING").isVisible();
}
ok("inspect overlay opens on click", inspectOpen);
if (inspectOpen) await page.screenshot({ path: `${OUT}/q5-inspect.png` });

// 404 for unknown wing
const resp = await page.goto(`${BASE}/gallery/not-a-wing`, {
  waitUntil: "domcontentloaded",
});
ok("unknown wing 404s", resp.status() === 404, `status ${resp.status()}`);

// Mobile viewport smoke
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
const chipCount = await page.locator(".bottom-16 button:visible").count();
ok("mobile wing chips visible", chipCount === 5, `visible chips ${chipCount}`);
await page.screenshot({ path: `${OUT}/q6-mobile.png` });

const benign = /favicon|third-party cookie|Slow network|not-a-wing/i;
const realErrors = errors.filter((e) => !benign.test(e));
ok("no console/page errors", realErrors.length === 0, realErrors.join(" | "));

console.log(results.join("\n"));
await browser.close();
process.exit(results.some((r) => r.startsWith("FAIL")) ? 1 : 0);
