import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Thinking from "../baubles/Thinking";
import { Outlet } from "react-router";
import { Box, Typography } from "@mui/material";
import LogoutButton from "../bits/LogoutButton";

export default withAuthenticationRequired(Admin, {
  onRedirecting: () => <Thinking />,
});

export function Admin() {
  const { user } = useAuth0();
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
        <Box
          sx={{
            ml: "auto",
            mr: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 1,
          }}
        >
          {user && (
            <Typography variant="body2" color="text.secondary">
              Signed in as {user.name ?? user.email}
            </Typography>
          )}
          <LogoutButton />
        </Box>
      </Box>
      <Outlet />
    </Box>
  );
}
