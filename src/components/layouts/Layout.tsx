import Box from "@mui/material/Box";
import Footer from "../Footer";
import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "@mui/material";

export default function Layout() {
  return (
    <Container id="main-cont">
      <Box role="main">
        <Header />
        <Outlet />
      </Box>
      <Footer />
    </Container>
  );
}
