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
  const state = context.get(sqContext).state;
  if (token != "") {
    console.log("Authenticated and ready for pull...");
    // Grab catalog information
    const catalogData = await queryClient.fetchQuery({
      queryKey: ["catalog", state],
      queryFn: () => fetchCatalog(state),
    });
    // Grab inventory information
    const variationIds =
      catalogData.objects?.flatMap((item) =>
        item.variations.map((v) => v.id),
      ) ?? [];
    await queryClient.prefetchQuery({
      queryKey: ["inventory", state],
      queryFn: () => fetchInventory(state, variationIds),
    });
  }
  return context.get(sqContext);
}

export default function Shop({ params }: Route.ComponentProps) {
  const loaderData = useLoaderData();
  const { clientId, state } = loaderData;
  // Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["gateway", state, clientId],
    queryFn: () => knockKnock(state, clientId),
    enabled: true,
  });
  const {
    data: catData,
    isLoading: catLoad,
    error: catError,
  } = useQuery({
    queryKey: ["catalog", state],
    queryFn: () => fetchCatalog(state),
  });
  const variationIds =
    catData?.objects?.flatMap((item) => item.variations.map((v) => v.id)) ?? [];
  const {
    data: invData,
    isLoading: invLoad,
    error: invError,
  } = useQuery({
    queryKey: ["inventory", state],
    queryFn: () => fetchInventory(state, variationIds),
  });

  if (error) {
    console.log(
      "Something went wrong here.\nError message: %s\nReturned Data: %s",
      JSON.stringify(error.message),
      JSON.stringify(data),
    );
  }

  return (
    <>
      {isLoading ? <Thinking /> : <Typography></Typography>}
      {!params.item ? (
        <Grid container spacing={2}>
          {isLoading ? (
            <Thinking />
          ) : (
            catData?.objects?.map((item) => (
              <Grid>
                <ProductCard
                  item={item}
                  inventory={invData?.objects ?? {}}
                  outOfStockMode="subtle"
                />
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        <Outlet />
      )}
    </>
  );
}
