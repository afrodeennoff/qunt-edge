import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
USERNAME = "xapis30734@hutudns.com "
PASSWORD = "12345678"
TIMEOUT = 30

def test_verify_dashboard_data_retrieval():
    auth = HTTPBasicAuth(USERNAME.strip(), PASSWORD)
    headers = {
        "Accept": "application/json",
    }

    # Test GET /api/trades
    try:
        trades_resp = requests.get(f"{BASE_URL}/api/trades", auth=auth, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to /api/trades failed with exception: {e}"
    assert trades_resp.status_code == 200, f"Expected status 200 for /api/trades but got {trades_resp.status_code}. Response text: {trades_resp.text}"
    try:
        trades_data = trades_resp.json()
    except ValueError:
        assert False, "Response from /api/trades is not valid JSON."
    # Check that trades_data is a list or dict (trade data shape)
    assert isinstance(trades_data, (list, dict)), f"Unexpected data structure from /api/trades: {type(trades_data)}"

    # Test GET /api/user-data
    try:
        user_data_resp = requests.get(f"{BASE_URL}/api/user-data", auth=auth, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to /api/user-data failed with exception: {e}"
    assert user_data_resp.status_code == 200, f"Expected status 200 for /api/user-data but got {user_data_resp.status_code}. Response text: {user_data_resp.text}"
    try:
        user_data = user_data_resp.json()
    except ValueError:
        assert False, "Response from /api/user-data is not valid JSON."
    # Check user_data is a dict containing expected keys
    assert isinstance(user_data, dict), f"Unexpected data structure from /api/user-data: {type(user_data)}"
    # Check presence of some common dashboard user properties (example keys)
    expected_keys = ['userId', 'username', 'preferences', 'dashboardSettings']
    keys_found = any(key in user_data for key in expected_keys)
    assert keys_found, f"Response from /api/user-data missing expected dashboard keys. Keys received: {list(user_data.keys())}"

test_verify_dashboard_data_retrieval()
