import type { Route } from "../../components/bits/+types/Details";
import { sqContext } from "~/root";
import {
  fetchCatalog,
  fetchInventory,
  queryClient,
  type CatalogVariation,
  type Price,
} from "../workhorse/queries";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";

export async function clientLoader({
  context,
  params,
}: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  const state = context.get(sqContext).state;
  if (token != "") {
    // params are here which means single search for that item.
    const catalogData = await queryClient.fetchQuery({
      queryKey: ["catalog", state, params.item],
      queryFn: () => fetchCatalog(state, token, params.item),
    });

    // Grab inventory information
    const variationIds =
      catalogData?.objects?.flatMap((item) =>
        item.variations.map((v) => v.id),
      ) ?? [];
    await queryClient.prefetchQuery({
      queryKey: ["inventory", state, params.item],
      queryFn: () => fetchInventory(state, token, variationIds),
    });
  }
  return context.get(sqContext);
}

export default function Details({ params }: Route.ComponentProps) {
  // Price stuff
  const { state, token } = useLoaderData();
  const { data } = useQuery({
    queryKey: ["catalog", state, params.item],
    queryFn: () => fetchCatalog(state, token, params.item),
  });
  // Grab inventory information
  const variationIds =
    data?.objects?.flatMap((item) => item.variations.map((v) => v.id)) ?? [];
  console.log("variationIds: %o", variationIds);
  const { data: inventory } = useQuery({
    queryKey: ["inventory", state, params.item],
    queryFn: () => fetchInventory(state, token, variationIds),
  });
  console.log("Inventory data: %o", inventory);

  const item = data?.objects?.[0];
  const fixedPrices = (item?.variations ?? [])
    .filter(
      (v): v is CatalogVariation & { price: Price } =>
        v.price !== "VARIABLE_PRICE",
    )
    .map((v) => v.price.amount);
  const displayPrice =
    fixedPrices.length === 0
      ? "Price Varies"
      : (() => {
          const minCents = Math.min(...fixedPrices);
          const dollarStr = `$${(minCents / 100).toFixed(2)}`;
          return fixedPrices.length > 1 ? `from ${dollarStr}` : dollarStr;
        })();
  const displayImage = item?.images[0] ?? "/placeholder.png";

  return (
    <Grid container>
      <Grid size={{ xs: 6 }}>
        <Box
          component="img"
          src={displayImage}
          alt={`Stock image of a(n) ${item?.name}`}
          sx={{
            width: { xs: "80vw", sm: "40vw" },
            height: { xs: "80vw", sm: "40vw" },
          }}
        />
      </Grid>
      <Grid size={{ xs: 5 }} sx={{ mx: 4 }}>
        <Typography variant="h2">{item?.name}</Typography>
        <Typography variant="body1">{item?.description}</Typography>
        <Stack direction={"row"} sx={{ justifyContent: "space-between" }}>
          {item && (
            <Typography variant="body2">
              Quantity: {inventory?.objects[item.id] ?? 0}
            </Typography>
          )}
          <Typography variant="body2">{displayPrice}</Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}
