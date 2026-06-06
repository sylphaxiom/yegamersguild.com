import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchContent, putContent, queryClient } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Select,
} from "@mui/material";
import type { Hours } from "../Location";
import NumberSpinner from "./NumberSpinner";

export interface HoursFieldProps {
  label: string;
  contentKey: string;
}

export default function HoursField({ label, contentKey }: HoursFieldProps) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const currentValue =
    content?.objects?.find((c) => c.content_key === contentKey)?.value ?? "";
  const parsedValue = currentValue ? (JSON.parse(currentValue) as Hours[]) : [];
  const [dbValue, setDbValue] = React.useState<Hours[]>(parsedValue);
  // Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: string) => {
      const token = await getAccessTokenSilently();
      return putContent(contentKey, value, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
  const isDirty = JSON.stringify(dbValue) !== currentValue;

  return (
    <Grid
      component="form"
      container
      onSubmit={(e) => {
        e.preventDefault();
        mutate(JSON.stringify(dbValue));
      }}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        alignItems: "start",
        py: 2,
      }}
    >
      {dbValue.map((val) => {
        const isClosed = val.start === 0 && val.end === 0;
        return (
          <Grid
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
            key={val.day}
          >
            <FormLabel component="legend" sx={{ width: 90, mt: "1.5em" }}>
              {val.day}
            </FormLabel>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
              <NumberSpinner
                id={contentKey}
                label={"Open"}
                size="small"
                sx={{ width: 150 }}
                value={val.start}
                onValueChange={(value) => {
                  const newStart = value ?? 0;
                  setDbValue(
                    dbValue.map((v) =>
                      v.day === val.day ? { ...v, start: newStart } : v,
                    ),
                  );
                }}
                disabled={isPending || isClosed}
              />
              <Select
                labelId="sap-select-label"
                id="sap-select"
                size="small"
                sx={{ width: 100 }}
                value={val.sap}
                label="am/pm"
                onChange={(e) => {
                  {
                    const newSap = e.target.value;
                    setDbValue(
                      dbValue.map((v) =>
                        v.day === val.day ? { ...v, sap: newSap } : v,
                      ),
                    );
                  }
                }}
                disabled={isPending || isClosed}
              >
                <MenuItem value={"am"}>am</MenuItem>
                <MenuItem value={"pm"}>pm</MenuItem>
                <MenuItem value={"noon"}>noon</MenuItem>
              </Select>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.5 }}>
              <NumberSpinner
                id={contentKey}
                label={"Close"}
                size="small"
                sx={{ width: 150 }}
                value={val.end}
                onValueChange={(value) => {
                  const newEnd = value ?? 0;
                  setDbValue(
                    dbValue.map((v) =>
                      v.day === val.day ? { ...v, end: newEnd } : v,
                    ),
                  );
                }}
                disabled={isPending || isClosed}
              />
              <Select
                labelId="eap-select-label"
                id="eap-select"
                size="small"
                sx={{ width: 100 }}
                value={val.eap}
                label="am/pm"
                onChange={(e) => {
                  {
                    const newEap = e.target.value;
                    setDbValue(
                      dbValue.map((v) =>
                        v.day === val.day ? { ...v, eap: newEap } : v,
                      ),
                    );
                  }
                }}
                disabled={isPending || isClosed}
              >
                <MenuItem value={"am"}>am</MenuItem>
                <MenuItem value={"pm"}>pm</MenuItem>
                <MenuItem value={"noon"}>noon</MenuItem>
              </Select>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isClosed}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setDbValue(
                        dbValue.map((v) =>
                          v.day === val.day ? { ...v, start: 0, end: 0 } : v,
                        ),
                      );
                    } else {
                      setDbValue(
                        dbValue.map((v) =>
                          v.day === val.day ? { ...v, start: 12, end: 9 } : v,
                        ),
                      );
                    }
                  }}
                />
              }
              label="Closed"
            />
          </Grid>
        );
      })}
      <Grid sx={{ alignSelf: "center" }}>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          sx={{}}
          disabled={isPending || !isDirty}
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
}
