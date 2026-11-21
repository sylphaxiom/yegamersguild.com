import { useAuth0 } from "@auth0/auth0-react";
import * as React from "react";

/**
 * Like Auth0's getAccessTokenSilently(), but always resolves to a token string.
 * The SDK can resolve to `undefined` (e.g. no session); in that case we throw so
 * the mutation fails cleanly instead of calling the API with "Bearer undefined".
 */
export default function useAccessToken(): () => Promise<string> {
  const { getAccessTokenSilently } = useAuth0();
  return React.useCallback(async () => {
    const token = await getAccessTokenSilently();
    if (!token) {
      throw new Error("Not signed in: no access token available.");
    }
    return token;
  }, [getAccessTokenSilently]);
}
