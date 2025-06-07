import requests
from typing import List, Dict, Any, Optional

# Define a custom exception for API errors
class MarzbanAPIError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code

def get_marzban_access_token(panel_url: str, username: str, password: str) -> str:
    """
    Logs into a Marzban panel and retrieves an access token.
    """
    login_url = f"{panel_url.rstrip('/')}/api/admin/token"
    try:
        response = requests.post(login_url, data={"username": username, "password": password}, timeout=10)
        response.raise_for_status() # Raises HTTPError for bad responses (4XX or 5XX)

        data = response.json()
        if "access_token" not in data:
            raise MarzbanAPIError("Login successful but no access_token in response.")
        return data["access_token"]

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        try:
            error_detail = e.response.json().get("detail", str(e))
        except requests.exceptions.JSONDecodeError:
            error_detail = e.response.text or str(e)
        raise MarzbanAPIError(f"Failed to log in to Marzban panel at {panel_url}. Status: {status_code}. Detail: {error_detail}", status_code=status_code) from e
    except requests.exceptions.RequestException as e:
        # For other network errors (timeout, connection error, etc.)
        raise MarzbanAPIError(f"Network error connecting to Marzban panel at {panel_url}: {str(e)}") from e
    except Exception as e: # Catch any other unexpected errors
        raise MarzbanAPIError(f"An unexpected error occurred while trying to get access token: {str(e)}")


def get_marzban_users(panel_url: str, token: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Retrieves a list of users from the Marzban panel.
    `params` can be used for pagination, e.g., {"offset": 0, "limit": 100}
    """
    users_url = f"{panel_url.rstrip('/')}/api/users"
    headers = {
        "Authorization": f"Bearer {token}"
    }

    try:
        response = requests.get(users_url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        if "users" not in data or not isinstance(data["users"], list):
            raise MarzbanAPIError("User list request successful but 'users' field is missing or not a list.")
        return data["users"]

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        try:
            error_detail = e.response.json().get("detail", str(e))
        except requests.exceptions.JSONDecodeError:
            error_detail = e.response.text or str(e)
        raise MarzbanAPIError(f"Failed to get users from Marzban panel at {panel_url}. Status: {status_code}. Detail: {error_detail}", status_code=status_code) from e
    except requests.exceptions.RequestException as e:
        raise MarzbanAPIError(f"Network error getting users from Marzban panel at {panel_url}: {str(e)}") from e
    except Exception as e: # Catch any other unexpected errors
        raise MarzbanAPIError(f"An unexpected error occurred while trying to get users: {str(e)}")


def update_marzban_user(panel_url: str, token: str, username_to_update: str, user_data_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Updates a specific user on the Marzban panel.
    user_data_payload should be a dictionary conforming to Marzban's user update schema.
    It should not contain 'username' if username is not updatable, or handle it accordingly.
    """
    # Marzban API endpoint for updating a user is typically /api/user/{username}
    update_url = f"{panel_url.rstrip('/')}/api/user/{username_to_update}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "accept": "application/json" # Usually good to specify accept header
    }

    # Filter out None values from payload, as some APIs prefer fields to be absent if not updated
    payload = {k: v for k, v in user_data_payload.items() if v is not None}

    try:
        response = requests.put(update_url, headers=headers, json=payload, timeout=10)
        response.raise_for_status() # Raises HTTPError for bad responses (4XX or 5XX)

        # Successful update might return the updated user object or just a success status
        # For now, assume it returns the updated user data
        return response.json()

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        try:
            error_detail = e.response.json().get("detail", str(e))
        except requests.exceptions.JSONDecodeError:
            error_detail = e.response.text or str(e)
        raise MarzbanAPIError(f"Failed to update user {username_to_update} on Marzban panel at {panel_url}. Status: {status_code}. Detail: {error_detail}", status_code=status_code) from e
    except requests.exceptions.RequestException as e:
        raise MarzbanAPIError(f"Network error updating user {username_to_update} on Marzban panel at {panel_url}: {str(e)}") from e
    except Exception as e: # Catch any other unexpected errors
        raise MarzbanAPIError(f"An unexpected error occurred while trying to update user {username_to_update}: {str(e)}")


def get_marzban_user_usage(panel_url: str, token: str, username: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves usage data for a specific user from the Marzban panel.
    Returns the usage data as a dictionary or None if user not found or other issues.
    Marzban's usage endpoint might be part of the main user details or a separate one.
    Assuming it returns a dict like {"used_traffic": bytes, "data_limit": bytes, ...}
    If it's part of the main user object, this function might not be strictly needed if get_marzban_users already fetches it.
    However, some Marzban versions might have a specific /api/user/{username}/usage or similar.
    For now, let's assume an endpoint that directly gives usage or is part of user details.
    This function could also be combined with a get_marzban_user_details(username) function.
    """
    # Adjust URL if Marzban has a specific usage endpoint, e.g., /api/user/{username}/usage
    # If usage is part of the main user endpoint /api/user/{username}:
    user_detail_url = f"{panel_url.rstrip('/')}/api/user/{username}"
    headers = {
        "Authorization": f"Bearer {token}",
        "accept": "application/json"
    }

    try:
        response = requests.get(user_detail_url, headers=headers, timeout=10)
        if response.status_code == 404:
            # User not found, not necessarily an API error to raise, could return None
            return None
        response.raise_for_status() # For other errors (500, 401, 403 etc.)

        user_data = response.json()
        # Extract relevant usage fields if the structure is known, e.g.:
        # return {
        #     "used_traffic": user_data.get("used_traffic", 0),
        #     "data_limit": user_data.get("data_limit", 0),
        #     "expire": user_data.get("expire")
        # }
        # For now, returning the whole user data dict, service layer can parse.
        return user_data

    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code
        # For 404, we returned None above. This handles other HTTP errors.
        try:
            error_detail = e.response.json().get("detail", str(e))
        except requests.exceptions.JSONDecodeError:
            error_detail = e.response.text or str(e)
        raise MarzbanAPIError(f"Failed to get usage for user {username} from Marzban panel at {panel_url}. Status: {status_code}. Detail: {error_detail}", status_code=status_code) from e
    except requests.exceptions.RequestException as e:
        raise MarzbanAPIError(f"Network error getting usage for user {username} on Marzban panel at {panel_url}: {str(e)}") from e
    except Exception as e: # Catch any other unexpected errors
        raise MarzbanAPIError(f"An unexpected error occurred while trying to get usage for user {username}: {str(e)}")


# Example usage (not part of the module's direct execution, just for illustration)
if __name__ == '__main__':
    # This part will not run when imported, only if script is executed directly.
    # Replace with actual panel details and credentials for testing.
    # PANEL_URL = "http://your-marzban-panel-url.com"
    # ADMIN_USERNAME = "admin"
    # ADMIN_PASSWORD = "password"
    # try:
    #     print(f"Attempting to log in to {PANEL_URL}...")
    #     access_token = get_marzban_access_token(PANEL_URL, ADMIN_USERNAME, ADMIN_PASSWORD)
    #     print(f"Successfully obtained access token: {access_token[:20]}...") # Print first 20 chars

    #     print("Attempting to get users...")
    #     users = get_marzban_users(PANEL_URL, access_token, params={"limit": 5})
    #     print(f"Successfully retrieved {len(users)} users:")
    #     for user in users:
    #         print(f"  User: {user.get('username')}, Status: {user.get('status')}")

    # except MarzbanAPIError as e:
    #     print(f"API Error: {e}")
    # except Exception as e:
    #     print(f"General Error: {e}")
    pass # Keep __main__ block clean for module use
