import { getSession, commitSession } from "./sessions";
import { checker, knockKnock, queryClient } from "./queries";
import type { Route } from "../../routes/+types/Shop";


export const authMiddleware: Route.ClientMiddlewareFunction = async ({
    request,
}) => {
    const session = await getSession(request.headers.get("Cookie"));
    console.log("Grabbed session, checking values...")
    if (!session.has("clientId")) {
        console.log("No ClientId found in session")
        session.set("clientId", "sandbox-sq0idb-Zo_kJ9WN2IDavTl6AbFO2g");
    }
    if (!session.has("state")) {
        console.log("No state found in session")
        const bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        const state = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        session.set("state", state);
    }
    console.log("Sessions should now have clientId and state populated.")
    const clientId = session.get("clientId")!;
    const state = session.get("state")!;
    if (!session.has('token')) {
        console.log("No token found in session, running gate to obtain.")
        const gate = await queryClient.ensureQueryData({
              queryKey: ["gateway", state,clientId],
              queryFn: () => knockKnock(state,clientId),
            })
        console.log("After the gate has ran: %o", gate)
        if (gate.error) {
            console.log("An error occurred going through the Gate: %s", gate.error)
        }
        if (gate.status === "Authorized") {
            console.log("Gate is authorized.")
            if (session.has('token')) {
                console.log("Token present in cookie: %s", session.get('token'))
            } else {
                console.log("Token was not found in the cookie...")
            }
            session.set('isValid', true)
        } else {
            session.set('isValid', false)
            console.log("status of Gate was: %s", gate.status)
        }
    } else {
        // You can assume there is a token in the context since it should ONLY be token or ''
        // Same assumption can be made for the token in the session
        console.log("Token is present in the session data...")
        const token = session.get('token');
        const isValid = await queryClient.fetchQuery({queryKey: ["checker", token],  queryFn: ()=>checker()})
        console.log("Validity of token is: %s", isValid)
        if (isValid) {
            console.log("Token is validated")
        } else {
            console.log("Token is INVALID.")
        }
    }
}