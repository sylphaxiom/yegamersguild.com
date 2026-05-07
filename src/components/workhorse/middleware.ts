import type { MiddlewareFunction } from "react-router";
import { getSession, commitSession } from "./sessions";
import { checker, knockKnock, queryClient } from "./queries";


export const authMiddleware: MiddlewareFunction = async ({
    request,
    context,
}) => {
    const session = await getSession(request.headers.get("Cookie"));
    if (!session.has("clientId")) {
        session.set("clientId", "sandbox-sq0idb-Zo_kJ9WN2IDavTl6AbFO2g");
    }
    if (!session.has("state")) {
        const bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        const state = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        session.set("state", state);
    }
    const clientId = session.get("clientId")!;
    const state = session.get("state")!;
    if (!session.has('token')) {
        const gate = await queryClient.ensureQueryData({
              queryKey: ["gateway", state,clientId],
              queryFn: () => knockKnock(state,clientId),
            })
        if (gate.error) {
            console.log("An error occurred going through the Gate: %s", gate.error)
        }
        if (gate.status === "Authorized") {
            if (session.has('token')) {
                console.log("Token present in cookie: %s", session.get('token'))
            } else {
                console.log("Token was not found in the cookie...")
            }
            session.set('isValid', true)
        } else {
            session.set('isValid', false)
        }
    } else {
        // You can assume there is a token in the context since it should ONLY be token or ''
        // Same assumption can be made for the token in the session
        const token = session.get('token');
        const isValid = await queryClient.fetchQuery({queryKey: ["checker", token],  queryFn: ()=>checker()})
        if (isValid) {
            console.log("Token is validated")
        } else {
            console.log("Token is INVALID.")
        }
    }
    return await commitSession(session);
}