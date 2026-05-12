import type { Route } from "../../components/bits/+types/DataGrid";
import { useQuery } from "@tanstack/react-query";
import { useLoaderData } from "react-router";
import {
  fetchCatalog,
  fetchInventory,
  queryClient,
} from "~/components/workhorse/queries";
import Thinking from "~/components/baubles/Thinking";
import { sqContext } from "~/root";
import ProductCard from "~/components/bits/ProductCard";
import Grid from "@mui/material/Grid";
import { Skeleton } from "@mui/material";

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  const state = context.get(sqContext).state;
  if (token != "") {
    // Grab catalog information
    const catalogData = await queryClient.fetchQuery({
      queryKey: ["catalog", state],
      queryFn: () => fetchCatalog(state, token),
    });
    // Grab inventory information
    const variationIds =
      catalogData.objects?.flatMap((item) =>
        item.variations.map((v) => v.id),
      ) ?? [];
    await queryClient.prefetchQuery({
      queryKey: ["inventory", state],
      queryFn: () => fetchInventory(state, token, variationIds),
    });
  }
  return context.get(sqContext);
}

export default function DataGrid({ params }: Route.ComponentProps) {
  const loaderData = useLoaderData();
  const { state, token } = loaderData;
  // Query
  const {
    data: catData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["catalog", state],
    queryFn: () => fetchCatalog(state, token),
  });
  const variationIds =
    catData?.objects?.flatMap((item) => item.variations.map((v) => v.id)) ?? [];
  const { data: invData } = useQuery({
    queryKey: ["inventory", state],
    queryFn: () => fetchInventory(state, token, variationIds),
  });

  if (error) {
    console.log(
      "Something went wrong here.\nError message: %s\nReturned Catalog Data: %s\nReturned Inventory Data: %s",
      JSON.stringify(error.message),
      JSON.stringify(catData),
      JSON.stringify(invData),
    );
  }

  return (
    <Grid container spacing={2}>
      {catData?.objects?.map((item) =>
        isLoading ? (
          <Grid
            sx={{
              m: 2,
            }}
          >
            <Skeleton
              variant="rounded"
              sx={{
                width: { xs: 200, sm: 300 },
                height: { xs: 200, sm: 300 },
              }}
            />
            <Skeleton variant="text" height={"1.5em"} />
            <Skeleton variant="rounded" height="3em" />
          </Grid>
        ) : (
          <Grid>
            <ProductCard
              item={item}
              inventory={invData?.objects ?? {}}
              outOfStockMode="subtle"
            />
          </Grid>
        ),
      )}
    </Grid>
  );
}
