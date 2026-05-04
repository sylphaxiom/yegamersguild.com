import * as React from "react";
import * as motion from "motion/react-client";
import {
  Box,
  Button,
  Collapse,
  Grow,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { AnimatePresence } from "motion/react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
interface Img {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

function buildImg({ key, src, alt, width, height }: Img) {
  return (
    <motion.img
      transition={{ duration: 0.7, ease: "linear" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      key={key}
      src={src}
      alt={alt}
      width={width}
      height={height}
    />
  );
}

export default function About() {
  const [open, setOpen] = React.useState(false);
  const [img, setImg] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (img === images.length - 1) {
        setImg(0);
      } else {
        setImg(img + 1);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [img]);

  return (
    <Grid container id="about-cont" role="article" sx={{ p: 3 }}>
      <Grid size={{ xs: 12, sm: 8, md: 6 }}>
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
          <Button variant="contained" onClick={() => setOpen(!open)}>
            Check out our inventory
          </Button>
        </Box>
        <Collapse in={open}>
          <Box
            sx={{
              border: "2px solid",
              borderRadius: "5px",
              mx: "auto",
              padding: 2,
              textAlign: "center",
              margin: 2,
            }}
          >
            <Typography variant="h4" component="aside">
              Only Joking!
            </Typography>
            <img
              src="construction.svg"
              width="60%"
              height="auto"
              alt="Some stick figures building a website, literally."
            />
            <Typography variant="h4" component="aside">
              This is coming soon
            </Typography>
          </Box>
        </Collapse>
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
        <AnimatePresence mode="wait">{buildImg(images[img])}</AnimatePresence>
      </Grid>
    </Grid>
  );
}

const images: Img[] = [
  {
    key: "40kDisp",
    src: "40k_display.jpg",
    alt: "Sales display of Warhammer 40k minis.",
    width: 288,
    height: 512,
  },
  {
    key: "40kTable",
    src: "40k_table.jpg",
    alt: "Image of a Warhammer 40k table top with minis and terrain models.",
    width: 384,
    height: 512,
  },
  {
    key: "dndBooks",
    src: "dnd_books.jpg",
    alt: "Image of several of the same Dungeons and Dragons book on a sales shelf.",
    width: 288,
    height: 512,
  },
  {
    key: "dndGame",
    src: "dnd_game.jpg",
    alt: "Image of a TTRPG game in progress with minis and terrain models.",
    width: 341,
    height: 192,
  },
  {
    key: "miniPaint1",
    src: "mini_paint.jpg",
    alt: "Image of a painted scarecrow mini holding a lantern and sitting on a pumpkin.",
    width: 280,
    height: 426,
  },
  {
    key: "miniPaint2",
    src: "mini_paint2.jpg",
    alt: "Image of a painted worm-like monster mini poised like a striking snake.",
    width: 384,
    height: 512,
  },
  {
    key: "mtgCard",
    src: "mtg_card.jpg",
    alt: "Image of 5 really nice looking Magic the Gathering cards on a table.",
    width: 321,
    height: 427,
  },
  {
    key: "mtgParty",
    src: "mtg_party.jpg",
    alt: "Several people in a room sitting at tables playing Magic the Gathering.",
    width: 341,
    height: 256,
  },
];
