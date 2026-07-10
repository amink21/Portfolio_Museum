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

// 1. Landing hero
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/1-landing.png` });

// 2. Featured project row
await page.evaluate(() =>
  document.querySelector("[data-project]")?.scrollIntoView({ behavior: "instant", block: "center" })
);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/2-featured.png` });

// 3. Archive list + museum banner
await page.evaluate(() =>
  document.querySelector("#museum")?.scrollIntoView({ behavior: "instant" })
);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/3-museum-banner.png` });

// 4. The museum wing
await page.goto(BASE + "/museum", { waitUntil: "networkidle" });
await page.waitForTimeout(13000);
await page.screenshot({ path: `${OUT}/4-museum.png` });

// 5. After a section jump
await page.locator("nav[aria-label=Sections] button").nth(2).click();
await page.waitForTimeout(2600);
await page.screenshot({ path: `${OUT}/5-section.png` });

console.log("ERRORS:", errors.length ? errors.join("\n") : "none");
await browser.close();
