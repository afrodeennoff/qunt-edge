import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH = HTTPBasicAuth("xapis30734@hutudns.com", "12345678")
TIMEOUT = 30

def test_validate_checkout_endpoints_post_only_enforcement():
    endpoints = ["/api/whop/checkout", "/api/whop/checkout-team"]
    headers = {"Content-Type": "application/json"}

    # Define a sample minimal valid POST payload if needed (assuming empty or minimal)
    post_payload = {}

    for endpoint in endpoints:
        url = BASE_URL + endpoint

        # Test GET request - expect 405 Method Not Allowed with Allow: POST
        try:
            get_resp = requests.get(url, auth=AUTH, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"GET request to {endpoint} raised an exception: {e}"

        assert get_resp.status_code == 405, \
            f"Expected status 405 for GET {endpoint}, got {get_resp.status_code} with body: {get_resp.text}"
        allow_header = get_resp.headers.get("Allow")
        assert allow_header is not None, f"'Allow' header missing in response for GET {endpoint}"
        allowed_methods = [m.strip().upper() for m in allow_header.split(",")]
        assert "POST" in allowed_methods and len(allowed_methods) == 1, \
            f"'Allow' header for GET {endpoint} should only include POST, got: {allow_header}"

        # Test POST request - expect security enforcement
        # We do not know exact security requirements or expected status codes for POST,
        # but assuming auth required and token given, we check for success or auth failure.

        try:
            post_resp = requests.post(url, json=post_payload, auth=AUTH, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"POST request to {endpoint} raised an exception: {e}"

        # Either acceptance or rejection on security grounds expected (401 Unauthorized or 200/201 ok)
        # We assert that it is not 405 to confirm POST is allowed.
        assert post_resp.status_code != 405, \
            f"POST request to {endpoint} should be allowed but got 405"

        # Security checks: if unauthorized, status 401 or 403 expected
        if post_resp.status_code in (401,403):
            pass  # Expected possible security rejection
        else:
            # Assume success 2xx or 4xx client errors other than method not allowed
            assert 200 <= post_resp.status_code < 300 or 400 <= post_resp.status_code < 500, \
                f"Unexpected POST response status {post_resp.status_code} for {endpoint}: {post_resp.text}"

test_validate_checkout_endpoints_post_only_enforcement()