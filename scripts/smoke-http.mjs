import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT || 4217);
const baseUrl = `http://127.0.0.1:${port}`;
const startupTimeoutMs = 45_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/`, { redirect: "manual" });
      if (response.status >= 200) return;
    } catch {
      // server not ready yet
    }
    await sleep(500);
  }

  throw new Error(`Server did not become ready within ${startupTimeoutMs}ms`);
}

function assertStatus(response, allowed, label) {
  if (allowed.includes(response.status)) return;
  throw new Error(`${label} expected status ${allowed.join("/")}, got ${response.status}`);
}

async function runChecks() {
  const rootResponse = await fetch(`${baseUrl}/`, { redirect: "manual" });
  assertStatus(rootResponse, [307, 308], "GET /");

  const rootLocation = rootResponse.headers.get("location") || "";
  if (!rootLocation.startsWith("/en")) {
    throw new Error(`GET / expected redirect to /en..., got "${rootLocation}"`);
  }

  const homeResponse = await fetch(`${baseUrl}/en`, { redirect: "manual" });
  assertStatus(homeResponse, [200], "GET /en");

  const homeHtml = await homeResponse.text();
  if (!homeHtml.includes("<!DOCTYPE html>")) {
    throw new Error("GET /en did not return HTML document");
  }

  const dashboardResponse = await fetch(`${baseUrl}/en/dashboard`, { redirect: "manual" });
  assertStatus(dashboardResponse, [307, 308], "GET /en/dashboard");

  const dashboardLocation = dashboardResponse.headers.get("location") || "";
  if (!dashboardLocation.startsWith("/en/authentication")) {
    throw new Error(
      `GET /en/dashboard expected redirect to /en/authentication..., got "${dashboardLocation}"`
    );
  }
}

async function main() {
  const server = spawn(
    "npm",
    ["run", "-s", "start", "--", "-p", String(port)],
    {
      env: { ...process.env, PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  let serverLogs = "";
  server.stdout.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverLogs += chunk.toString();
  });

  try {
    await waitForServer();
    await runChecks();
    process.stdout.write("Smoke checks passed.\n");
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.stderr.write(`\nServer output:\n${serverLogs}\n`);
    process.exitCode = 1;
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => {
      server.once("exit", () => resolve());
      setTimeout(() => {
        server.kill("SIGKILL");
        resolve();
      }, 5000);
    });
  }
}

await main();
