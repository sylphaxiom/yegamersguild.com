import * as React from "react";
import type { Route } from "./+types/Home";
import Header from "../components/Header";
import Box from "@mui/material/Box";
// import ModeSwitch from "~/components/bits/ModeSwitch";
import Location from "~/components/Location";
import Button from "@mui/material/Button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router";
import Footer from "~/components/Footer";
import About from "~/components/About";
import { Divider } from "@mui/material";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export default function Shop() {
  // Query
  const query = useQuery({
    queryKey: ["kicker"],
    queryFn: async () => {
      const response = await axios
        .get(`https://api.sylphaxiom.com/square/kicker.php`)
        .catch((error) => {
          console.log("An error occurred fetching Player: %s", error);
          throw error;
        });
      return response.data;
    },
    enabled: false,
  });

  const { data, error, refetch } = query || {};

  console.log("Data is: %s ", data);

  if (error) {
    console.log(
      "Something went wrong here.\nError message: %s\nReturned Data: %s",
      JSON.stringify(error.message),
      JSON.stringify(data),
    );
  }

  return (
    <Box id="main-cont" role="main">
      <Header />
      <Footer />
    </Box>
  );
}
