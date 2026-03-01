import requests
from requests.auth import HTTPBasicAuth

BASE_URL = "http://localhost:3001"
AUTH_USERNAME = "xapis30734@hutudns.com "
AUTH_PASSWORD = "12345678"
TIMEOUT = 30

def test_validate_teams_dashboard_access_and_data():
    # First authenticate to get a token or session if needed, but based on instructions,
    # using Basic Auth token credentials directly for the endpoint
    auth = HTTPBasicAuth(AUTH_USERNAME, AUTH_PASSWORD)

    # We need to test two scenarios:
    # 1. Authenticated team member access: should get 200 and team dashboard data
    # 2. Authenticated non-member access: should get 403 or appropriate access denied

    # For this, we need at least two team slugs: one that user belongs to, and one that user does not belong to.
    # Since no specific slugs are provided in PRD or test plan, assume:
    member_team_slug = "known-member-team"    # Needs to be a valid slug where user is member
    non_member_team_slug = "known-nonmember-team"  # Slug where user is NOT member

    # If these slugs don't exist, the test will rely on the API responses accordingly.
    # Ideally a setup step would create these or fetch team membership, but not provided.

    # Helper function to perform GET /api/teams/:slug
    def get_team_dashboard(slug):
        url = f"{BASE_URL}/api/teams/{slug}"
        try:
            resp = requests.get(url, auth=auth, timeout=TIMEOUT)
            return resp
        except requests.RequestException as e:
            raise AssertionError(f"Request to {url} failed with error: {e}")

    # Test access for member and validate success response
    resp_member = get_team_dashboard(member_team_slug)
    assert resp_member.status_code == 200, (
        f"Expected 200 OK for team member access to /api/teams/{member_team_slug}, "
        f"got {resp_member.status_code}: {resp_member.text}"
    )
    try:
        data = resp_member.json()
    except Exception as e:
        raise AssertionError(f"Response from /api/teams/{member_team_slug} is not valid JSON: {e}")
    # Validate essential fields in the team dashboard data:
    assert isinstance(data, dict), f"Expected JSON object in response for team member, got {type(data)}"
    # Common expected keys might be team info and analytics; check presence of some keys:
    expected_keys = ["team", "analytics", "members"]
    for key in expected_keys:
        assert key in data, f"Missing expected key '{key}' in response data for team member access"

    # Test access for non-member and expect access denied
    resp_non_member = get_team_dashboard(non_member_team_slug)
    # Allowed error status might be 403 Forbidden or 401 Unauthorized or redirect (302/303) - test assertions accordingly
    assert resp_non_member.status_code in (401, 403), (
        f"Expected 401 Unauthorized or 403 Forbidden for non-member access to /api/teams/{non_member_team_slug}, "
        f"got {resp_non_member.status_code}: {resp_non_member.text}"
    )
    # Optionally check for access denied message in response
    text_lower = resp_non_member.text.lower()
    assert "access denied" in text_lower or "unauthorized" in text_lower or "forbidden" in text_lower, (
        "Non-member access response does not include expected access denial message"
    )

test_validate_teams_dashboard_access_and_data()
