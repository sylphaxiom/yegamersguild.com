import { Divider, Grid, Typography, useTheme } from "@mui/material";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  // Marker,
} from "@vis.gl/react-google-maps";
import { useNavigate } from "react-router";

export default function Location() {
  const navigate = useNavigate();
  const theme = useTheme();
  const token = import.meta.env.VITE_GAPI_KEY!;
  const location = (
    <Grid
      size={{ xs: 12, sm: 6, md: 4 }}
      sx={{
        px: 3,
        justifyContent: "center",
        alignContent: "start",
        pb: theme.breakpoints.only("xs") ? 3 : 0,
      }}
      role="complementary"
      aria-label="location"
    >
      <Typography variant="h3" component={"h2"}>
        Located at ...
      </Typography>
      <Divider />
      <br />
      <Typography variant="h5" component="p">
        2801 Fairview Place, Suite I
      </Typography>
      <Typography variant="h5" component="p">
        Greenwood, Indiana 46142
      </Typography>
      <br />
      <Divider />
      <br />
      <Typography variant="h5" component="p">
        We're off 135, just south of Fry Road. We look forward to seeing you at
        the Guild!
      </Typography>
    </Grid>
  );

  const map = (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} role="figure" aria-label="google-map">
      <APIProvider apiKey={token}>
        <Map
          style={{
            width: "300px",
            height: "300px",
            margin: "0 auto",
            padding: "0 1em",
          }}
          defaultCenter={{ lat: 39.62146813390072, lng: -86.15762153193997 }}
          defaultZoom={17}
          gestureHandling="greedy"
          mapId="423afd03b213ef8ea8393497"
          disableDefaultUI
        >
          <AdvancedMarker
            position={{ lat: 39.62146813390072, lng: -86.15762153193997 }}
            aria-label="Guild-marker"
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
      }}
      role="complementary"
      aria-label="hours"
    >
      <Typography variant="h3" component={"h2"}>
        Hours ...
      </Typography>
      <Divider />
      <br />
      <Grid container sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Typography variant="h5" component="p">
            Monday: 3pm - 10pm
          </Typography>
          <Typography variant="h5" component="p">
            Tuesday: 3pm - 10pm
          </Typography>
          <Typography variant="h5" component="p">
            Wednesday: Closed
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Typography variant="h5" component="p">
            Thursday: 3pm - 10pm
          </Typography>
          <Typography variant="h5" component="p">
            Friday: 3pm - 10pm
          </Typography>
          <Typography variant="h5" component="p">
            Saturday/Sunday:
          </Typography>
          <Typography variant="h5" sx={{ textIndent: "30px" }} component="p">
            12 Noon - 10pm
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Grid container id="main-cont" role="article" aria-label="location">
      {location}
      {map}
      {hours}
    </Grid>
  );
}
