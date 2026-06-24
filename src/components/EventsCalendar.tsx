import Box from "@mui/material/Box";
import type { Events } from "./workhorse/queries";

export interface EventsProps {
  events: Events[];
}

export default function EventsCalendar({ events }: EventsProps) {
  return <Box></Box>;
}
