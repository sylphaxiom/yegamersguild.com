import * as React from "react";
import * as motion from "motion/react-client";
import { Box, Button, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { AnimatePresence } from "motion/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useNavigate } from "react-router";
import {
  fetchContent,
  fetchImages,
  queryClient,
  type Image,
} from "./workhorse/queries";
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

export async function clientLoader() {
  // Grab catalog information
  queryClient.prefetchQuery({
    queryKey: ["content", "about_header"],
    queryFn: () => fetchContent("about_header"),
  });
  queryClient.prefetchQuery({
    queryKey: ["content", "about_blurb"],
    queryFn: () => fetchContent("about_blurb"),
  });
  queryClient.prefetchQuery({
    queryKey: ["content", "about_bullets"],
    queryFn: () => fetchContent("about_bullets"),
  });
  queryClient.prefetchQuery({
    queryKey: ["images", "about_images"],
    queryFn: () => fetchImages("about_images"),
  });
  return;
}

export default function About() {
  const [img, setImg] = React.useState(0);
  const navigate = useNavigate();

  const { data: images } = useQuery({
    queryKey: ["images", "about_images"],
    queryFn: () => fetchImages("about_images"),
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (images?.objects) {
        if (img === images.objects.length - 1) {
          setImg(0);
        } else {
          setImg(img + 1);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [img]);

  return (
    <Grid container id="about-cont" role="article" sx={{ p: 3 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant="h2" sx={{ pb: 4 }} component="h2">
          About The Guild...
        </Typography>
        <Typography sx={{ mb: 2 }}>
          <Typography variant="h4" component="span" sx={{ pr: 1 }}>
            Ye Gamer's Guild
          </Typography>
          is a locally owned and operated gameshop in Greenwood, IN. We sell
          TTRPG books, board games, Magic the Gathering cards, dice, minis, and
          more!
        </Typography>
        <Stack direction={"row"} sx={{ alignItems: "center" }}>
          <AutoAwesomeIcon sx={{ mx: 2 }} />
          <Typography variant="h5" component={"p"} sx={{ my: 1 }}>
            Group gaming spaces...
          </Typography>
        </Stack>
        <Stack direction={"row"} sx={{ alignItems: "center" }}>
          <AutoAwesomeIcon sx={{ mx: 2 }} />
          <Typography variant="h5" component={"p"} sx={{ my: 1 }}>
            Books, games, cards...
          </Typography>
        </Stack>
        <Stack direction={"row"} sx={{ alignItems: "center" }}>
          <AutoAwesomeIcon sx={{ mx: 2 }} />
          <Typography variant="h5" component={"p"} sx={{ my: 1 }}>
            Tournaments, events, snacks...
          </Typography>
        </Stack>
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
          {images?.objects && buildImg(images.objects[img])}
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
