import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH_USERNAME = "xapis30734@hutudns.com"
AUTH_PASSWORD = "12345678"
TIMEOUT = 30

def test_verify_cron_endpoints_require_service_auth():
    cron_paths = [
        "/api/cron",
        "/api/cron/investing",
        "/api/cron/compute-trade-data"
    ]

    # Test unauthorized requests: Expect 401 or 403
    for path in cron_paths:
        url = BASE_URL + path
        try:
            response = requests.get(url, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request to {url} failed unexpectedly with error: {e}"
        else:
            # Expect unauthorized error status (401 Unauthorized or 403 Forbidden)
            assert response.status_code in (401, 403), (
                f"Unauthorized request to {url} should be rejected with 401 or 403, "
                f"but got status code {response.status_code} and response: {response.text}"
            )

    # Test authorized requests: Expect success (2xx) with Basic Auth header
    auth = HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD)
    for path in cron_paths:
        url = BASE_URL + path
        try:
            response = requests.get(url, auth=auth, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Authorized request to {url} failed unexpectedly with error: {e}"
        else:
            assert response.status_code >= 200 and response.status_code < 300, (
                f"Authorized request to {url} expected 2xx success but got {response.status_code} "
                f"with response: {response.text}"
            )
            # Optionally check response content type or structure if known
            assert response.text, f"Authorized response from {url} is empty."

test_verify_cron_endpoints_require_service_auth()
