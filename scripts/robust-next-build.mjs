import { spawn } from "node:child_process";
import path from "node:path";

function getBin(name) {
  const ext = process.platform === "win32" ? ".cmd" : "";
  return path.join(process.cwd(), "node_modules", ".bin", `${name}${ext}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run(cmd, args) {
  return await new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
      shell: false,
    });

    let output = "";
    child.stdout.on("data", (d) => {
      process.stdout.write(d);
      output += d.toString("utf8");
    });
    child.stderr.on("data", (d) => {
      process.stderr.write(d);
      output += d.toString("utf8");
    });

    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

function isTransientNextBuildFsRace(output) {
  if (!output) return false;
  const hasEnoent = output.includes("ENOENT: no such file or directory");
  const hasNextTypesMissing = /Type error:\s*File '.*\/\.next\/types\/.*' not found\./.test(output);
  if (!hasEnoent && !hasNextTypesMissing) return false;

  // Observed intermittent races in this workspace:
  // - .next/build-manifest.json
  // - .next/server/pages-manifest.json
  // - _buildManifest.js.tmp.* / _buildManifest.js
  // Retry only specific build-artifact misses observed in this workspace.
  return /\/\.next\/(server\/)?(pages-manifest\.json|build-manifest\.json)/.test(
    output,
  ) || /\/\.next\/static\/.*_buildManifest\.js(\.tmp\.[^'"\s]+)?/.test(output)
    || /\/\.next\/server\/[^'"\s]+\.nft\.json/.test(output)
    || /\/\.next\/types\//.test(output);
}

const MAX_ATTEMPTS = Number(process.env.NEXT_BUILD_MAX_ATTEMPTS ?? "4");
const RETRY_DELAY_MS = Number(process.env.NEXT_BUILD_RETRY_DELAY_MS ?? "250");

const nextBin = getBin("next");
const args = ["build", "--webpack"];

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const { code, output } = await run(nextBin, args);
  if (code === 0) process.exit(0);

  const canRetry = attempt < MAX_ATTEMPTS && isTransientNextBuildFsRace(output);
  if (!canRetry) process.exit(code);

  console.warn(
    `[build] Retrying next build due to transient .next ENOENT (attempt ${attempt + 1}/${MAX_ATTEMPTS})`,
  );
  await sleep(RETRY_DELAY_MS);
}

process.exit(1);
