import requests

BASE_URL = "http://localhost:3001"
AUTH = ("xapis30734@hutudns.com", "12345678")
HEADERS = {
    "Content-Type": "application/json"
}
TIMEOUT = 30

def test_trade_data_import_synchronization():
    url = f"{BASE_URL}/api/sync"
    
    try:
        response = requests.post(url, auth=AUTH, headers=HEADERS, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"
    
    # Acceptable success statuses (201 Created or 200 OK) assuming sync starts successfully
    if response.status_code in (200, 201):
        try:
            json_resp = response.json()
        except ValueError:
            assert False, f"Response from {url} is not valid JSON: {response.text}"
        
        # Validate presence of success confirmation keys/messages
        assert "message" in json_resp or "status" in json_resp, \
            f"Success response JSON does not include expected keys: {json_resp}"
        # Example success message validation
        if "message" in json_resp:
            assert isinstance(json_resp["message"], str) and len(json_resp["message"]) > 0, \
                f"Success message is empty or invalid: {json_resp['message']}"
        if "status" in json_resp:
            assert json_resp["status"].lower() in ["success", "ok"], \
                f"Unexpected status value: {json_resp['status']}"
        
    else:
        # On failure, expect JSON error with error/notification fields
        try:
            error_resp = response.json()
        except ValueError:
            assert False, f"Error response from {url} is not valid JSON: {response.text}"
        
        # Likely fields that hold error notification info
        error_keys = ["error", "message", "notification", "detail", "reason"]
        found_error = any(key in error_resp and error_resp[key] for key in error_keys)
        assert found_error, f"Error response JSON missing expected error notification fields: {error_resp}"
    
    # Additional check: response content-type header
    content_type = response.headers.get("Content-Type", "")
    assert "application/json" in content_type, f"Unexpected Content-Type: {content_type}"

test_trade_data_import_synchronization()