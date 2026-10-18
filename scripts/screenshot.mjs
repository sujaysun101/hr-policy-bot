import { chromium } from "playwright"

const base = process.env.SCREENSHOT_BASE_URL || "http://127.0.0.1:3000"

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "light",
  deviceScaleFactor: 1,
})
await context.addInitScript(() => {
  localStorage.setItem("theme", "light")
})
const page = await context.newPage()

await page.goto(`${base}/`, { waitUntil: "networkidle" })
await page.screenshot({ path: "public/portfolio-screenshot-landing.png" })

await page.goto(`${base}/demo/home`, { waitUntil: "networkidle" })
await page.waitForSelector('[data-testid="dashboard"]')
await page.screenshot({ path: "public/portfolio-screenshot.png" })

await browser.close()
console.log("Wrote public/portfolio-screenshot.png and public/portfolio-screenshot-landing.png")
