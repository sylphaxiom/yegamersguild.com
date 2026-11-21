import { useAuth0 } from "@auth0/auth0-react";
import { useIsMutating } from "@tanstack/react-query";
import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import * as React from "react";
import { queryClient } from "../workhorse/queries";

// Storage key prefixes written by @auth0/auth0-spa-js:
//  - "@@auth0spajs@@" : token cache (access/refresh/id tokens) + cached user
//  - "a0.spajs"       : in-flight login transaction state
const AUTH_STORAGE_PREFIXES = ["@@auth0spajs@@", "a0.spajs"];

/** Remove any Auth0 keys left in local/session storage. Leaves unrelated keys
 *  (e.g. the MUI light/dark preference) alone. */
function clearAuthStorage() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(storage)) {
        if (AUTH_STORAGE_PREFIXES.some((p) => key.startsWith(p))) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Storage can be unavailable (private mode, blocked site data); nothing to clear.
    }
  }
}

/**
 * Full logout:
 *  1. Revokes the refresh token at Auth0 (/oauth/revoke) so it can't be used
 *     to mint new access tokens even if it was copied out of the browser.
 *  2. Drops all cached API data held by TanStack Query.
 *  3. Clears Auth0's token cache from local/session storage.
 *  4. Calls Auth0's logout(), which also removes the SDK's
 *     "auth0.<clientId>.is.authenticated" cookie and redirects to Auth0's
 *     /v2/logout to end the Auth0 session itself, so the next visit to
 *     /admin requires signing in again.
 *  5. Auth0 then sends the browser back to the home page.
 */
export default function LogoutButton() {
  const { logout, revokeRefreshToken } = useAuth0();
  const isMutating = useIsMutating();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    // Must run before the local cache is cleared: the SDK reads the refresh
    // token from it. A failure here (e.g. offline) must not block logging out.
    try {
      await revokeRefreshToken();
    } catch (err) {
      console.warn("Refresh token revocation failed; continuing logout.", err);
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    clearAuthStorage();
    await logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      startIcon={<LogoutIcon />}
      onClick={handleLogout}
      // Don't let a logout cut off a save that's still in flight.
      disabled={loggingOut || isMutating > 0}
    >
      {loggingOut ? "Logging out…" : "Log out"}
    </Button>
  );
}
