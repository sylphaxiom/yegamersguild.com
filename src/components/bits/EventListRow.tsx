import * as React from "react";
import { Box, ButtonBase, Divider, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { formatDT } from "../workhorse/utils";
import type { Events, Image } from "../workhorse/queries";

export interface EventListRowProps {
  event: Events;
  index: number;
  selectedEvent?: Events | null;
  onSelect?: (e: Events) => void;
  thumbnail?: Image;
}

export default function EventListRow({
  event,
  index,
  selectedEvent,
  onSelect,
  thumbnail,
}: EventListRowProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, ev: Events) => {
    e.preventDefault();
    onSelect?.(ev);
  };

  return (
    <React.Fragment key={event.id + "-frag"}>
      {index > 0 && <Divider key={event.id + "-divider"} />}
      <ButtonBase
        key={event.id + "-button"}
        onClick={(e) => handleClick(e, event)}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: 1,
        }}
      >
        <Typography key={event.id} variant="h5">
          {event.title}
        </Typography>
        {!(selectedEvent?.id === event.id) && (
          <Typography variant="body1" sx={{ pb: 2 }}>
            {formatDT(event.start_datetime, event.all_day)}
            {event.end_datetime &&
              ` - ${formatDT(event.end_datetime, event.all_day)}`}
          </Typography>
        )}
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {selectedEvent?.id === event.id ? (
            <EventIcon />
          ) : (
            thumbnail && (
              <Box
                component="img"
                width={48}
                height={48}
                src={thumbnail.src}
                alt={thumbnail.alt}
                sx={{ objectFit: "cover" }}
              />
            )
          )}
        </Box>
      </ButtonBase>
    </React.Fragment>
  );
}
