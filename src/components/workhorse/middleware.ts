import { getSession, commitSession } from "./sessions";
import { checker, knockKnock, queryClient } from "./queries";
import type { Route } from "../../routes/+types/Shop";
import { sqContext } from "~/root";


export const authMiddleware: Route.ClientMiddlewareFunction = async ({
    context,
}) => {
    const clientId = context.get(sqContext).clientId
    let state = context.get(sqContext).state
    let token = context.get(sqContext).token
    console.log("Grabbed context variables, checking values...")
    if (state === '') {
        console.log("No state found in context")
        const bytes = new Uint8Array(32);
        window.crypto.getRandomValues(bytes);
        state = Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    console.log("Sessions should now have clientId and state populated.")
    if (token === '') {
        console.log("Context shows no token, running gate to obtain.")
        const gate = await queryClient.fetchQuery({
              queryKey: ["gateway", state, clientId],
              queryFn: () => knockKnock(state, clientId),
            })
        console.log("After the gate has ran: Status: %s", gate.status)
        if (gate.error) {
            console.log("An error occurred going through the Gate: %s", gate.error)
        }
        if (gate.status === "Authorized") {
            console.log("Gate is authorized.")
            if (gate.token) {
                token = gate.token;
            }
        } else {
            console.log("Status of Gate was: %s", gate.error)
        }
    } else {
        // the value is not empty so accept it.
        console.log("Token is present in the context...")
        const isValid = await queryClient.fetchQuery({queryKey: ["checker", token],  queryFn: ()=>checker()})
        console.log("Validity of token is: %s", isValid)
        if (isValid) {
            console.log("Token is validated")
        } else {
            console.log("Token is INVALID.")
        }
    }
    context.set(sqContext, {clientId:clientId, state:state, token:token})
    console.log("Completed middleware, updated context...")
}