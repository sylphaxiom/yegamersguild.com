import { Divider, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchContent, fetchImages } from "./workhorse/queries";

interface Hours {
  day: string;
  start: string;
  sap: "am" | "pm" | "noon";
  end: string;
  eap: "am" | "pm" | "noon";
}

export default function Location() {
  let locationHeaderText: string | undefined;
  let locationBlurbText: string | undefined;
  let locationAddressText:
    | { line1: string; line2: string; line3: string }
    | undefined;
  let hoursHeaderText: string | undefined;
  let hoursHoursText: Hours[] | undefined;

  // Grab content data from the server
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });

  if (content?.objects) {
    const locationContent = content.objects.filter((content) =>
      content.content_key.includes("location_"),
    );
    const hoursContent = content.objects.filter((content) =>
      content.content_key.includes("hours_"),
    );
    if (locationContent) {
      const locationBlurb = locationContent.find(
        (content) => content.content_key === "location_blurb",
      );
      const locationHeader = locationContent.find(
        (content) => content.content_key === "location_header",
      );
      const locationAddress = locationContent.find(
        (content) => content.content_key === "location_address",
      );
      if (locationBlurb) {
        locationBlurbText = locationBlurb.value;
      }
      if (locationAddress) {
        locationAddressText = JSON.parse(locationAddress.value);
      }
      if (locationHeader) {
        locationHeaderText = locationHeader.value;
      }
    }
    if (hoursContent) {
      const hoursHours = hoursContent.find(
        (content) => content.content_key === "hours_blurb",
      );
      const hoursHeader = hoursContent.find(
        (content) => content.content_key === "hours_header",
      );
      if (hoursHours) {
        hoursHoursText = JSON.parse(hoursHours.value);
      }
      if (hoursHeader) {
        hoursHeaderText = hoursHeader.value;
      }
    }
  }

  const location = (
    <Grid
      size={{ xs: 12, sm: 6, md: 4 }}
      sx={{
        px: 3,
        justifyContent: "center",
        alignContent: "start",
        pb: { xs: 3, sm: 0 },
      }}
      role="complementary"
      aria-label="location"
    >
      <Typography variant="h3" component={"h2"}>
        {locationHeaderText}
      </Typography>
      <Divider />
      <br />
      <Typography variant="h5" component="p">
        {locationAddressText?.line1 + " " + locationAddressText?.line2}
      </Typography>
      <Typography variant="h5" component="p">
        {locationAddressText?.line3}
      </Typography>
      <br />
      <Divider />
      <br />
      <Typography variant="h5" component="p">
        {locationBlurbText}
      </Typography>
    </Grid>
  );

  const map = (
    <Grid
      size={{ xs: 12, sm: 6, md: 4 }}
      role="figure"
      id="google-map"
      aria-label="google-map"
      sx={{ textAlign: "center" }}
    >
      <iframe
        width="300"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps/embed/v1/place?q=place_id:ChIJFWn4-chda4gR0Pou2Py3W0Y&key=AIzaSyAUlouPL20QFVnOrQ0QXvLOE-99orktyfs"
      ></iframe>
    </Grid>
  );

  const hours = (
    <Grid
      size={{ xs: 12, md: 4 }}
      sx={{
        px: 3,
        justifyContent: "center",
        alignContent: "start",
        pt: { xs: 3, sm: 0 },
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
          <Grid container>
            <Grid size={5}>
              <Typography variant="h5" component="p">
                Monday
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 10px",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={7}>
              <Typography variant="h5" component="p">
                3pm - 10pm
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={5}>
              <Typography variant="h5" component="p">
                Tuesday
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 10px",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={7}>
              <Typography variant="h5" component="p">
                3pm - 10pm
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={5}>
              <Typography variant="h5" component="p">
                wednesday
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 10px",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={7}>
              <Typography variant="h5" component="p">
                Closed
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Grid container>
            <Grid size={5}>
              <Typography variant="h5" component="p">
                Thursday
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 10px",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={7}>
              <Typography variant="h5" component="p">
                3pm - 10pm
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={5}>
              <Typography variant="h5" component="p">
                Friday
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 10px",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={7}>
              <Typography variant="h5" component="p">
                3pm - 10pm
              </Typography>
            </Grid>
          </Grid>
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
