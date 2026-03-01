import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH = HTTPBasicAuth("xapis30734@hutudns.com", "12345678")
TIMEOUT = 30

def test_validate_unsubscribe_and_email_security_flows():
    headers = {"Content-Type": "application/json"}

    # Test /api/email/unsubscribe endpoint with missing or invalid token
    unsubscribe_url = f"{BASE_URL}/api/email/unsubscribe"

    # Case 1: Missing signed token/secret, expect failure (likely 400 or 401)
    resp_missing_token = requests.post(unsubscribe_url, json={}, headers=headers, auth=AUTH, timeout=TIMEOUT)
    assert resp_missing_token.status_code in [400, 401, 403], (
        f"Expected failure status for missing token on unsubscribe, got {resp_missing_token.status_code} with body {resp_missing_token.text}"
    )

    # Case 2: Invalid token format or incorrect token
    invalid_payload = {"signedToken": "invalid-token-value"}
    resp_invalid_token = requests.post(unsubscribe_url, json=invalid_payload, headers=headers, auth=AUTH, timeout=TIMEOUT)
    assert resp_invalid_token.status_code in [400, 401, 403], (
        f"Expected failure status for invalid token on unsubscribe, got {resp_invalid_token.status_code} with body {resp_invalid_token.text}"
    )

    # Test /api/email/welcome endpoint which likely requires signed token/secret in query params or body

    welcome_url = f"{BASE_URL}/api/email/welcome"

    # Case 1: Missing signed token/secret, expect reject or failure (400 or 401)
    resp_welcome_missing = requests.get(welcome_url, headers=headers, auth=AUTH, timeout=TIMEOUT)
    assert resp_welcome_missing.status_code in [400, 401, 403], (
        f"Expected failure for missing token on welcome email endpoint, got {resp_welcome_missing.status_code} with body {resp_welcome_missing.text}"
    )

    # Case 2: Invalid token parameter, try with query param signedToken
    params_invalid_token = {"signedToken": "badtoken123"}
    resp_welcome_invalid = requests.get(welcome_url, params=params_invalid_token, headers=headers, auth=AUTH, timeout=TIMEOUT)
    assert resp_welcome_invalid.status_code in [400, 401, 403], (
        f"Expected failure for invalid token on welcome email endpoint, got {resp_welcome_invalid.status_code} with body {resp_welcome_invalid.text}"
    )

    # Assuming that a valid token is required to succeed, and no valid token is known,
    # we confirm invalid cases fail closed.
    # If server returns 404 or other codes, assert to catch unexpected behavior.
    assert resp_missing_token.status_code != 200, "Unsubscribe endpoint should not succeed without valid token"
    assert resp_invalid_token.status_code != 200, "Unsubscribe endpoint should not succeed with invalid token"
    assert resp_welcome_missing.status_code != 200, "Welcome endpoint should not succeed without valid token"
    assert resp_welcome_invalid.status_code != 200, "Welcome endpoint should not succeed with invalid token"


test_validate_unsubscribe_and_email_security_flows()
