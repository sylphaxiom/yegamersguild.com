import * as React from "react";
import type { Route } from "./+types/Shop";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useLoaderData } from "react-router";
import {
  fetchCatalog,
  fetchInventory,
  knockKnock,
  queryClient,
  type CatalogItem,
} from "~/components/workhorse/queries";
import Thinking from "~/components/baubles/Thinking";
import { authMiddleware } from "~/components/workhorse/middleware";
import { sqContext } from "~/root";
import Typography from "@mui/material/Typography";
import ProductCard from "~/components/bits/ProductCard";
import Grid from "@mui/material/Grid";

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
  }
  return context.get(sqContext);
}

export default function Shop() {
  // const loaderData = useLoaderData();
  // const { clientId, state } = loaderData;
  // // Query
  // const { data, error } = useQuery({
  //   queryKey: ["gateway", state, clientId],
  //   queryFn: () => knockKnock(state, clientId),
  //   enabled: true,
  // });

  // if (error) {
  //   console.log(
  //     "Something went wrong here.\nError message: %s\nReturned Data: %s",
  //     JSON.stringify(error.message),
  //     JSON.stringify(data),
  //   );
  // }

  return <Outlet />;
}
