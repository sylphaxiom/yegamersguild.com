import * as React from "react";
import Box from "@mui/material/Box";
import type { Events } from "./workhorse/queries";
import Grid from "@mui/material/Grid";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import IconButton from "@mui/material/IconButton";
import { Divider, Typography } from "@mui/material";
import DayCell from "./bits/DayCell";
import EventListDisplay from "./layouts/EventListDisplay";

export interface EventsProps {
  events: Events[];
}

export default function EventsCalendar({ events }: EventsProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState<Events | null>(null);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPrev = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const goToNext = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthEvents = events.filter((event) => {
    const d = new Date(event.start_datetime);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const eventsByDay = new Map<number, Events[]>();
  for (const event of monthEvents) {
    const day = new Date(event.start_datetime).getDate();
    eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), event]);
  }
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const total = firstDayOfWeek + daysInMonth;
  const trailingBlanks = (7 - (total % 7)) % 7;
  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ...Array(trailingBlanks).fill(null),
  ];

  React.useEffect(() => {
    const today = new Date();
    if (today.getMonth() === month && today.getFullYear() === year) {
      const todayEvents = eventsByDay.get(today.getDate()) ?? [];
      setSelectedEvent(todayEvents[0] ?? null);
    } else {
      setSelectedEvent(null);
    }
  }, [month, year]);

  return (
    <>
      <Typography variant="h3" sx={{ textAlign: "center", mb: 4 }}>
        Shop Events
      </Typography>
      <Box
        sx={{ border: "2px solid", borderColor: "text.primary" }}
        id="calendarBox"
      >
        <Grid
          size={12}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <IconButton onClick={goToPrev}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="h4">
            {currentDate.toLocaleString("default", { month: "long" }) +
              " " +
              currentDate.getFullYear()}
          </Typography>
          <IconButton onClick={goToNext}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Grid>
        <Grid
          container
          columns={7}
          sx={{
            display: "flex",
            textAlign: "center",
          }}
        >
          {weekDays.map((wkday) => (
            <Grid size={1} key={wkday}>
              <Typography
                sx={{
                  border: "2px solid",
                  borderColor: "text.primary",
                  borderWidth: "2px 1px 1px 1px",
                }}
                variant="h5"
              >
                {wkday}
              </Typography>
            </Grid>
          ))}
          {cells.map((day, i) =>
            day === null ? (
              <Grid
                size={1}
                key={i}
                sx={{
                  aspectRatio: 1,
                  border: "1px solid",
                  borderColor: "text.primary",
                }}
              />
            ) : (
              <DayCell
                key={i}
                day={day}
                events={eventsByDay.get(day) ?? []}
                selectedEvent={selectedEvent}
                onSelect={setSelectedEvent}
                sxProps={{
                  aspectRatio: 1,
                  border: "1px solid",
                  borderColor: "text.primary",
                }}
              />
            ),
          )}
        </Grid>
      </Box>
      <Divider variant="fullWidth" sx={{ my: 4 }} />
      <EventListDisplay
        events={monthEvents}
        selectedEvent={selectedEvent}
        onSelect={setSelectedEvent}
      />
    </>
  );
}
