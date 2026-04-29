import type { Route } from "./+types/home";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import ModeSwitch from "~/components/bits/ModeSwitch";
import Location from "~/components/Location";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Welcome to Ye Gamer\'s Guild Game Shop!" },
  ];
}

export default function Home() {
  return (
    <Box id="main-cont" role="none">
      {/* <ModeSwitch /> */}
      <Header />
      <Location />
    </Box>
  );
}
