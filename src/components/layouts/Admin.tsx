import { withAuthenticationRequired } from "@auth0/auth0-react";
import Thinking from "../baubles/Thinking";
import { Outlet } from "react-router";
import { Box, Typography } from "@mui/material";

export default withAuthenticationRequired(Admin, {
  onRedirecting: () => <Thinking />,
});

export function Admin() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          component="img"
          src="guild_logo_wood_metal_1200-1000.png"
          alt="Guild Logo"
          width="240px"
          height="200px"
          sx={{ m: 2 }}
        />
        <Typography variant="h1" sx={{ mx: 2 }}>
          Admin Console
        </Typography>
      </Box>
      <Outlet />
    </Box>
  );
}
