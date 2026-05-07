import * as React from "react";
import type { Route } from "./+types/Home";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import Location from "~/components/Location";
import Footer from "~/components/Footer";
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
    <Box id="main-cont">
      <Box role="main">
        <Header />
        <Location />
        <Divider variant="fullWidth" sx={{ my: 4 }} />
        <About />
      </Box>
      <Footer />
    </Box>
  );
}
