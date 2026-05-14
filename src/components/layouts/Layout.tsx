import Box from "@mui/material/Box";
import Footer from "../Footer";
import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "@mui/material";
import ModeSwitch from "../bits/ModeSwitch";

export default function Layout() {
  return (
    <Container id="main-cont">
      <ModeSwitch />
      <Box role="main">
        <Header />
        <Outlet />
      </Box>
      <Footer />
    </Container>
  );
}
