import * as React from "react";
import Box from "@mui/material/Box";
import { fetchImages, type Events, type Image } from "../workhorse/queries";
import {
  Collapse,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import EventListRow from "../bits/EventListRow";
import { formatDT } from "../workhorse/utils";
import { describeRule, type Occurrence } from "../workhorse/recurrence";

interface EventsListProps {
  events: Occurrence[];
  selectedEvent: Occurrence | null;
  onSelect: (e: Occurrence) => void;
}

interface EventsDetailProps {
  event: Events;
  images: Image[];
  isMobile?: boolean;
}

export default function EventListDisplay({
  events,
  selectedEvent,
  onSelect,
}: EventsListProps) {
  const { data } = useQuery({ queryKey: ["images"], queryFn: fetchImages });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return isMobile ? (
    events.map((event, index) => {
      const thumbnail = data?.objects?.find(
        (img) => img.content_key === "evnt_" + event?.id,
      );
      return (
        <React.Fragment key={event.occurrence_key}>
          <EventListRow
            event={event}
            index={index}
            selectedEvent={selectedEvent}
            onSelect={onSelect}
            thumbnail={thumbnail}
          />
          <Collapse in={selectedEvent?.occurrence_key === event.occurrence_key}>
            <EventsDetail
              event={event}
              images={data?.objects || []}
              isMobile={isMobile}
            />
          </Collapse>
        </React.Fragment>
      );
    })
  ) : (
    <Box sx={{ display: "flex", flexDirection: "row", gap: 2, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowY: "auto",
          maxHeight: "350px",
        }}
      >
        {events.map((event, index) => {
          const thumbnail = data?.objects?.find(
            (img) => img.content_key === "evnt_" + event?.id,
          );
          return (
            <EventListRow
              event={event}
              index={index}
              key={event.occurrence_key}
              selectedEvent={selectedEvent}
              onSelect={onSelect}
              thumbnail={thumbnail}
            />
          );
        })}
      </Box>
      <Divider orientation="vertical" flexItem />
      {selectedEvent ? (
        <EventsDetail
          event={selectedEvent}
          images={data?.objects || []}
          isMobile={isMobile}
        />
      ) : (
        <Typography variant="body1">Select an event to see details</Typography>
      )}
    </Box>
  );
}

function EventsDetail({ event, images, isMobile }: EventsDetailProps) {
  const selectedImage: Image =
    images.filter((img) => img.content_key === "evnt_" + event.id)[0] ?? null;
  const repeats = describeRule(event.recurrence, event.start_datetime);
  return (
    <Box
      sx={{
        alignItems: "center",
        width: "100%",
        maxHeight: "350px",
        padding: 2,
      }}
    >
      {!isMobile && <Typography variant="h5">{event.title}</Typography>}
      {selectedImage && (
        <Box
          component="img"
          width={200}
          height={200}
          src={selectedImage?.src}
          alt={selectedImage?.alt}
        />
      )}
      <Typography variant="body1" sx={{ pb: 2 }}>
        {formatDT(event.start_datetime, event.all_day)}
        {event.end_datetime &&
          ` - ${formatDT(event.end_datetime, event.all_day)}`}
      </Typography>
      {repeats && (
        <Typography variant="body2" color="text.secondary" sx={{ pb: 2 }}>
          {repeats}
        </Typography>
      )}
      <Typography variant="body1">{event.description}</Typography>
    </Box>
  );
}
