import { Divider, Grid, Typography } from "@mui/material";

export default function Location() {
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
