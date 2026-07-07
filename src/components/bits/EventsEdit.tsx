import { Box } from "@mui/material";
import type { Events } from "../workhorse/queries";

export interface EventsEditProps {
  event: Events;
  onDone: () => void;
}

export default function EventsEdit({ event, onDone }: EventsEditProps) {
  return <Box></Box>;
}
