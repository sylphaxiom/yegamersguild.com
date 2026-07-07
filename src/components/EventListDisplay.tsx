import * as React from "react";
import Box from "@mui/material/Box";
import { fetchImages, type Events, type Image } from "./workhorse/queries";
import { Collapse, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

interface EventsListProps {
  events: Events[];
  selectedEvent: Events | null;
  onSelect: (e: Events) => void;
}

interface EventsDetailProps {
  event: Events;
  images: Image[];
}

export default function EventListDisplay({
  events,
  selectedEvent,
  onSelect,
}: EventsListProps) {
  const { data } = useQuery({ queryKey: ["images"], queryFn: fetchImages });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClick = (
    evnt: React.MouseEvent<HTMLElement>,
    selectedEvent: Events,
  ) => {
    evnt.preventDefault();
    onSelect(selectedEvent);
  };

  return isMobile ? (
    events.map((event) => (
      <React.Fragment key={event.id}>
        <Typography onClick={(e) => handleClick(e, event)}>
          {event.title}
        </Typography>
        {selectedEvent?.id === event.id ? <ExpandLess /> : <ExpandMore />}
        <Collapse in={selectedEvent?.id === event.id}>
          <EventsDetail event={event} images={data?.objects || []} />
        </Collapse>
      </React.Fragment>
    ))
  ) : (
    <>
      {events.map((event) => (
        <Typography key={event.id} onClick={(e) => handleClick(e, event)}>
          {event.title}
        </Typography>
      ))}
      {selectedEvent ? (
        <EventsDetail event={selectedEvent} images={data?.objects || []} />
      ) : (
        <Typography variant="body1">Select an event to see details</Typography>
      )}
    </>
  );
}

function EventsDetail({ event, images }: EventsDetailProps) {
  const selectedImage: Image =
    images.filter((img) => img.content_key === "evnt_" + event.id)[0] ?? null;
  return (
    <Box sx={{ alignItems: "center", width: "100%", maxHeight: "350px" }}>
      <Typography variant="h5">{event.title}</Typography>
      {selectedImage && (
        <Box
          component="img"
          width={200}
          height={200}
          src={selectedImage?.src}
          alt={selectedImage?.alt}
        />
      )}
      <Typography variant="body1">{event.description}</Typography>
    </Box>
  );
}
