// import * as React from "react";
import type { Route } from "./+types/Shop";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import Footer from "~/components/Footer";
import { data, useLoaderData } from "react-router";
import { knockKnock } from "~/components/workhorse/queries";
import { getSession, commitSession } from "~/components/workhorse/sessions";
import Thinking from "~/components/baubles/Thinking";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  console.log("Current Session data is valid: %s", session.get("isValid"));
  const clientId = session.get("clientId");
  const state = session.get("state");
  const isValid = session.get("isValid");
  return data(
    { clientId: clientId, state: state, isValid: isValid },
    { headers: { "Set-Cookie": await commitSession(session) } },
  );
}

export default function Shop() {
  const loaderData = useLoaderData();
  const clientId = loaderData.clientId;
  const state = loaderData.state;
  // Query
  const gateKey = useQuery({
    queryKey: ["gateway", state, clientId],
    queryFn: () => knockKnock(state, clientId),
    enabled: true,
  });

  const { isLoading, error, data } = gateKey;

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
