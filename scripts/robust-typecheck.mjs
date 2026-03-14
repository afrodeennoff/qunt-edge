import { spawn } from "node:child_process";
import path from "node:path";

function getBin(name) {
  const ext = process.platform === "win32" ? ".cmd" : "";
  return path.join(process.cwd(), "node_modules", ".bin", `${name}${ext}`);
}

function run(cmd, args) {
  return new Promise((resolve) => {
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

function isTransientTypegenRace(output) {
  if (!output) return false;
  return output.includes("TS6053") && output.includes(".next/types/cache-life.d.ts");
}

const nodeBin = process.execPath;
const nextBin = getBin("next");
const tscBin = getBin("tsc");
const MAX_ATTEMPTS = Number(process.env.TYPECHECK_MAX_ATTEMPTS ?? "2");

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  let result = await run(nodeBin, ["scripts/ensure-next-type-stubs.mjs"]);
  if (result.code !== 0) process.exit(result.code);

  result = await run(nextBin, ["typegen"]);
  if (result.code !== 0) process.exit(result.code);

  result = await run(nodeBin, ["scripts/ensure-next-type-stubs.mjs"]);
  if (result.code !== 0) process.exit(result.code);

  result = await run(tscBin, ["--noEmit"]);
  if (result.code === 0) process.exit(0);

  const canRetry = attempt < MAX_ATTEMPTS && isTransientTypegenRace(result.output);
  if (!canRetry) process.exit(result.code);

  console.warn(
    `[typecheck] Retrying due to transient .next cache-life ENOENT (attempt ${attempt + 1}/${MAX_ATTEMPTS})`,
  );
}

process.exit(1);
