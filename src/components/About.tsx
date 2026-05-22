import * as React from "react";
import * as motion from "motion/react-client";
import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AnimatePresence } from "motion/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router";
import { fetchContent, fetchImages, type Image } from "./workhorse/queries";
import { useQuery } from "@tanstack/react-query";

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

export default function About() {
  const [img, setImg] = React.useState(0);
  const navigate = useNavigate();
  let aboutHeaderText: string | undefined;
  let blurbOutput: React.ReactElement | undefined;
  let aboutBulletsText: string[] | undefined;

  // Grab content and images data from the server
  const { data: allImages } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });

  let images: Image[] | undefined;
  if (allImages?.objects) {
    images = allImages.objects.filter(
      (image) => image.content_key === "about_images",
    );
  }

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
        <Typography variant="h2" sx={{ pb: 4 }} component="h2">
          {aboutHeaderText}
        </Typography>
        <Typography sx={{ mb: 2 }}>{blurbOutput}</Typography>
        {aboutBulletsText?.map((bullet) => (
          <Stack direction={"row"} key={bullet} sx={{ alignItems: "center" }}>
            <AutoAwesomeIcon sx={{ mx: 2 }} key={bullet + "-icon"} />
            <Typography
              variant="h5"
              component={"p"}
              key={bullet + "-text"}
              sx={{ my: 1 }}
            >
              {bullet}
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
          overflow: "",
        }}
      >
        <AnimatePresence mode="wait">
          {images && buildImg(images[img])}
        </AnimatePresence>
      </Grid>
    </Grid>
  );
}

// const images: Img[] = [
//   {
//     key: "40kDisp",
//     src: "/uploads/40k_display.jpg",
//     alt: "Sales display of Warhammer 40k minis.",
//     width: 288,
//     height: 512,
//   },
//   {
//     key: "40kTable",
//     src: "/uploads/40k_table.jpg",
//     alt: "Image of a Warhammer 40k table top with minis and terrain models.",
//     width: 384,
//     height: 512,
//   },
//   {
//     key: "dndBooks",
//     src: "/uploads/dnd_books.jpg",
//     alt: "Image of several of the same Dungeons and Dragons book on a sales shelf.",
//     width: 288,
//     height: 512,
//   },
//   {
//     key: "dndGame",
//     src: "/uploads/dnd_game.jpg",
//     alt: "Image of a TTRPG game in progress with minis and terrain models.",
//     width: 341,
//     height: 192,
//   },
//   {
//     key: "miniPaint1",
//     src: "/uploads/mini_paint.jpg",
//     alt: "Image of a painted scarecrow mini holding a lantern and sitting on a pumpkin.",
//     width: 280,
//     height: 426,
//   },
//   {
//     key: "miniPaint2",
//     src: "/uploads/mini_paint2.jpg",
//     alt: "Image of a painted worm-like monster mini poised like a striking snake.",
//     width: 384,
//     height: 512,
//   },
//   {
//     key: "mtgCard",
//     src: "/uploads/mtg_card.jpg",
//     alt: "Image of 5 really nice looking Magic the Gathering cards on a table.",
//     width: 321,
//     height: 427,
//   },
//   {
//     key: "mtgParty",
//     src: "/uploads/mtg_party.jpg",
//     alt: "Several people in a room sitting at tables playing Magic the Gathering.",
//     width: 341,
//     height: 256,
//   },
// ];
