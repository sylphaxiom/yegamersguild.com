import { Button, Divider, Link, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import Copyright from "@mui/icons-material/Copyright";
import Facebook from "@mui/icons-material/Facebook";

export default function Footer() {
  return (
    <Grid
      id="foot-cont"
      component={"footer"}
      size={12}
      sx={{ mt: 10 }}
      container
    >
      <Grid size={{ xs: 6, sm: 3, md: 4 }} id="foot-loc">
        <Typography variant="h5" color="secondary">
          Located at ...
        </Typography>
        <Divider />
        <Typography variant="body2">2801 Fairview Place</Typography>
        <Typography variant="body2">Suite I</Typography>
        <Typography variant="body2">Greenwood, Indiana 46142</Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 4 }} id="foot-hrs">
        <Typography variant="h5" color="secondary">
          Hours ...
        </Typography>
        <Divider />
        <Grid container sx={{ alignItems: "center" }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">Monday: 3pm - 10pm</Typography>
            <Typography variant="body2">Tuesday: 3pm - 10pm</Typography>
            <Typography variant="body2">Wednesday: Closed</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="body2">Thursday: 3pm - 10pm</Typography>
            <Typography variant="body2">Friday: 3pm - 10pm</Typography>
            <Typography variant="body2">Saturday/Sunday:</Typography>
            <Typography variant="body2" sx={{ textIndent: "30px" }}>
              12 Noon - 10pm
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={{ xs: 12, sm: 3, md: 4 }} id="foot-link">
        <Typography variant="h5" color="secondary">
          Quick Links ...
        </Typography>
        <Divider />
        <Button
          component={Link}
          href="https://www.facebook.com/groups/1713819175318878/"
          target="_blank"
          rel="noreferrer"
          startIcon={<Facebook />}
          color="info"
        >
          <span style={{}}> {"Facebook"}</span>
        </Button>
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
