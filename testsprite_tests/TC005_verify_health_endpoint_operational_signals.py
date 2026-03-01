import requests
from requests.auth import HTTPBasicAuth

def test_verify_health_endpoint_operational_signals():
    base_url = "http://localhost:3001"
    endpoint = "/api/health"
    url = base_url + endpoint
    auth = HTTPBasicAuth("xapis30734@hutudns.com", "12345678")
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, auth=auth, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status code 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate presence of fields and types in response
    # Expecting service availability response shape, status signaling, and non-sensitive diagnostics fields

    # Basic checks on expected top-level keys in the health response (flexible)
    expected_keys = {"status", "uptime", "version", "details", "checks"}
    missing_keys = expected_keys - data.keys()
    assert not missing_keys, f"Response JSON missing expected keys: {missing_keys}"

    # Validate 'status' field is a non-empty string indicating service state
    status = data.get("status")
    assert isinstance(status, str) and status, "'status' field must be a non-empty string"

    # Uptime should be present and a positive number (seconds)
    uptime = data.get("uptime")
    assert (isinstance(uptime, (int, float)) and uptime >= 0), "'uptime' must be a non-negative number"

    # Version should be a non-empty string (non-sensitive diagnostics)
    version = data.get("version")
    assert isinstance(version, str) and version, "'version' field must be a non-empty string"

    # 'details' and 'checks' if present should be dicts (non-sensitive diagnostics)
    details = data.get("details")
    if details is not None:
        assert isinstance(details, dict), "'details' field should be an object/dict"

    checks = data.get("checks")
    if checks is not None:
        assert isinstance(checks, dict), "'checks' field should be an object/dict"

    # Check that no sensitive fields like passwords, tokens, keys appear in the response keys at top level
    sensitive_keywords = {"password", "token", "secret", "key", "auth"}
    keys_lower = {k.lower() for k in data.keys()}
    assert not any(sensitive in keys_lower for sensitive in sensitive_keywords), \
        "Response contains sensitive keys in top-level fields"

test_verify_health_endpoint_operational_signals()