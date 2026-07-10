import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? ".";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

// 1. Timeline far view
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/1-timeline-far.png` });

// 2. Zoom in a couple of steps at a wing
await page.mouse.move(800, 500);
for (let i = 0; i < 14; i++) {
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(70);
}
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/2-timeline-near.png` });

// 3. Open a plaque card
await page.evaluate(() => {
  const btn = document.querySelector(".fp-node button");
  btn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/3-plaque-card.png` });

// 4. Gallery
await page.goto(BASE + "/gallery/cover-art", { waitUntil: "networkidle" });
await page.waitForTimeout(7000);
await page.screenshot({ path: `${OUT}/4-gallery.png` });

// 5. Gallery second angle (walk forward a bit is hard without lock; just wait)
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/5-gallery-b.png` });

console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
