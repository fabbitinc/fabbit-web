import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const requireFromCwd = createRequire(path.join(process.cwd(), "package.json"));
const { chromium } = requireFromCwd("playwright");

const [, , appName, baseUrl, apiBaseUrl, outputDir] = process.argv;

if (!appName || !baseUrl || !apiBaseUrl || !outputDir) {
  console.error(
    "사용법: node refactor/scripts/capture-authenticated-routes.mjs <appName> <baseUrl> <apiBaseUrl> <outputDir>",
  );
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const resolvedOutputDir = path.resolve(outputDir);
const templateFixturePath = process.env.PARITY_TEMPLATE_FIXTURE
  ? path.resolve(process.env.PARITY_TEMPLATE_FIXTURE)
  : path.resolve(scriptDir, "../fixtures/template-analysis-sample.csv");

if (!fs.existsSync(templateFixturePath)) {
  console.error(`매핑 캡처용 fixture를 찾지 못했습니다: ${templateFixturePath}`);
  process.exit(1);
}

fs.mkdirSync(resolvedOutputDir, { recursive: true });

function waitFor(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForAppReady(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(1_000);
}

async function waitForShellReady(page) {
  await page.waitForLoadState("domcontentloaded", { timeout: 30_000 });
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(800);
}

async function waitForLocatorEnabled(locator, timeout = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeout) {
    if (await locator.isEnabled().catch(() => false)) {
      return;
    }

    await waitFor(250);
  }

  throw new Error("버튼이 활성화될 때까지 기다리는 중 timeout이 발생했습니다.");
}

async function captureTimeoutArtifacts(page, outputDir, prefix) {
  const screenshotPath = path.join(outputDir, `${prefix}.png`);
  const textPath = path.join(outputDir, `${prefix}.txt`);

  await captureScreenshot(page, screenshotPath).catch(() => undefined);

  const bodyText = await page.locator("body").innerText().catch(() => "");
  fs.writeFileSync(textPath, bodyText, "utf8");

  return { screenshotPath, textPath };
}

function toRoutePath(value) {
  if (value instanceof URL) {
    return `${value.pathname}${value.search}`;
  }

  const url = new URL(value, baseUrl);
  return `${url.pathname}${url.search}`;
}

async function login(page) {
  await page.goto(new URL("/login", baseUrl).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  await waitForAppReady(page);

  await page.fill('input[type="email"]', "test@gmail.com");
  await page.fill('input[type="password"]', "qwer1234");
  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 30_000,
  });
  await waitForAppReady(page);
}

async function resolveRouteTargets(page) {
  return page.evaluate(async (input) => {
    const token = window.localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("로그인 후 accessToken을 찾지 못했습니다.");
    }

    async function getJson(pathname) {
      const response = await fetch(`${input.apiBaseUrl}${pathname}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`${pathname} 조회 실패: ${response.status}`);
      }

      return response.json();
    }

    const [issues, changes, projects, parts] = await Promise.all([
      getJson("/api/v1/issues"),
      getJson("/api/v1/changes"),
      getJson("/api/v1/projects"),
      getJson("/api/v1/parts?limit=1"),
    ]);

    const issueNumber = issues?.items?.[0]?.number ?? null;
    const firstChangeNumber = changes?.items?.[0]?.number ?? null;
    const prChangeNumber =
      changes?.items?.find?.((item) => item?.type === "pr")?.number ?? firstChangeNumber;
    const projectId = projects?.items?.[0]?.id ?? null;
    const partId = parts?.items?.[0]?.id ?? null;

    return {
      issueNumber,
      firstChangeNumber,
      prChangeNumber,
      projectId,
      partId,
      routes: [
        { name: "app-shell", path: "/" },
        { name: "issue-create", path: "/changes/issues/new" },
        { name: "change-create", path: "/changes/requests/new" },
        issueNumber ? { name: "issue-detail", path: `/changes/issues/${issueNumber}` } : null,
        prChangeNumber ? { name: "change-detail", path: `/changes/requests/${prChangeNumber}` } : null,
        prChangeNumber
          ? { name: "change-detail-changes", path: `/changes/requests/${prChangeNumber}?tab=changes` }
          : null,
        { name: "project-list", path: "/projects" },
        projectId ? { name: "project-detail", path: `/projects/${projectId}` } : null,
        { name: "parts-list", path: "/parts" },
        partId ? { name: "part-detail", path: `/parts/${partId}` } : null,
      ].filter(Boolean),
    };
  }, { apiBaseUrl });
}

async function captureCurrentPage(page, name, options = {}) {
  await waitForAppReady(page);

  const filename = `${name}.png`;
  const screenshotPath = path.join(resolvedOutputDir, filename);
  await captureScreenshot(page, screenshotPath, options);

  return {
    name,
    path: toRoutePath(page.url()),
    finalPath: toRoutePath(page.url()),
    title: await page.title(),
    screenshotPath,
  };
}

async function captureRoute(page, route) {
  const url = new URL(route.path, baseUrl).toString();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
  return captureCurrentPage(page, route.name);
}

async function enableCaptureMode(page) {
  await page.evaluate(() => {
    const styleId = "__parity_capture_style__";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        html[data-parity-capture="true"] *,
        html[data-parity-capture="true"] *::before,
        html[data-parity-capture="true"] *::after {
          animation: none !important;
          transition: none !important;
          caret-color: transparent !important;
        }

        html[data-parity-capture="true"] * {
          pointer-events: none !important;
        }
      `;
      document.head.append(style);
    }

    document.documentElement.setAttribute("data-parity-capture", "true");
  });
  await page.waitForTimeout(100);
}

