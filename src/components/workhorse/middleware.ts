import { checker, knockKnock, queryClient } from "./queries";
import type { Route } from "../../components/layouts/+types/Layout";
import { sqContext } from "~/root";
import { redirect } from "react-router";

export const authMiddleware: Route.ClientMiddlewareFunction = async ({
    context,
}) => {
    const clientId = context.get(sqContext).clientId
    let state = context.get(sqContext).state || sessionStorage.getItem('sq_state') || ''
    let token = context.get(sqContext).token || sessionStorage.getItem('sq_token') || ''
    const expires = Number(sessionStorage.getItem('sq_expires') || '0')
    const sessionStillValid = Date.now() < expires

    console.log("Grabbed context variables, checking values...")
    if (state === '') {
        console.log("No state found in context")
        const bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        state = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    console.log("Sessions should now have clientId and state populated...")
    if (token === '') {
        console.log("Context shows no token, running gate to obtain.")
        const gate = await queryClient.fetchQuery({
              queryKey: ["gateway", state, clientId],
              queryFn: () => knockKnock(state, clientId),
            })
        if (gate.error) {
            console.log("An error occurred going through the Gate: %s", gate.error)
        }
        if (gate.status === "Authorized") {
            console.log("Gate is authorized.")
            sessionStorage.setItem('sq_expires', String(Date.now() + 7200000)) // 2 hours
            if (gate.token) {
                token = gate.token;
            }
        }
        if (gate.status === "Redirect") {
            console.log("Gate says we need to redirect...")
            if (gate.url) {
                console.log("URL is present, attempting to redirect...")
                throw redirect(gate.url)
            }
        } else {
            console.log("Status of Gate was: %s", gate.error)
        }
    } else {
        if (!sessionStillValid) {
            console.log("Token is present in the context...")
            const validity = await queryClient.fetchQuery({queryKey: ["checker", token],  queryFn: ()=>checker(state)})
            console.log("Validity of token is: %s", validity.isValid)
            if (validity) {
                console.log("Token is validated")
            } else {
                console.log("Token is INVALID.")
            }
        }
        // the value is not empty and session is still valid so accept it.
        
    }
    sessionStorage.setItem('sq_state', state)
    sessionStorage.setItem('sq_token', token)
    context.set(sqContext, { clientId, state, token })
    console.log("Completed middleware, updated context...")
}