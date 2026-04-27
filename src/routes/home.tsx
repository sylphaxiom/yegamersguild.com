import type { Route } from "./+types/home";
import Header from "../components/Header";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import ModeSwitch from "~/components/bits/ModeSwitch";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Ye Gamer\'s Guild" },
    { name: "description", content: "Welcome to Ye Gamer\'s Guild Game Shop!" },
  ];
}

export default function Home() {
  return (
    <Box id="main-cont" role="tree">
      <ModeSwitch />
      <Container id="head-cont" role="heading">
        <Header />
      </Container>
      <Container id="body-cont" role="main">
        *** The body will go here ***
      </Container>
    </Box>
  );
}
