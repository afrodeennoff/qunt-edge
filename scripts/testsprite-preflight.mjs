const BASE_URL = process.env.TESTSPRITE_BASE_URL || "http://localhost:3001";

async function assertReachable(pathname) {
  const url = `${BASE_URL}${pathname}`;
  const response = await fetch(url, { redirect: "manual" });
  if (!response.ok && ![301, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(`Preflight failed: ${url} returned ${response.status}`);
  }
  return response.status;
}

async function probe(url) {
  try {
    const response = await fetch(url, { redirect: "manual" });
    return response.status;
  } catch {
    return null;
  }
}

async function main() {
  const p3001Status = await probe("http://localhost:3001/en");
  if (!p3001Status) {
    throw new Error(
      "Preflight failed: localhost:3001 is not reachable. Start the app on port 3001 first."
    );
  }
  const p3000Status = await probe("http://localhost:3000/en");
  if (p3000Status) {
    throw new Error(
      `Preflight failed: localhost:3000 is also reachable (${p3000Status}). Keep a single active app port for TestSprite.`
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
        ports: { "3001": p3001Status, "3000": p3000Status },
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
