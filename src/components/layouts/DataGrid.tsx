import * as React from "react";
import type { Route } from "../../components/layouts/+types/DataGrid";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import {
  fetchCatalog,
  fetchInventory,
  queryClient,
} from "~/components/workhorse/queries";
import { sqContext } from "~/root";
import ProductCard from "~/components/bits/ProductCard";
import Grid from "@mui/material/Grid";
import { Box, Chip, Skeleton, useColorScheme, useTheme } from "@mui/material";

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  const state = context.get(sqContext).state;
  if (token != "") {
    // Grab catalog information
    queryClient.prefetchQuery({
      queryKey: ["catalog", state],
      queryFn: () => fetchCatalog(state, token),
    });
  }
  return context.get(sqContext);
}

export default function DataGrid() {
  const { mode } = useColorScheme();
  const isDark = mode === "dark";
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    [],
  );
  const loaderData = useLoaderData();
  const { state, token } = loaderData;
  const [showAvailable, setShowAvailable] = React.useState(false);
  // Query
  const {
    data: catData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["catalog", state],
    queryFn: () => fetchCatalog(state, token),
  });
  // filter logic
  let filteredItems =
    selectedCategories.length === 0
      ? (catData?.objects ?? [])
      : (catData?.objects ?? []).filter((item) =>
          item.categories.some((c) => selectedCategories.includes(c)),
        );

  // variant mapping for inventory
  const variationIds =
    catData?.objects?.flatMap((item) => item.variations.map((v) => v.id)) ?? [];
  const { data: invData } = useQuery({
    queryKey: ["inventory", state],
    queryFn: () => fetchInventory(state, token, variationIds),
  });
  filteredItems = filteredItems.filter(
    (item) =>
      !showAvailable ||
      item.variations.some((v) => (invData?.objects?.[v.id] ?? 0) > 0),
  );
  const allCategories = Array.from(
    new Set(catData?.objects?.flatMap((item) => item.categories) ?? []),
  );

  if (error) {
    console.log(
      "Something went wrong here.\nError message: %s\nReturned Catalog Data: %s\nReturned Inventory Data: %s",
      JSON.stringify(error.message),
      JSON.stringify(catData),
      JSON.stringify(invData),
    );
  }

  return (
    <Grid container>
      <Grid size={12} sx={{ justifyItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
            width: 1,
            px: 2,
            justifyContent: "space-around",
          }}
        >
          {allCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              variant={selectedCategories.includes(cat) ? "filled" : "outlined"}
              color={isDark ? "info" : "primary"}
              onClick={() =>
                setSelectedCategories((prev) =>
                  prev.includes(cat)
                    ? prev.filter((c) => c !== cat)
                    : [...prev, cat],
                )
              }
            />
          ))}
          <Chip
            label="Available Only"
            variant={showAvailable ? "filled" : "outlined"}
            color={isDark ? "info" : "primary"}
            onClick={() => setShowAvailable((prev) => !prev)}
          />
        </Box>
      </Grid>
      <Grid container size={12} sx={{ justifyContent: "center" }}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Grid sx={{ m: 2 }} key={`skel-${i}`}>
                <Skeleton
                  variant="rounded"
                  sx={{
                    width: { xs: 200, sm: 300 },
                    height: { xs: 200, sm: 300 },
                  }}
                />
                <Skeleton variant="text" height="1.5em" />
                <Skeleton variant="rounded" height="3em" />
              </Grid>
            ))
          : filteredItems.map((item) => (
              <Grid key={item.id + "-grid"}>
                <ProductCard
                  item={item}
                  inventory={invData?.objects ?? {}}
                  outOfStockMode="subtle"
                />
              </Grid>
            ))}
      </Grid>
    </Grid>
  );
}
