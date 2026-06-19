import type { Route } from "./+types/Home";
import Location from "~/components/Location";
import About from "~/components/About";
import { Divider } from "@mui/material";
import {
  fetchContent,
  fetchImages,
  queryClient,
} from "~/components/workhorse/queries";
import Header from "~/components/Header";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Welcome to Ye Gamer\'s Guild Game Shop!" },
  ];
}

export async function clientLoader() {
  // Grab catalog information
  queryClient.prefetchQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  queryClient.prefetchQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  return;
}

export default function Home() {
  return (
    <>
      <Header />
      <Location />
      <Divider variant="fullWidth" sx={{ my: 4 }} />
      <About />
    </>
  );
}
