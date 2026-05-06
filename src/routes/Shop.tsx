import * as React from "react";
import type { Route } from "./+types/Shop";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Footer from "~/components/Footer";
import { data } from "react-router";
import { snickerdoodle } from "~/components/About";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Browse the store inventory." },
  ];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await snickerdoodle.parse(cookieHeader);
  return data({ verifier: cookie.verifier });
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = await snickerdoodle.parse(cookieHeader);
  const formData = await request.formData();
  const origin = request.url;
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  const verifier = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return data(verifier, {
    headers: { "Set-Cookie": await snickerdoodle.serialize(cookie) },
  });
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
