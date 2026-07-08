import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  deleteEvent,
  fetchEvents,
  fetchImages,
  queryClient,
  type Events,
} from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventsCreate from "../bits/EventsCreate";
import EventsEdit from "../bits/EventsEdit";
import { formatDT } from "../workhorse/utils";

export default function EventsAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [mode, setMode] = React.useState<"list" | "create" | "edit">("list");
  const [editingEvent, setEditingEvent] = React.useState<Events | null>(null);
  const { data } = useQuery({
    queryKey: ["events"],
    queryFn: () => fetchEvents(),
  });
  const events = data?.objects ?? [];
  const { data: images } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });

  const { mutate: remove } = useMutation({
    mutationFn: async (id: number) => {
      const token = await getAccessTokenSilently();
      return deleteEvent(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        alignItems: "center",
        py: 2,
      }}
    >
      {mode === "list" && (
        <>
          <Button
            variant="contained"
            type="button"
            color="primary"
            sx={{}}
            onClick={() => {
              setMode("create");
            }}
          >
            Add Event
          </Button>
          {events.map((evnt) => {
            const thumbnail = images?.objects?.find(
              (img) => img.content_key === "evnt_" + evnt?.id,
            );
            return (
              <Box
                key={evnt.id}
                sx={{ display: "flex", gap: 1, alignItems: "center" }}
              >
                {thumbnail ? (
                  <Box
                    component="img"
                    width={48}
                    height={48}
                    src={thumbnail.src}
                    alt={thumbnail.alt}
                  />
                ) : (
                  <Box sx={{ width: 48, height: 48, flexShrink: 0 }} />
                )}
                <Typography key={evnt.id + "_title"} variant="body1">
                  {evnt.title}
                </Typography>
                <Typography
                  key={evnt.id + "_start"}
                  variant="body1"
                  color="text.secondary"
                >
                  {formatDT(evnt.start_datetime, evnt.all_day)}
                  {evnt.end_datetime &&
                    ` - ${formatDT(evnt.end_datetime, evnt.all_day)}`}
                </Typography>
                <IconButton
                  key={evnt.id + "_edit"}
                  aria-label="Down"
                  onClick={() => {
                    setMode("edit");
                    setEditingEvent(evnt);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  key={evnt.id + "_delete"}
                  aria-label="Delete"
                  onClick={() => remove(evnt.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            );
          })}
        </>
      )}
      {mode === "create" && <EventsCreate onDone={() => setMode("list")} />}
      {mode === "edit" && editingEvent && (
        <EventsEdit
          event={editingEvent}
          onDone={() => {
            setMode("list");
            setEditingEvent(null);
          }}
        />
      )}
    </Box>
  );
}
