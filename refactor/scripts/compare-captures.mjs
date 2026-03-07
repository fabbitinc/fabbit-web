import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const [, , webDirArg, web2DirArg, outputDirArg] = process.argv;

if (!webDirArg || !web2DirArg || !outputDirArg) {
  console.error(
    "사용법: node refactor/scripts/compare-captures.mjs <webDir> <web2Dir> <outputDir>",
  );
  process.exit(1);
}

const webDir = path.resolve(webDirArg);
const web2Dir = path.resolve(web2DirArg);
const outputDir = path.resolve(outputDirArg);
const diffDir = path.join(outputDir, "diff");
const sideBySideDir = path.join(outputDir, "side-by-side");

fs.mkdirSync(diffDir, { recursive: true });
fs.mkdirSync(sideBySideDir, { recursive: true });

function run(command, args) {
  return execFileSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function identifySize(filePath) {
  return run("magick", ["identify", "-format", "%wx%h", filePath]);
}

function buildSideBySide(leftPath, rightPath, outputPath) {
  execFileSync("magick", [leftPath, rightPath, "+append", outputPath], {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function compareImages(leftPath, rightPath, diffPath) {
  try {
    const stdout = execFileSync(
      "compare",
      ["-metric", "AE", "-fuzz", "1%", leftPath, rightPath, diffPath],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    return stdout.trim() || "0";
  } catch (error) {
    const stderr = error.stderr?.toString().trim();
    if (stderr) {
      return stderr;
    }
    throw error;
  }
}

function parseMetric(metric) {
  const value = Number(String(metric).trim().split(/\s+/)[0]);
  return Number.isFinite(value) ? value : null;
}

const webFiles = new Set(
  fs.readdirSync(webDir).filter((file) => file.endsWith(".png")),
);
const web2Files = new Set(
  fs.readdirSync(web2Dir).filter((file) => file.endsWith(".png")),
);

const sharedFiles = [...webFiles].filter((file) => web2Files.has(file)).sort();
const results = [];

for (const file of sharedFiles) {
  const webPath = path.join(webDir, file);
  const web2Path = path.join(web2Dir, file);
  const diffPath = path.join(diffDir, file);
  const sideBySidePath = path.join(sideBySideDir, file);
  const webSize = identifySize(webPath);
  const web2Size = identifySize(web2Path);

  buildSideBySide(webPath, web2Path, sideBySidePath);

  if (webSize !== web2Size) {
    results.push({
      file,
      webSize,
      web2Size,
      diffPixels: null,
      diffPath,
      sideBySidePath,
      status: "size_mismatch",
    });
    continue;
  }

  const metric = compareImages(webPath, web2Path, diffPath);
  const diffPixels = parseMetric(metric);
  results.push({
    file,
    webSize,
    web2Size,
    diffPixels,
    diffPath,
    sideBySidePath,
    status: diffPixels === 0 ? "identical" : "different",
  });
}

results.sort((left, right) => {
  const leftValue = left.diffPixels ?? Number.MAX_SAFE_INTEGER;
  const rightValue = right.diffPixels ?? Number.MAX_SAFE_INTEGER;
  return rightValue - leftValue;
});

const summary = {
  generatedAt: new Date().toISOString(),
  webDir,
  web2Dir,
  metric: "AE",
  fuzz: "1%",
  sharedFiles,
  results,
};

fs.writeFileSync(
  path.join(outputDir, "summary.json"),
  JSON.stringify(summary, null, 2),
);

console.log(JSON.stringify(summary, null, 2));
