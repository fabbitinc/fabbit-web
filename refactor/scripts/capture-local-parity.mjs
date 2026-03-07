import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = requireFromCwd("playwright");

const [, , baseUrl, routePath = "/", outputPath, waitSelector = "body"] = process.argv;

if (!baseUrl || !outputPath) {
  console.error(
    "사용법: node refactor/scripts/capture-local-parity.mjs <baseUrl> <routePath> <outputPath> [waitSelector]",
  );
  process.exit(1);
}

const targetUrl = new URL(routePath, baseUrl).toString();
const resolvedOutputPath = path.resolve(outputPath);

fs.mkdirSync(path.dirname(resolvedOutputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
});

try {
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
  await page.waitForSelector(waitSelector, { timeout: 15_000 }).catch(() => undefined);
  await page.screenshot({ path: resolvedOutputPath, fullPage: true });

  console.log(
    JSON.stringify(
      {
        requestedUrl: targetUrl,
        finalUrl: page.url(),
        title: await page.title(),
        outputPath: resolvedOutputPath,
      },
      null,
      2,
    ),
  );
} finally {
  await page.close().catch(() => undefined);
  await browser.close().catch(() => undefined);
}
