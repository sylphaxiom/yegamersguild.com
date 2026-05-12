import * as React from "react";
import type { Route } from "./+types/Shop";
import { useQuery } from "@tanstack/react-query";
import { Outlet, useLoaderData } from "react-router";
import { knockKnock, type CatalogItem } from "~/components/workhorse/queries";
import Thinking from "~/components/baubles/Thinking";
import { authMiddleware } from "~/components/workhorse/middleware";
import { sqContext } from "~/root";
import Typography from "@mui/material/Typography";
import ProductCard from "~/components/bits/ProductCard";

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
  const state = context.get(sqContext).state;
  const clientId = context.get(sqContext).clientId;
  if (token != "") {
    console.log("Authenticated and ready for pull...");
    // Here is where i Prefetch the data needed for the page.
  }
  console.log(
    "Current context:\nState: %s\nClient ID: %s\nToken: %s",
    state,
    clientId,
    token,
  );
  return context.get(sqContext);
}

export default function Shop({ params }: Route.ComponentProps) {
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

  const item: CatalogItem = {
    name: "Item",
    images: ["/mini_paint.jpg"],
    description:
      "This is a description for an Item. And now Im\'m going to add a much bigger description in the hopes that I can see the ellipsis thing that this AI came up with, because I didn\'t know it was a thing that could be done.",
    categories: ["ITEM"],
    variations: [
      {
        id: "SDJGIN14DSLIJGNLKD",
        name: "Item Variant",
        sku: "100325",
        price: { amount: 1999, currency: "USD" },
      },
    ],
  };
  const inventory: Record<string, number> = {
    SDJGIN14DSLIJGNLKD: 0,
  };

  return (
    <>
      {isLoading ? <Thinking /> : <Typography>Token is {token}</Typography>}
      {!params.item ? (
        <ProductCard
          item={item}
          inventory={inventory}
          outOfStockMode="subtle"
        />
      ) : (
        <Outlet />
      )}
    </>
  );
}
