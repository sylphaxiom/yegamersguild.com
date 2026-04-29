// import * as React from "react";
import { Divider, Grid, Typography, useTheme } from "@mui/material";
import Ticker from "@andremov/react-ticker";

export default function Header() {
  const theme = useTheme();

  return (
    <Grid container id="head-cont" role="heading" aria-level={1} sx={{ my: 2 }}>
      <Grid
        size={12}
        sx={{
          background: `content-box radial-gradient(${theme.palette.primary.main} , transparent 70%)`,
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
            boxShadow: `5px 7px 17px ${theme.palette.primary.main}`,
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
          Your local source for ...
        </Typography>
        <div style={{ position: "relative" }} role="marquee">
          <Ticker duration={20}>
            {tickerImgs.map((img) => {
              return (
                <div
                  key={`${img.key}-cont`}
                  style={{
                    margin: theme.breakpoints.only("xs") ? "0 5px" : "0 15px",
                    background: `content-box radial-gradient(${theme.palette.primary.main} , transparent 70%)`,
                  }}
                >
                  <img
                    key={`${img.key}-img`}
                    width={"auto"}
                    height={theme.breakpoints.down("xs") ? "50px" : "100px"}
                    src={img.src}
                    alt={img.alt}
                    style={{
                      margin: theme.breakpoints.only("xs")
                        ? "0 25px"
                        : "0 50px",
                      // boxShadow: `5px 7px 17px ${theme.palette.primary.main}`,
                    }}
                  />
                </div>
              );
            })}
          </Ticker>
        </div>
        <Typography variant="h4" sx={{ pb: 1 }} component="figure">
          ... and more! ...
        </Typography>
        <Divider />
      </Grid>
    </Grid>
  );
}

const tickerImgs = [
  {
    key: "pathfinder",
    src: "guild_pathfinder.png",
    alt: "Logo for Pathfinder",
  },
  {
    key: "mtg",
    src: "guild_mtg.jpg",
    alt: "Logo for Magic the Gathering",
  },
  {
    key: "dnd",
    src: "guild_dnd.jpg",
    alt: "Logo for Dungeons and Dragons",
  },
  {
    key: "battletech",
    src: "guild_battletech.png",
    alt: "Logo for Battletech",
  },
  {
    key: "40k",
    src: "guild_40k.jpg",
    alt: "Logo for Warhammer 40k",
  },
];
