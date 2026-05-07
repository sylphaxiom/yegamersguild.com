import * as React from "react";
import type { Route } from "./+types/Shop";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import Footer from "~/components/Footer";
import { data, useLoaderData } from "react-router";
import { knockKnock } from "~/components/workhorse/queries";
// import { getSession, commitSession } from "~/components/workhorse/sessions";
import Thinking from "~/components/baubles/Thinking";
import { authMiddleware } from "~/components/workhorse/middleware";
import { commitSession, getSession } from "~/components/workhorse/sessions";
import { sqContext } from "~/root";
import Typography from "@mui/material/Typography";

export const clientMiddleware: Route.ClientMiddlewareFunction[] = [
  authMiddleware,
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  if (token != "") {
    console.log("Authenticated and ready for pull...");
  }
  return context.get(sqContext);
}

export default function Shop() {
  const loaderData = useLoaderData();
  const { clientId, state, token } = loaderData;
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

  React.useEffect(() => {}, [data]);

  return (
    <Box id="main-cont" role="main">
      <Header />
      {isLoading ? <Thinking /> : <Typography>Token is {token}</Typography>}
      <Footer />
    </Box>
  );
}
