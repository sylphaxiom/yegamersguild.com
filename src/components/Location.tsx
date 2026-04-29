import { Divider, Grid, Typography, useTheme } from "@mui/material";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import type { JSX } from "react";
import { useNavigate, type NavigateFunction } from "react-router";

export default function Location() {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = (
    <Grid
      size={{ xs: 12, md: 4 }}
      sx={{
        px: 3,
        justifyContent: "center",
        alignContent: "start",
        pb: theme.breakpoints.only("xs") ? 3 : 0,
        maxWidth: theme.breakpoints.only("sm") ? "60%" : "100%",
        mx: theme.breakpoints.only("sm") ? "auto" : "0",
      }}
    >
      <Typography variant="h3" component={"h3"}>
        Located at ...
      </Typography>
      <Divider />
      <br />
      <Typography variant="h5">2801 Fairview Place, Suite I</Typography>
      <Typography variant="h5">Greenwood, Indiana 46142</Typography>
      <br />
      <Divider />
      <br />
      <Typography variant="h5">
        We're off 135, just south of Fry Road. We look forward to seeing you at
        the Guild!
      </Typography>
    </Grid>
  );

  const map = (
    <Grid size={{ xs: 12, md: 4 }}>
      <APIProvider apiKey={"AIzaSyCfBrObtOeivGWuM2hnefjJLioFpEiIJLg"}>
        <Map
          style={{ width: "300px", height: "300px", margin: "0 auto" }}
          defaultCenter={{ lat: 39.62146813390072, lng: -86.15762153193997 }}
          defaultZoom={17}
          gestureHandling="greedy"
          disableDefaultUI
        >
          <Marker
            position={{ lat: 39.62146813390072, lng: -86.15762153193997 }}
            onClick={() => {
              navigate(
                "https://www.google.com/maps/place/Ye+Gamer's+Guild/@39.621468,-86.157622,17z/data=!4m6!3m5!1s0x886b5d97c907c011:0x149761c044dfe441!8m2!3d39.6212833!4d-86.1576073!16s%2Fg%2F11fl22nmpn?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDQyNi4wIKXMDSoASAFQAw%3D%3D",
              );
            }}
          />
        </Map>
      </APIProvider>
    </Grid>
  );

  const hours = (
    <Grid
      size={{ xs: 12, md: 4 }}
      sx={{
        px: 3,
        justifyContent: "center",
        alignContent: "start",
        pt: theme.breakpoints.only("xs") ? 3 : 0,
        maxWidth: theme.breakpoints.only("sm") ? "60%" : "100%",
        mx: theme.breakpoints.only("sm") ? "auto" : "0",
      }}
    >
      <Typography variant="h3" component={"h3"}>
        Hours ...
      </Typography>
      <Divider />
      <br />
      <Typography variant="h5">Monday: 3pm - 10pm</Typography>
      <Typography variant="h5">Tuesday: 3pm - 10pm</Typography>
      <Typography variant="h5">Wednesday: Closed</Typography>
      <Typography variant="h5">Thursday: 3pm - 10pm</Typography>
      <Typography variant="h5">Friday: 3pm - 10pm</Typography>
      <Typography variant="h5">Saturday/Sunday:</Typography>
      <Typography variant="h5" sx={{ textIndent: "30px" }}>
        12 Noon - 10pm
      </Typography>
    </Grid>
  );

  return (
    <Grid container id="main-cont" role="article" aria-label="location">
      {/* {theme.breakpoints.down("sm")
        ? [location, map, hours].map((el) => el)
        : [location, hours, map].map((el) => el)} */}
      {location}
      {map}
      {hours}
    </Grid>
  );
}
