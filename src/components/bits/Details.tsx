import type { Route } from "../../components/bits/+types/Details";
import { sqContext } from "~/root";
import {
  fetchCatalog,
  fetchInventory,
  queryClient,
  type CatalogVariation,
  type Price,
} from "../workhorse/queries";
import { Box, Button, Grid, Skeleton, Stack, Typography } from "@mui/material";
import { useLoaderData, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export async function clientLoader({
  context,
  params,
}: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  const state = context.get(sqContext).state;
  if (token != "") {
    // params are here which means single search for that item.
    queryClient.prefetchQuery({
      queryKey: ["catalog", state, params.item],
      queryFn: () => fetchCatalog(state, token, params.item),
    });
  }
  return context.get(sqContext);
}

export default function Details({ params }: Route.ComponentProps) {
  const navigate = useNavigate();
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
  const { data: inventory, isLoading } = useQuery({
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
  // Check if this item is in stock or not.
  const isInStock = item?.variations.some(
    (v) => (inventory?.objects[v.id] ?? 0) > 0,
  );

  if (isLoading)
    return (
      <Grid container>
        <Grid size={{ xs: 6 }}>
          <Skeleton variant="rounded" sx={{ width: 300, height: 300 }} />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Skeleton variant="text" sx={{ fontSize: "2rem" }} width="60%" />
          <Skeleton variant="text" sx={{ fontSize: "10rem" }} width="60%" />
          <Skeleton variant="text" />
          <Skeleton variant="rectangular" sx={{ width: 236, height: 36 }} />
        </Grid>
      </Grid>
    );

  return (
    <Grid container>
      <Grid size={{ xs: 6 }}>
        <Box
          component="img"
          src={displayImage}
          alt={`Stock image of a(n) ${item?.name}`}
          sx={{
            width: { xs: "100%" },
            height: { xs: "100%" },
          }}
        />
      </Grid>
      <Grid size={{ xs: 5 }} sx={{ mx: 4 }}>
        <Typography variant="h2">{item?.name}</Typography>
        <Typography variant="body1" sx={{ height: "12rem" }}>
          {item?.description}
        </Typography>
        <Stack
          direction={"row"}
          sx={{ justifyContent: "space-between", maxWidth: "80%" }}
        >
          {item && (
            <Typography variant="body2">
              Quantity:{" "}
              {isInStock ? (
                inventory?.objects[0]
              ) : (
                <Typography
                  variant="caption"
                  color="error"
                  key={item.id + "-subtle-overlay"}
                >
                  Out of Stock
                </Typography>
              )}
            </Typography>
          )}
          <Typography variant="body2">{displayPrice}</Typography>
        </Stack>
        <Box sx={{ textAlign: "left", pl: "10%", py: 4 }}>
          <Button
            variant="contained"
            type="submit"
            onClick={() => navigate(-1)}
            startIcon={<ArrowBackIcon />}
          >
            Back to inventory list
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
