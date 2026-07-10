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

// 1. Landing
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/1-landing.png` });

// 2. Landing — museum section
await page.evaluate(() =>
  document.querySelector("#museum")?.scrollIntoView({ behavior: "instant" })
);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/2-landing-museum.png` });

// 3. Museum timeline
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}/3-timeline.png` });

// 4. Plaque card
await page.mouse.move(800, 500);
for (let i = 0; i < 8; i++) {
  await page.mouse.wheel(0, -240);
  await page.waitForTimeout(70);
}
await page.waitForTimeout(1000);
await page.evaluate(() => {
  document
    .querySelector(".fp-node button")
    ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/4-card.png` });

// 5. Gallery
await page.goto(BASE + "/gallery/cover-art", { waitUntil: "networkidle" });
await page.waitForTimeout(7000);
await page.screenshot({ path: `${OUT}/5-gallery.png` });

console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
