import Box from "@mui/material/Box";
import Footer from "../Footer";
import { Outlet } from "react-router";
import Header from "../Header";
import { Container } from "@mui/material";
import ModeSwitch from "../bits/ModeSwitch";
import { useQuery } from "@tanstack/react-query";
import { fetchContent, fetchImages } from "../workhorse/queries";
import Thinking from "../baubles/Thinking";

export default function Layout() {
  const { isPending: contentPending } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const { isPending: imagesPending } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });

  if (contentPending || imagesPending) {
    return (
      <Container id="main-cont">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <Thinking sizing="large" />
        </Box>
      </Container>
    );
  }

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
