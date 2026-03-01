import { execSync } from "node:child_process";

const BASE_URL = process.env.TESTSPRITE_BASE_URL || "http://localhost:3001";

async function assertReachable(pathname) {
  const url = `${BASE_URL}${pathname}`;
  const response = await fetch(url, { redirect: "manual" });
  if (!response.ok && ![301, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(`Preflight failed: ${url} returned ${response.status}`);
  }
  return response.status;
}

function portPids(port) {
  try {
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }).trim();
    if (!out) return [];
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

async function main() {
  const p3000 = portPids(3000);
  const p3001 = portPids(3001);

  if (p3001.length !== 1) {
    throw new Error(
      `Preflight failed: expected exactly 1 process on port 3001, found ${p3001.length}.`
    );
  }
  if (p3000.length > 0) {
    throw new Error(
      `Preflight failed: port 3000 is also active (${p3000.join(", ")}). Keep one app port active for TestSprite.`
    );
  }

  const enStatus = await assertReachable("/en");
  const healthStatus = await assertReachable("/api/health");

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl: BASE_URL,
        checks: { "/en": enStatus, "/api/health": healthStatus },
        pid3001: p3001[0],
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
