#!/usr/bin/env node

import { spawnSync } from "node:child_process"

const run = (label, args) => {
  console.log(`\n[Self-Heal] ${label}`)
  const result = spawnSync("npm", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  })

  return result.status ?? 1
}

const autoFixCode = run("Running ESLint auto-fix", ["run", "lint", "--", "--fix"])
if (autoFixCode !== 0) {
  console.error(`\n[Self-Heal] Auto-fix failed with exit code ${autoFixCode}.`)
  process.exit(autoFixCode)
}

const verifyCode = run("Running validation lint pass", ["run", "lint"])
if (verifyCode !== 0) {
  console.error(`\n[Self-Heal] Validation failed with exit code ${verifyCode}.`)
  process.exit(verifyCode)
}

console.log("\n[Self-Heal] Completed. Auto-fix pass + validation pass are done.")
