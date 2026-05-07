// import * as React from "react";
import type { Route } from "./+types/Shop";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import Footer from "~/components/Footer";
import { data } from "react-router";
import { knockKnock } from "~/components/workhorse/queries";
import {
  getSession,
  commitSession,
  destroySession,
} from "~/components/workhorse/sessions";
import Thinking from "~/components/baubles/Thinking";

// Query
const gateKey = (clientId: string, state: string) =>
  useQuery({
    queryKey: ["gateway", clientId, state],
    queryFn: () => knockKnock((clientId = clientId), (state = state)),
    enabled: true,
  });

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
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
  const gate = gateKey(clientId, state);
  if (gate.data?.token && gate.data?.status === "Authorized") {
    session.set("token", gate.data.token);
  }
  return data(gate, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
}

export default function Shop({ matches }: Route.ComponentProps) {
  console.log("Data is: %s ", matches[1].loaderData);

  const { isLoading, error, data } = matches[1].loaderData;

  if (error) {
    console.log(
      "Something went wrong here.\nError message: %s\nReturned Data: %s",
      JSON.stringify(error.message),
      JSON.stringify(data),
    );
  }

  return (
    <Box id="main-cont" role="main">
      <Header />
      {isLoading ? <Thinking /> : data?.message}
      <Footer />
    </Box>
  );
}
