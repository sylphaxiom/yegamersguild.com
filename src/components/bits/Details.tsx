import type { Route } from "../../components/bits/+types/Details";
import type { Route as aRoute } from "../../routes/+types/Shop";
import Location from "~/components/Location";
import About from "~/components/About";
import { Divider } from "@mui/material";
import { authMiddleware } from "~/components/workhorse/middleware";
import { sqContext } from "~/root";

export const clientMiddleware: aRoute.ClientMiddlewareFunction[] = [
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
    // Here is where i Prefetch the data needed for the page.
  }
  return context.get(sqContext);
}

export default function Details() {
  return (
    <>
      <Location />
      <Divider variant="fullWidth" sx={{ my: 4 }} />
      <About />
    </>
  );
}
