import * as React from "react";
import { Box, Divider, Grid, Typography, useTheme } from "@mui/material";
import Ticker from "@andremov/react-ticker";
import { useColorScheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { fetchContent, fetchImages } from "./workhorse/queries";

export default function Header() {
  const theme = useTheme();
  const { mode } = useColorScheme();
  const isDark = mode === "dark";
  let headerTopText: string | undefined;
  let headerBottomText: string | undefined;

  // Grab content and images data from the server
  const { data: allImages } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });

  const tickerImages = React.useMemo(() => {
    if (!allImages?.objects) return undefined;
    const filtered = [...allImages.objects].filter(
      (image) => image.content_key === "ticker_images",
    );
    const sorted = filtered.sort(
      (a, b) => Number(a.display_order) - Number(b.display_order),
    );
    return sorted;
  }, [allImages]);

  if (content?.objects) {
    const headerContent = content.objects.filter((content) =>
      content.content_key.includes("header_"),
    );
    if (headerContent) {
      const headerTop = headerContent.find(
        (content) => content.content_key === "header_top",
      );
      const headerBottom = headerContent.find(
        (content) => content.content_key === "header_bottom",
      );
      if (headerTop) {
        headerTopText = headerTop.value;
      }
      if (headerBottom) {
        headerBottomText = headerBottom.value;
      }
    }
  }

  return (
    <Grid container id="head-cont" role="heading" aria-level={1} sx={{ my: 2 }}>
      <Grid
        size={12}
        sx={{
          background: `content-box radial-gradient(${isDark ? theme.palette.primary.main : "rgba(180, 100, 30, 0.3)"}, transparent 70%)`,
          marginBottom: 2,
          display: "flex",
        }}
      >
        <img
          width={"50%"}
          height={"auto"}
          src="/guild_logo_wood_metal_1200-1000.png"
          alt="Logo for Ye Gamer\'s Guild, which is a dragon behind a shield with the name in a banner below it."
          style={{
            margin: "0 auto",
            boxShadow: `5px 7px 17px ${isDark ? theme.palette.primary.main : "rgba(180, 100, 30, 0.3)"}`,
            maxWidth: "500px",
          }}
        />
      </Grid>
      <Grid size={12}>
        <Typography variant="h1" id="title" sx={{ textAlign: "center", mb: 1 }}>
          Ye Gamer's Guild
        </Typography>
      </Grid>
      <Grid size={12} sx={{ textAlign: "center" }} role="marquee">
        <Divider />
        <Typography variant="h4" component="figure" sx={{ pt: 1 }}>
          {headerTopText}
        </Typography>
        <div style={{ position: "relative" }} role="marquee">
          <Ticker duration={20}>
            {tickerImages?.map((img) => {
              return (
                <Box
                  key={`${img.shortName}-cont`}
                  sx={{
                    margin: { xs: "0 5px", sm: "0 15px" },
                    background: `content-box radial-gradient(${isDark ? theme.palette.primary.main : "rgba(180, 100, 30, 0.3)"}, transparent 70%)`,
                  }}
                >
                  <Box
                    component="img"
                    key={`${img.shortName}-img`}
                    src={img.src}
                    alt={img.alt}
                    sx={{
                      width: "auto",
                      height: { xs: "50px", sm: "100px" },
                      margin: {
                        xs: "0 25px",
                        sm: "0 50px",
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Ticker>
        </div>
        <Typography variant="h4" sx={{ pb: 1 }} component="figure">
          {headerBottomText}
        </Typography>
        <Divider />
      </Grid>
    </Grid>
  );
}
