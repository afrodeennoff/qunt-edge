#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function run(command, args, label) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (label) {
    console.log(`[sync-stack] ${label}`);
  }
}

function runCapture(command, args) {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    shell: false,
    env: process.env,
    encoding: "utf8",
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  return {
    status: result.status ?? 1,
    output: `${stdout}\n${stderr}`,
  };
}

function baselineAllMigrations() {
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  const entries = readdirSync(migrationsDir, { withFileTypes: true });
  const migrationNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  console.log(
    `[sync-stack] Baseline mode: marking ${migrationNames.length} migrations as applied`,
  );

  for (const name of migrationNames) {
    run("npx", ["prisma", "migrate", "resolve", "--applied", name]);
  }
}

function parseFailedMigrationName(output) {
  const match = output.match(/The `([^`]+)` migration started at .* failed/);
  return match?.[1] ?? null;
}

run("npx", ["prisma", "generate"], "Prisma client generated");

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
const migrationUrl = rawUrl ? rawUrl.replace(/^"(.*)"$/, '$1') : null;

if (migrationUrl) {
  // Inject the direct connection URL into process.env so Prisma uses it for deployments (bypassing PgBouncer)
  process.env.DATABASE_URL = migrationUrl;

  const deploy = runCapture("npx", ["prisma", "migrate", "deploy"]);

  if (deploy.status === 0) {
    console.log("[sync-stack] Prisma migrations deployed");
  } else if (deploy.output.includes("P3005")) {
    console.log(
      "[sync-stack] Detected Prisma P3005 (existing non-empty database). Running baseline once.",
    );
    baselineAllMigrations();
    run("npx", ["prisma", "migrate", "deploy"], "Prisma migrations deployed after baseline");
  } else if (deploy.output.includes("P3009")) {
    const failedMigration = parseFailedMigrationName(deploy.output);
    const autoApplyRepairMigrations = new Set([
      "20260213091500_supabase_storage_scaling",
      "20260226120000_restrict_storage_list_objects_rpc",
    ]);

    if (failedMigration && autoApplyRepairMigrations.has(failedMigration)) {
      console.log(
        `[sync-stack] Detected P3009 for ${failedMigration}. Marking as applied and retrying deploy...`,
      );
      run("npx", ["prisma", "migrate", "resolve", "--applied", failedMigration]);
      run("npx", ["prisma", "migrate", "deploy"], "Prisma migrations deployed after P3009 repair");
    } else {
      console.error(
        `[sync-stack] P3009 detected${
          failedMigration ? ` for ${failedMigration}` : ""
        }. Manual resolution required (use prisma migrate resolve --rolled-back/--applied).`,
      );
      process.exit(deploy.status);
    }
  } else {
    process.exit(deploy.status);
  }
} else {
  console.log("[sync-stack] No DATABASE_URL found (checked DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL); skipped prisma migrate deploy");
}
