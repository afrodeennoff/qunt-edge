import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "https://your-app.vercel.app";
const DASHBOARD_COOKIE = __ENV.DASHBOARD_COOKIE || "";
const REQUEST_TIMEOUT = __ENV.REQUEST_TIMEOUT || "20s";

export const options = {
  scenarios: {
    public_traffic: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 20 },
        { duration: "3m", target: 60 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
    dashboard_traffic: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 10 },
        { duration: "3m", target: 30 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1200", "p(99)<2500"],
    checks: ["rate>0.99"],
  },
};

function getCommonParams() {
  return {
    timeout: REQUEST_TIMEOUT,
    headers: {
      "User-Agent": "k6-loadtest",
    },
  };
}

function hitPublicPages() {
  const params = getCommonParams();
  const responses = http.batch([
    ["GET", `${BASE_URL}/`, null, params],
    ["GET", `${BASE_URL}/en`, null, params],
    ["GET", `${BASE_URL}/en/pricing`, null, params],
    ["GET", `${BASE_URL}/en/authentication`, null, params],
  ]);

  responses.forEach((res) => {
    check(res, {
      "public status < 500": (r) => r.status < 500,
      "public latency < 2s": (r) => r.timings.duration < 2000,
    });
  });
}

function hitDashboardPages() {
  if (!DASHBOARD_COOKIE) return;

  const params = {
    ...getCommonParams(),
    headers: {
      ...getCommonParams().headers,
      Cookie: DASHBOARD_COOKIE,
    },
  };

  const responses = http.batch([
    ["GET", `${BASE_URL}/en/dashboard`, null, params],
    ["GET", `${BASE_URL}/en/dashboard/import`, null, params],
    ["GET", `${BASE_URL}/en/dashboard/settings`, null, params],
  ]);

  responses.forEach((res) => {
    check(res, {
      "dashboard status < 500": (r) => r.status < 500,
      "dashboard latency < 3s": (r) => r.timings.duration < 3000,
    });
  });
}

export default function () {
  hitPublicPages();
  hitDashboardPages();
  sleep(1);
}
