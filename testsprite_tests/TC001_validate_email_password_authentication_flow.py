import requests

BASE_URL = "http://localhost:3001"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_validate_email_password_authentication_flow():
    url = BASE_URL + LOGIN_ENDPOINT
    headers = {"Content-Type": "application/json"}

    valid_credentials = {
        "email": "xapis30734@hutudns.com",
        "password": "12345678"
    }
    invalid_credentials = {
        "email": "xapis30734@hutudns.com",
        "password": "wrongpassword"
    }

    # Test successful login with valid credentials
    try:
        response = requests.post(url, json=valid_credentials, headers=headers, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK for valid login, got {response.status_code}"
        json_data = response.json()
        assert "token" in json_data or "accessToken" in json_data or "authToken" in json_data, \
            "Valid login response must include an authentication token"
        assert "error" not in json_data, f"Response should not contain error on valid login, got: {json_data.get('error')}"
    except requests.RequestException as e:
        assert False, f"Request failed during valid login test: {e}"

    # Test login failure with invalid credentials
    try:
        response = requests.post(url, json=invalid_credentials, headers=headers, timeout=TIMEOUT)
        assert response.status_code in [400, 401, 403], f"Expected 400/401/403 for invalid login, got {response.status_code}"
        json_data = response.json()
        # Expect error message presence and no token
        assert "error" in json_data or "message" in json_data, "Error message should be present for invalid login."
        assert ("token" not in json_data) and ("accessToken" not in json_data) and ("authToken" not in json_data), \
            "Authentication token should not be provided for invalid login"
    except requests.RequestException as e:
        assert False, f"Request failed during invalid login test: {e}"


test_validate_email_password_authentication_flow()
