import * as motion from "motion/react-client";
import * as React from "react";

function randStar(iter: number) {
  const tiny = " -1.5,5 -5,1.5 5,1.5 1.5,5 1.5,-5 5,-1.5 -5,-1.5 z";
  const small = " -2.5,10 -10,2.5 10,2.5 2.5,10 2.5,-10 10,-2.5 -10,-2.5 z";
  const medium = " -3.5,15 -15,3.5 15,3.5 3.5,15 3.5,-15 15,-3.5 -15,-3.5 z";
  const large = " -4,20 -20,4 20,4 4,20 4,-20 20,-4 -20,-4 z";
  const size = Math.floor(Math.random() * 4);
  const sizes = [tiny, small, medium, large];
  let xVal = Math.ceil(Math.random() * 19200);
  let yVal = Math.ceil(Math.random() * 10800);
  const duration = Math.random() * 2;
  const bounce = Math.random() * 0.5;

  return (
    <motion.path
      d={"m " + xVal + "," + yVal + sizes[size]}
      fill="#fff"
      id={"star" + iter}
      key={"star" + iter}
      scale={0}
      animate={{
        scale: 1,
      }}
      transition={{
        type: "spring",
        repeat: Infinity,
        repeatType: "reverse",
        duration: duration,
        bounce: bounce,
      }}
    />
  );
}

export default function TwinkleStars() {
  const [stars, setStars] = React.useState<React.ReactNode[]>([]);

  React.useEffect(() => {
    const totalStars = Math.floor(200 + Math.random() * 400);
    let iter = 0;
    let stars = [];
    while (iter < totalStars) {
      stars.push(randStar(iter));
      iter++;
    }
    console.log("Number of stars is " + totalStars);
    setStars(stars);
  }, []);
  return (
    <svg
      id="stary_bg"
      viewBox="0 0 19200 10800"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      {stars.map((star) => star)}
    </svg>
  );
}
