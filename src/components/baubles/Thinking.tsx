import type { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import * as motions from "motion/react";
import * as motion from "motion/react-client";
import * as React from "react";

interface ThinkingProps {
  sizing?: "small" | "medium" | "large";
}

export default function Thinking(props: ThinkingProps) {
  const time = motions.useTime();
  const rotate = motions.useTransform(time, [0, 1500], [0, 360], {
    clamp: false,
  });

  React.useEffect(() => {}, []);

  let daddy: SxProps;
  let logo: React.CSSProperties;

  switch (props.sizing) {
    case "large":
      daddy = {
        position: "relative",
        textAlign: "center",
        padding: 0,
        width: "250px",
        height: "250px",
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
        overflow: "hidden",
      };
      logo = {
        position: "absolute",
        width: "100px",
        height: "100px",
        alignSelf: "center",
        marginLeft: "75px",
      };
      break;
    case "medium":
      daddy = {
        position: "relative",
        textAlign: "center",
        padding: 0,
        width: "175px",
        height: "175px",
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
      };
      logo = {
        position: "absolute",
        width: "75px",
        height: "75px",
        alignSelf: "center",
        marginLeft: "50px",
      };
      break;
    case "small":
      daddy = {
        position: "relative",
        textAlign: "center",
        padding: 0,
        width: "100px",
        height: "100px",
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
      };
      logo = {
        position: "absolute",
        width: "50px",
        height: "50px",
        alignSelf: "center",
        marginLeft: "25px",
      };
      break;
    default:
      daddy = {
        position: "relative",
        width: "250px",
        height: "250px",
        display: "flex",
        marginLeft: "auto",
        marginRight: "auto",
      };
      logo = {
        position: "absolute",
        width: "100px",
        height: "100px",
        alignSelf: "center",
        marginLeft: "75px",
      };
  }

  return (
    <Box id="spinDaddy" sx={daddy} role="status" aria-live="polite">
      <motion.img
        id="dragonSpinner"
        src="/dragon_spinner.svg"
        alt="A rainbow dragon spinning around the Kothis logo."
        style={{
          rotate: rotate,
          overflow: "hidden",
        }}
      />
      <img
        src="/kothis.svg"
        id="logoBG"
        style={logo}
        alt="Logo of Kothis which looks like a D20 with a fancy K in the middle and some designs to represent the classes of the original players."
      />
    </Box>
  );
}
