import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "../..");
const defaultThresholdPath = path.join(rootDir, "refactor/parity-thresholds.json");

function readThresholdConfig(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runNodeScript(scriptPath, args, cwd) {
  execFileSync(process.execPath, [scriptPath, ...args], {
    cwd,
    stdio: "inherit",
  });
}

function formatResult(result, threshold) {
  const status = result.diffPixels !== null && result.diffPixels <= threshold ? "PASS" : "FAIL";
  const actual = result.diffPixels === null ? "null" : String(result.diffPixels);
  return `${status} ${result.file} actual=${actual} threshold=${threshold}`;
}

const args = process.argv.slice(2).filter((value) => value !== "--");
const [thresholdArg, webArg, web2Arg, apiArg] = args;

const thresholdPath = thresholdArg
  ? path.resolve(thresholdArg)
  : process.env.PARITY_THRESHOLD_PATH
    ? path.resolve(process.env.PARITY_THRESHOLD_PATH)
    : defaultThresholdPath;

const thresholdConfig = readThresholdConfig(thresholdPath);
const webBaseUrl = webArg ?? process.env.PARITY_WEB_URL ?? thresholdConfig.webBaseUrl ?? "http://test.lvh.me:5173";
const web2BaseUrl = web2Arg ?? process.env.PARITY_WEB2_URL ?? thresholdConfig.web2BaseUrl ?? "http://test.lvh.me:5174";
const apiBaseUrl = apiArg ?? process.env.PARITY_API_URL ?? thresholdConfig.apiBaseUrl ?? "http://localhost:8080";

const captureRoot = path.join(rootDir, "refactor/.captures");
const webDir = path.join(captureRoot, "web");
const web2Dir = path.join(captureRoot, "web2");
const compareDir = path.join(captureRoot, "compare");
const captureScriptPath = path.join(rootDir, "refactor/scripts/capture-authenticated-routes.mjs");
const compareScriptPath = path.join(rootDir, "refactor/scripts/compare-captures.mjs");
const storybookDir = path.join(rootDir, "apps/storybook");

fs.rmSync(webDir, { recursive: true, force: true });
fs.rmSync(web2Dir, { recursive: true, force: true });
fs.rmSync(compareDir, { recursive: true, force: true });

runNodeScript(captureScriptPath, ["web", webBaseUrl, apiBaseUrl, webDir], storybookDir);
runNodeScript(captureScriptPath, ["web2", web2BaseUrl, apiBaseUrl, web2Dir], storybookDir);
runNodeScript(compareScriptPath, [webDir, web2Dir, compareDir], rootDir);

const summaryPath = path.join(compareDir, "summary.json");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const thresholds = thresholdConfig.routes ?? {};

const missingThresholds = summary.results.filter((result) => !(result.file in thresholds));
const failures = summary.results.filter((result) => {
  if (missingThresholds.some((item) => item.file === result.file)) {
    return false;
  }

  const threshold = thresholds[result.file];
  return result.diffPixels === null || result.diffPixels > threshold;
});

const report = {
  generatedAt: new Date().toISOString(),
  thresholdPath,
  webBaseUrl,
  web2BaseUrl,
  apiBaseUrl,
  missingThresholds: missingThresholds.map((result) => result.file),
  failures: failures.map((result) => ({
    file: result.file,
    actual: result.diffPixels,
    threshold: thresholds[result.file],
  })),
  results: summary.results.map((result) => ({
    file: result.file,
    diffPixels: result.diffPixels,
    threshold: thresholds[result.file] ?? null,
    pass: thresholds[result.file] !== undefined && result.diffPixels !== null && result.diffPixels <= thresholds[result.file],
  })),
};

fs.writeFileSync(
  path.join(compareDir, "threshold-report.json"),
  JSON.stringify(report, null, 2),
);

for (const result of summary.results) {
  if (!(result.file in thresholds)) {
    console.log(`MISSING ${result.file} threshold가 정의되지 않았습니다.`);
    continue;
  }

  console.log(formatResult(result, thresholds[result.file]));
}

if (missingThresholds.length > 0 || failures.length > 0) {
  const issues = [];

  if (missingThresholds.length > 0) {
    issues.push(`threshold 누락: ${missingThresholds.map((result) => result.file).join(", ")}`);
  }

  if (failures.length > 0) {
    issues.push(
      `threshold 초과: ${failures
        .map((result) => `${result.file}(${result.diffPixels}/${thresholds[result.file]})`)
        .join(", ")}`,
    );
  }

  console.error(issues.join(" | "));
  process.exit(1);
}
