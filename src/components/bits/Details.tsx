import type { Route } from "../../components/bits/+types/Details";
import { sqContext } from "~/root";
import type { CatalogItem } from "../workhorse/queries";
import { Grid } from "@mui/material";

interface DetailProps extends Route.ComponentProps {
  item: CatalogItem;
  inventory: Record<string, number>;
}

export async function clientLoader({ context }: Route.ClientLoaderArgs) {
  const token = context.get(sqContext).token;
  if (token != "") {
    console.log("Authenticated and ready for pull...");
    // Here is where i Prefetch the data needed for the page.
  }
  return context.get(sqContext);
}

export default function Details({ item, inventory, params }: DetailProps) {
  return (
    <Grid container>
      <Grid size={12}>
        <Grid size={{ xs: 6 }}></Grid>
      </Grid>
    </Grid>
  );
}
