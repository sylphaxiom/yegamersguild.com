import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import { IconButton, useMediaQuery } from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

export default function ModeSwitch() {
  const { mode, setMode, systemMode } = useColorScheme();
  if (!mode) {
    return null;
  }
  const [_color, setColor] = React.useState(
    // This is only here to re-trigger the rendering.
    systemMode?.toString(),
  );
  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  React.useEffect(() => {
    if (mode === "system") {
      isDark ? setMode("dark") : setMode("light");
    }
  }, [mode]);
  const handleMode = () => {
    mode === "light" ? setMode("dark") : setMode("light");
    setColor(mode.toString());
  };
  return (
    <IconButton
      aria-label="change mode"
      color="secondary"
      onClick={handleMode}
      id="mode-switch"
      sx={{
        position: "fixed",
        top: 10,
        right: 15,
      }}
    >
      {mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
    </IconButton>
  );
}
