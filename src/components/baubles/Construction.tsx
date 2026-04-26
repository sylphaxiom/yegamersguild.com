import * as React from "react";
import * as motion from "motion/react-client";
import * as motions from "motion/react";
import { stagger } from "motion";
import Box from "@mui/material/Box";
import { Typography, useTheme } from "@mui/material";
import { Link } from "react-router";

export default function Construction() {
  const theme = useTheme();
  const [scope, animate] = motions.useAnimate();
  const [bounce, setBounce] = React.useState(true);
  let title = "Huh...";

  React.useEffect(() => {
    const bouncy = animate(
      "span",
      { y: [-35, -105, -35] },
      { delay: stagger(0.2), duration: 0.6, ease: ["easeIn", "easeOut"] },
    );
    setTimeout(() => {
      bouncy.then;
      setBounce(!bounce);
    }, 3000);
  }, [bounce]);

  return (
    <Box
      id="loader_scr"
      sx={{
        minWidth: 1,
        p: 0,
        textAlign: "center",
      }}
    >
      <img
        src={"/resources/construction.svg"}
        id="construction_img"
        className="svg"
        alt="Some guys building a website, literally."
        width={"50%"}
        height={"auto"}
      />
      <motions.AnimatePresence initial={false} mode="wait">
        <motion.div
          layout
          className="loading"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            overflow: "visible",
            fontFamily: "Courier New, monospace",
            fontWeight: 700,
            marginTop: 20,
          }}
          ref={scope}
        >
          {title.split("").map((char: string, index: number) => {
            return <motion.span key={char + index}>{char}</motion.span>;
          })}
        </motion.div>
      </motions.AnimatePresence>
      <Typography
        variant="h3"
        component="div"
        sx={{ fontFamily: "Brush Scritp MT, cursive", marginBottom: 5 }}
      >
        Looks like I'm still under construction...
      </Typography>
      <Typography
        variant="h3"
        component="div"
        sx={{ fontFamily: "Brush Scritp MT, cursive", marginBottom: 5 }}
      >
        Send me a{" "}
        <Link
          to="guestbook"
          style={{
            textDecoration: "none",
            color: theme.palette.primary.main,
          }}
        >
          message
        </Link>{" "}
        and I'll let you know when it's done!
      </Typography>
    </Box>
  );
}
