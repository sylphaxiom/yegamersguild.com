import * as React from "react";
import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { RecurrenceFreq, RecurrenceRule } from "../workhorse/queries";
import {
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  describeRule,
  isLastWeekdayOfMonth,
  nthWeekdayOfMonth,
} from "../workhorse/recurrence";

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];
const UNIT: Record<RecurrenceFreq, [string, string]> = {
  daily: ["day", "days"],
  weekly: ["week", "weeks"],
  monthly: ["month", "months"],
};

export interface RecurrenceFieldProps {
  /** Current rule, or null for a one-time event. */
  value: RecurrenceRule | null;
  onChange: (rule: RecurrenceRule | null) => void;
  /** The event's start, as the datetime-local input value ("YYYY-MM-DDTHH:MM"). */
  startDT: string;
  disabled?: boolean;
}

export default function RecurrenceField({
  value,
  onChange,
  startDT,
  disabled,
}: RecurrenceFieldProps) {
  const [skipDate, setSkipDate] = React.useState("");
  const start = new Date(startDT);
  const validStart = !isNaN(start.getTime());
  const startDow = validStart ? start.getDay() : 0;

  const update = (patch: Partial<RecurrenceRule>) =>
    value && onChange({ ...value, ...patch });

  // If the start date moves so the chosen monthly option no longer applies
  // (e.g. "last Friday" but the new date isn't the last Friday), fall back.
  React.useEffect(() => {
    if (!value || value.freq !== "monthly" || !validStart) return;
    if (value.monthly_mode === "last_weekday" && !isLastWeekdayOfMonth(start)) {
      update({ monthly_mode: "day_of_month" });
    } else if (value.monthly_mode === "nth_weekday" && nthWeekdayOfMonth(start) > 4) {
      update({ monthly_mode: "last_weekday" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDT, value?.freq, value?.monthly_mode]);

  const handleFreq = (freq: RecurrenceFreq | "none") => {
    if (freq === "none") return onChange(null);
    onChange({
      freq,
      interval: value?.interval ?? 1,
      byweekday: freq === "weekly" ? (value?.byweekday ?? [startDow]) : undefined,
      monthly_mode: freq === "monthly" ? (value?.monthly_mode ?? "day_of_month") : undefined,
      until: value?.until,
      exdates: value?.exdates,
    });
  };

  const summary = value
    ? describeRule(value, startDT.replace("T", " ") + ":00")
    : null;

  return (
    <Grid container spacing={2} sx={{ width: "100%" }}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel id="eventRepeatLabel">Repeats</InputLabel>
          <Select
            labelId="eventRepeatLabel"
            id="eventRepeat"
            label="Repeats"
            value={value?.freq ?? "none"}
            onChange={(e) => handleFreq(e.target.value as RecurrenceFreq | "none")}
          >
            <MenuItem value="none">Does not repeat</MenuItem>
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      {value && (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id="eventRepeatInterval"
              type="number"
              label={`Every how many ${UNIT[value.freq][1]}?`}
              value={value.interval}
              onChange={(e) =>
                update({ interval: Math.max(1, Math.floor(Number(e.target.value) || 1)) })
              }
              slotProps={{ htmlInput: { min: 1, max: 99 } }}
              fullWidth
              disabled={disabled}
            />
          </Grid>

          {value.freq === "weekly" && (
            <Grid size={12}>
              <FormLabel sx={{ display: "block", mb: 1 }}>On these days</FormLabel>
              <ToggleButtonGroup
                value={value.byweekday ?? [startDow]}
                onChange={(_, days: number[]) =>
                  // Never allow an empty selection.
                  days.length > 0 && update({ byweekday: [...days].sort() })
                }
                aria-label="Days of the week"
                size="small"
                disabled={disabled}
                sx={{ flexWrap: "wrap" }}
              >
                {WEEKDAY_SHORT.map((label, i) => (
                  <ToggleButton key={label} value={i} aria-label={WEEKDAY_LONG[i]}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          )}

          {value.freq === "monthly" && validStart && (
            <Grid size={12}>
              <FormControl disabled={disabled}>
                <FormLabel id="eventMonthlyModeLabel">Repeat on</FormLabel>
                <RadioGroup
                  aria-labelledby="eventMonthlyModeLabel"
                  value={value.monthly_mode ?? "day_of_month"}
                  onChange={(e) =>
                    update({
                      monthly_mode: e.target.value as RecurrenceRule["monthly_mode"],
                    })
                  }
                >
                  <FormControlLabel
                    value="day_of_month"
                    control={<Radio />}
                    label={`Day ${start.getDate()} of the month`}
                  />
                  {nthWeekdayOfMonth(start) <= 4 && (
                    <FormControlLabel
                      value="nth_weekday"
                      control={<Radio />}
                      label={`The ${ORDINALS[nthWeekdayOfMonth(start) - 1]} ${WEEKDAY_LONG[startDow]}`}
                    />
                  )}
                  {isLastWeekdayOfMonth(start) && (
                    <FormControlLabel
                      value="last_weekday"
                      control={<Radio />}
                      label={`The last ${WEEKDAY_LONG[startDow]}`}
                    />
                  )}
                </RadioGroup>
              </FormControl>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              id="eventRepeatUntil"
              type="date"
              label="Ends on (leave blank to repeat forever)"
              value={value.until ?? ""}
              onChange={(e) => update({ until: e.target.value || undefined })}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
              disabled={disabled}
            />
          </Grid>

          <Grid size={12}>
            <FormLabel sx={{ display: "block", mb: 1 }}>
              Skip dates (holidays, cancellations)
            </FormLabel>
            <Grid container spacing={1} sx={{ alignItems: "center" }}>
              <TextField
                id="eventSkipDate"
                type="date"
                size="small"
                value={skipDate}
                onChange={(e) => setSkipDate(e.target.value)}
                disabled={disabled}
                slotProps={{ htmlInput: { "aria-label": "Date to skip" } }}
              />
              <Button
                type="button"
                variant="outlined"
                disabled={disabled || !skipDate}
                onClick={() => {
                  const set = new Set(value.exdates ?? []);
                  set.add(skipDate);
                  update({ exdates: [...set].sort() });
                  setSkipDate("");
                }}
              >
                Skip date
              </Button>
              {(value.exdates ?? []).map((d) => (
                <Chip
                  key={d}
                  label={d}
                  disabled={disabled}
                  onDelete={() => {
                    const rest = (value.exdates ?? []).filter((x) => x !== d);
                    update({ exdates: rest.length ? rest : undefined });
                  }}
                />
              ))}
            </Grid>
          </Grid>

          {summary && (
            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" id="eventRepeatSummary">
                {summary}
              </Typography>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
}
