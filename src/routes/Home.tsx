import type { Route } from "./+types/Home";
import Location from "~/components/Location";
import About from "~/components/About";
import { Divider } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Welcome to Ye Gamer\'s Guild Game Shop!" },
  ];
}

export default function Home() {
  return (
    <>
      <Location />
      <Divider variant="fullWidth" sx={{ my: 4 }} />
      <About />
    </>
  );
}
