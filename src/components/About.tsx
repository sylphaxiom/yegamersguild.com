import * as React from "react";
import * as motion from "motion/react-client";
import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import { fetchContent, fetchImages, type Image } from "./workhorse/queries";
import { useQuery } from "@tanstack/react-query";
import { iconMap } from "./workhorse/mappings";

function buildImg({ shortName, src, alt, width, height }: Image) {
  return (
    <motion.img
      transition={{ duration: 0.7, ease: "linear" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={shortName}
      src={src}
      alt={alt}
      width={width}
      height={height}
    />
  );
}

function buildBlurb(blurb: string) {
  const bits = blurb.split("|");
  const Abit = bits.length > 1 ? bits[0] : null;
  const Bbit = bits.length > 1 ? bits[1] : bits[0];
  return (
    <>
      <Typography variant="h4" component="span" sx={{ pr: 1 }}>
        {Abit}
      </Typography>
      {Bbit}
    </>
  );
}

export interface Bullets {
  icon: string;
  text: string;
}

export default function About() {
  const [img, setImg] = React.useState(0);
  const navigate = useNavigate();
  let aboutHeaderText: string | undefined;
  let blurbOutput: React.ReactElement | undefined;
  let aboutBulletsText: Bullets[] | undefined;

  // Grab content and images data from the server
  const { data: allImages } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });

  const images = React.useMemo(() => {
    if (!allImages?.objects) return undefined;
    const filtered = [...allImages.objects].filter(
      (image) => image.content_key === "about_images",
    );
    const sorted = filtered.sort(
      (a, b) => Number(a.display_order) - Number(b.display_order),
    );
    return sorted;
  }, [allImages]);

  if (content?.objects) {
    const aboutContent = content.objects.filter((content) =>
      content.content_key.includes("about_"),
    );
    if (aboutContent) {
      const aboutBlurb = aboutContent.find(
        (content) => content.content_key === "about_blurb",
      );
      const aboutBullets = aboutContent.find(
        (content) => content.content_key === "about_bullets",
      );
      const aboutHeader = aboutContent.find(
        (content) => content.content_key === "about_header",
      );
      if (aboutBlurb) {
        const aboutBlurbText = aboutBlurb.value;
        blurbOutput = buildBlurb(aboutBlurbText);
      }
      if (aboutBullets) {
        aboutBulletsText = JSON.parse(aboutBullets.value);
      }
      if (aboutHeader) {
        aboutHeaderText = aboutHeader.value;
      }
    }
  }

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (images) {
        if (img === images.length - 1) {
          setImg(0);
        } else {
          setImg(img + 1);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [img, images]);

  return (
    <Grid container id="about-cont" role="article" sx={{ p: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h3" sx={{ pb: 4 }} component="h2">
          {aboutHeaderText}
        </Typography>
        <Typography sx={{ mb: 2 }}>{blurbOutput}</Typography>
        {aboutBulletsText?.map((bullet) => (
          <Stack
            direction={"row"}
            key={bullet.text + "-stack"}
            sx={{ alignItems: "center" }}
          >
            <span style={{ margin: "0 1em" }}>{iconMap[bullet.icon]}</span>
            <Typography
              variant="h5"
              component={"p"}
              key={bullet.text + "-text"}
              sx={{ my: 1 }}
            >
              {bullet.text}
            </Typography>
          </Stack>
        ))}
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Button
            variant="contained"
            type="submit"
            onClick={() => navigate("shop")}
          >
            Check out our inventory
          </Button>
        </Box>
      </Grid>
      <Grid
        size={{ xs: 12, sm: 4, md: 6 }}
        sx={{
          textAlign: "center",
          height: "512px",
          width: "400px",
          overflow: "hidden",
        }}
      >
        <AnimatePresence mode="wait">
          {images && buildImg(images[img])}
        </AnimatePresence>
      </Grid>
    </Grid>
  );
}
