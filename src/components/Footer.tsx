import { Box, Button, Divider, Link, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Copyright from "@mui/icons-material/Copyright";
import { useQuery } from "@tanstack/react-query";
import { fetchContent } from "./workhorse/queries";
import { iconMap } from "./workhorse/mappings";

interface Hours {
  day: string;
  start: number;
  sap: "am" | "pm" | "noon";
  end: number;
  eap: "am" | "pm" | "noon";
}

interface LocationAddress {
  line1: string;
  line2: string;
  line3: string;
}

interface QuickLink {
  text: string;
  icon: string;
  href: string;
}

export default function Footer() {
  let locationHeaderText: string | undefined;
  let locationAddressText: LocationAddress | undefined;
  let hoursHeaderText: string | undefined;
  let mondayHours: Hours | undefined;
  let tuesdayHours: Hours | undefined;
  let wednesdayHours: Hours | undefined;
  let thursdayHours: Hours | undefined;
  let fridayHours: Hours | undefined;
  let saturdayHours: Hours | undefined;
  let sundayHours: Hours | undefined;
  let quickLinks: QuickLink[] | undefined;
  let quickHeaderText: string | undefined;

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
    const linkContent = content.objects.filter((content) =>
      content.content_key.includes("quick_"),
    );
    if (locationContent) {
      const locationHeader = locationContent.find(
        (content) => content.content_key === "location_header",
      );
      const locationAddress = locationContent.find(
        (content) => content.content_key === "location_address",
      );
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
    if (linkContent) {
      const quickHeader = linkContent.find(
        (content) => content.content_key === "quick_header",
      );
      const quickLinksContent = linkContent.find(
        (content) => content.content_key === "quick_links",
      );
      if (quickLinksContent) {
        quickLinks = JSON.parse(quickLinksContent.value);
      }
      if (quickHeader) {
        quickHeaderText = quickHeader.value;
      }
    }
  }

  return (
    <Grid id="footer" component={"footer"} size={12} sx={{ mt: 10 }} container>
      <Grid size={{ xs: 6, sm: 3, md: 4 }} id="foot-loc">
        <Typography variant="h5" component="label" color="secondary">
          {locationHeaderText}
        </Typography>
        <Divider />
        <Typography variant="body2">{locationAddressText?.line1}</Typography>
        <Typography variant="body2">{locationAddressText?.line2}</Typography>
        <Typography variant="body2">{locationAddressText?.line3}</Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }} id="foot-hrs">
        <Typography variant="h5" component="label" color="secondary">
          {hoursHeaderText}
        </Typography>
        <Divider />
        <Grid container sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              {mondayHours?.day}:{" "}
              {mondayHours?.start === 0
                ? "Closed"
                : mondayHours?.start! +
                  mondayHours?.sap! +
                  " - " +
                  mondayHours?.end +
                  mondayHours?.eap}
            </Typography>
            <Typography variant="body2">
              {tuesdayHours?.day}:{" "}
              {tuesdayHours?.start === 0
                ? "Closed"
                : tuesdayHours?.start! +
                  tuesdayHours?.sap! +
                  " - " +
                  tuesdayHours?.end +
                  tuesdayHours?.eap}
            </Typography>
            <Typography variant="body2">
              {wednesdayHours?.day}:{" "}
              {wednesdayHours?.start === 0
                ? "Closed"
                : wednesdayHours?.start! +
                  wednesdayHours?.sap! +
                  " - " +
                  wednesdayHours?.end +
                  wednesdayHours?.eap}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">
              {thursdayHours?.day}:{" "}
              {thursdayHours?.start === 0
                ? "Closed"
                : thursdayHours?.start! +
                  thursdayHours?.sap! +
                  " - " +
                  thursdayHours?.end +
                  thursdayHours?.eap}
            </Typography>
            <Typography variant="body2">
              {fridayHours?.day}:{" "}
              {fridayHours?.start === 0
                ? "Closed"
                : fridayHours?.start! +
                  fridayHours?.sap! +
                  " - " +
                  fridayHours?.end +
                  fridayHours?.eap}
            </Typography>
            <Typography variant="body2">
              {saturdayHours?.day}:{" "}
              {saturdayHours?.start === 0
                ? "Closed"
                : saturdayHours?.start! +
                  saturdayHours?.sap! +
                  " - " +
                  saturdayHours?.end +
                  saturdayHours?.eap}
            </Typography>
            <Typography variant="body2">
              {sundayHours?.day}:{" "}
              {sundayHours?.start === 0
                ? "Closed"
                : sundayHours?.start! +
                  sundayHours?.sap! +
                  " - " +
                  sundayHours?.end +
                  sundayHours?.eap}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 4 }} id="foot-link">
        <Typography variant="h5" component="label" color="secondary">
          {quickHeaderText}
        </Typography>
        <Divider />
        <Box
          sx={{
            columns: (quickLinks ?? []).length > 4 ? 2 : 1,
          }}
        >
          {quickLinks?.map((link) => (
            <Box key={link.href} sx={{ display: "block", maxHeight: "1.2em" }}>
              <Button
                component={Link}
                href={link.href}
                size="small"
                target="_blank"
                rel="noreferrer"
                sx={{
                  p: 0,
                  minWidth: "auto",
                  justifyContent: "flex-start",
                }}
                startIcon={iconMap[link.icon]}
                color="info"
              >
                {link.text}
              </Button>
            </Box>
          ))}
        </Box>
      </Grid>
      <Grid size={12}>
        <Typography sx={{ textAlign: "center", fontSize: 12 }}>
          {"Copyright "}
          <Copyright color="secondary" fontSize="inherit" />{" "}
          {new Date().getFullYear()}
          <Link
            href="https://sylphaxiom.com/contact"
            target="_blank"
            rel="noreferrer"
            underline="none"
            color="secondary"
          >
            {" Sylphaxiom Creative "}
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );
}
