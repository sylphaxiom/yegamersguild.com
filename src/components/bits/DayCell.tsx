import * as React from "react";
import type { Events } from "../workhorse/queries";
import { ButtonBase, Chip, Grid, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useTheme } from "@mui/material";

interface DayCellProps {
  day: number;
  events: Events[];
  selectedEvent: Events | null;
  onSelect: React.Dispatch<React.SetStateAction<Events | null>>;
  sxProps?: SxProps<Theme>;
}

export default function DayCell({
  day,
  events,
  selectedEvent,
  onSelect,
  sxProps,
}: DayCellProps) {
  const theme = useTheme();
  let styles;

  if (events.some((e) => e.id === selectedEvent?.id)) {
    styles = {
      boxShadow: "inset 0 0 20px " + theme.palette.primary.main,
    };
  } else {
    styles = {};
  }
  const visible = events.slice(0, 2);
  const overflow = events.length - 2;

  return (
    <Grid size={1} sx={sxProps}>
      <ButtonBase
        sx={{
          ...styles,
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          overflow: "hidden",
        }}
        onClick={() => events.length > 0 && onSelect(events[0])}
      >
        <Typography variant="h5" sx={{ mx: 1, alignSelf: "flex-start" }}>
          {day}
        </Typography>
        {visible.map((event) => (
          <Chip
            size="small"
            label={event.title}
            key={event.id}
            sx={{ maxWidth: "90%" }}
          />
        ))}
        {overflow > 0 && (
          <Typography variant="caption">+{overflow} more</Typography>
        )}
      </ButtonBase>
    </Grid>
  );
}
