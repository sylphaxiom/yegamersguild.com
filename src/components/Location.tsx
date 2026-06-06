import { Divider, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "./workhorse/queries";

export interface Hours {
  day: string;
  start: number;
  sap: "am" | "pm" | "noon";
  end: number;
  eap: "am" | "pm" | "noon";
}

export interface Address {
  line1: string;
  line2: string;
  line3: string;
}

export interface LocationProps {
  preview?: boolean;
}

export default function Location({ preview }: LocationProps) {
  let locationHeaderText: string | undefined;
  let locationBlurbText: string | undefined;
  let locationAddressText: Address | undefined;
  let hoursHeaderText: string | undefined;
  let mondayHours: Hours | undefined;
  let tuesdayHours: Hours | undefined;
  let wednesdayHours: Hours | undefined;
  let thursdayHours: Hours | undefined;
  let fridayHours: Hours | undefined;
  let saturdayHours: Hours | undefined;
  let sundayHours: Hours | undefined;

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
        (content) => content.content_key === "hours_hours",
      );
      const hoursHeader = hoursContent.find(
        (content) => content.content_key === "hours_header",
      );
      if (hoursHours) {
        const parsedHours: Hours[] = JSON.parse(hoursHours.value);
        mondayHours = parsedHours.find((hr) => hr.day === "Monday");
        tuesdayHours = parsedHours.find((hr) => hr.day === "Tuesday");
        wednesdayHours = parsedHours.find((hr) => hr.day === "Wednesday");
        thursdayHours = parsedHours.find((hr) => hr.day === "Thursday");
        fridayHours = parsedHours.find((hr) => hr.day === "Friday");
        saturdayHours = parsedHours.find((hr) => hr.day === "Saturday");
        sundayHours = parsedHours.find((hr) => hr.day === "Sunday");
      }
      if (hoursHeader) {
        hoursHeaderText = hoursHeader.value;
      }
    }
  }

  const location = (
    <Grid
      size={preview ? { xs: 12, sm: 6 } : { xs: 12, sm: 6, md: 4 }}
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
      size={preview ? { xs: 12, sm: 6 } : { xs: 12, md: 4 }}
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
        {hoursHeaderText}
      </Typography>
      <Divider />
      <br />
      <Grid container sx={{ alignItems: "center" }}>
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {mondayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {mondayHours?.start === 0
                  ? "Closed"
                  : `${mondayHours?.start}${mondayHours?.sap} - ${mondayHours?.end}${mondayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {tuesdayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {tuesdayHours?.start === 0
                  ? "Closed"
                  : `${tuesdayHours?.start}${tuesdayHours?.sap} - ${tuesdayHours?.end}${tuesdayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {wednesdayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {wednesdayHours?.start === 0
                  ? "Closed"
                  : `${wednesdayHours?.start}${wednesdayHours?.sap} - ${wednesdayHours?.end}${wednesdayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 12 }}>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {thursdayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {thursdayHours?.start === 0
                  ? "Closed"
                  : `${thursdayHours?.start}${thursdayHours?.sap} - ${thursdayHours?.end}${thursdayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {fridayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {fridayHours?.start === 0
                  ? "Closed"
                  : `${fridayHours?.start}${fridayHours?.sap} - ${fridayHours?.end}${fridayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {saturdayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {saturdayHours?.start === 0
                  ? "Closed"
                  : `${saturdayHours?.start}${saturdayHours?.sap} - ${saturdayHours?.end}${saturdayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
          <Grid container>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {sundayHours?.day}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    margin: "0 8px 0 0",
                  }}
                >
                  :
                </span>
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="h5" component="p">
                {sundayHours?.start === 0
                  ? "Closed"
                  : `${sundayHours?.start}${sundayHours?.sap} - ${sundayHours?.end}${sundayHours?.eap}`}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Grid container id="main-cont" role="article" aria-label="location">
      {location}
      {!preview && map}
      {hours}
    </Grid>
  );
}
