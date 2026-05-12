import Box from "@mui/material/Box";
import Footer from "../Footer";
import { Outlet } from "react-router";
import Header from "../Header";

export default function Layout() {
  return (
    <Box id="main-cont">
      <Box role="main">
        <Header />
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}