async function disableCaptureMode(page) {
  await page.evaluate(() => {
    document.documentElement.removeAttribute("data-parity-capture");
  }).catch(() => undefined);
}

async function captureScreenshot(page, screenshotPath, options = {}) {
  await enableCaptureMode(page);

  try {
    await page.screenshot({ path: screenshotPath, fullPage: true, ...options });
  } finally {
    await disableCaptureMode(page);
  }
}

async function captureMappingFlow(page) {
  const capturedRoutes = [];

  await page.goto(new URL("/parts/templates", baseUrl).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  capturedRoutes.push(await captureCurrentPage(page, "parts-template-analysis"));

  await page.locator('input[type="file"]').setInputFiles(templateFixturePath);

  await page.waitForURL((url) => url.pathname === "/parts/templates/processing", {
    timeout: 120_000,
  });
  await waitForShellReady(page);
  await page.getByText("속성 분석 처리").waitFor({ state: "visible", timeout: 30_000 });
  await waitFor(3_500);

  const processingPath = page.url();
  const processingScreenshotPath = path.join(resolvedOutputDir, "parts-template-processing.png");
  await captureScreenshot(page, processingScreenshotPath);
  capturedRoutes.push({
    name: "parts-template-processing",
    path: toRoutePath(processingPath),
    finalPath: toRoutePath(page.url()),
    title: await page.title(),
    screenshotPath: processingScreenshotPath,
  });

  const proceedButton = page.getByRole("button", { name: "매핑 확인" });
  try {
    await waitForLocatorEnabled(proceedButton, 120_000);
  } catch (error) {
    const artifacts = await captureTimeoutArtifacts(page, resolvedOutputDir, "parts-template-processing-timeout");
    throw new Error(
      `매핑 확인 버튼이 활성화되지 않았습니다. screenshot=${artifacts.screenshotPath} text=${artifacts.textPath}`,
      { cause: error },
    );
  }
  await proceedButton.click();

  await page.waitForURL((url) => url.pathname === "/parts/templates/mapping", {
    timeout: 30_000,
  });
  capturedRoutes.push(await captureCurrentPage(page, "parts-template-mapping"));

  return capturedRoutes;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 1,
});

try {
  await login(page);
  const targets = await resolveRouteTargets(page);

  const capturedRoutes = [];
  for (const route of targets.routes) {
    capturedRoutes.push(await captureRoute(page, route));
  }

  capturedRoutes.push(...(await captureMappingFlow(page)));

  const result = {
    appName,
    baseUrl,
    apiBaseUrl,
    templateFixturePath,
    capturedAt: new Date().toISOString(),
    targets,
    capturedRoutes,
  };

  const jsonPath = path.join(resolvedOutputDir, `${appName}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await page.close().catch(() => undefined);
  await browser.close().catch(() => undefined);
}
