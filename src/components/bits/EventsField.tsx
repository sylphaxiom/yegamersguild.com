import * as React from "react";
import type { EventData } from "../workhorse/queries";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
} from "@mui/material";
import ImageField from "./ImageField";

export interface EventsFieldProps {
  initialValues?: Partial<EventData>;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>, data: EventData) => void;
  onCancel: () => void;
  isPending: boolean;
  imageKey?: string;
}

export default function EventsField({
  initialValues,
  onSubmit,
  onCancel,
  isPending,
  imageKey,
}: EventsFieldProps) {
  const [title, setTitle] = React.useState<string>(initialValues?.title ?? "");
  const [allDay, setAllDay] = React.useState<number>(
    initialValues?.all_day ?? 0,
  );
  const [description, setDescription] = React.useState<string | undefined>(
    initialValues?.description,
  );
  const [startDT, setStartDT] = React.useState<string>(() => {
    if (initialValues?.start_datetime) {
      return initialValues.start_datetime.replace(" ", "T").slice(0, 16);
    }
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  const [endDT, setEndDT] = React.useState<string | undefined>(
    initialValues?.end_datetime
      ? initialValues.end_datetime.replace(" ", "T").slice(0, 16)
      : undefined,
  );

  return (
    <Grid
      component="form"
      container
      spacing={2}
      onSubmit={(e) =>
        onSubmit(e, {
          title: title,
          description: description,
          start_datetime: startDT.replace("T", " ") + ":00",
          end_datetime: endDT ? endDT.replace("T", " ") + ":00" : undefined,
          all_day: allDay,
        })
      }
      sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}
    >
      <Grid size={9}>
        <TextField
          id="eventTitle"
          label="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          disabled={isPending}
        />
      </Grid>
      <Grid size={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={allDay === 1}
              onChange={(e) => setAllDay(e.target.checked ? 1 : 0)}
            />
          }
          label="All Day"
          disabled={isPending}
        />
      </Grid>
      <Grid size={12}>
        <TextField
          id="eventDescription"
          label="description"
          value={description ?? ""}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          disabled={isPending}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          type="datetime-local"
          id="eventStartDT"
          value={startDT}
          onChange={(e) => setStartDT(e.target.value)}
          fullWidth
          disabled={isPending}
        />
      </Grid>
      <Grid size={6}>
        <TextField
          type="datetime-local"
          id="eventEndDT"
          value={endDT ?? ""}
          onChange={(e) => setEndDT(e.target.value)}
          fullWidth
          disabled={isPending || allDay === 1}
        />
      </Grid>
      <Grid size={12}>{imageKey && <ImageField contentKey={imageKey} />}</Grid>
      <Grid size={6}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          sx={{}}
          disabled={isPending}
        >
          Save
        </Button>
      </Grid>
      <Grid size={6}>
        <Button
          variant="contained"
          type="button"
          color="secondary"
          sx={{}}
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
      </Grid>
    </Grid>
  );
}
