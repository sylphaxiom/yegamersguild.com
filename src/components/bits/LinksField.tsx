import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchContent, putContent, queryClient } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { QuickLink } from "../Footer";
import { iconMap } from "../workhorse/mappings";
import DeleteIcon from "@mui/icons-material/Delete";

export interface LinksFieldProps {
  label: string;
  contentKey: string;
}

export default function LinksField({ label, contentKey }: LinksFieldProps) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const currentValue =
    content?.objects?.find((c) => c.content_key === contentKey)?.value ?? "";
  const parsedValue = currentValue
    ? (JSON.parse(currentValue) as QuickLink[])
    : [];
  const [dbValue, setDbValue] = React.useState<QuickLink[]>(parsedValue);
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
      {dbValue.map((val, index) => {
        return (
          <Grid
            sx={{ display: "flex", alignItems: "center", gap: 1, width: 1 }}
            key={index}
          >
            <Box sx={{ display: "flex", flex: 1, gap: 0.5 }}>
              <IconButton
                aria-label="delete"
                onClick={() =>
                  setDbValue(dbValue.filter((_, i) => i !== index))
                }
              >
                <DeleteIcon color="primary" />
              </IconButton>
              <Select
                labelId="icon-select-label"
                id="icon-select"
                size="small"
                value={val.icon}
                label="Icon"
                onChange={(e) => {
                  {
                    const newIcon = e.target.value;
                    setDbValue(
                      dbValue.map((v, i) =>
                        i === index ? { ...v, icon: newIcon } : v,
                      ),
                    );
                  }
                }}
              >
                {Object.entries(iconMap).map(([key, icon]) => (
                  <MenuItem value={key} key={key}>
                    {icon}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                id={contentKey}
                label={label}
                value={val.text}
                onChange={(e) => {
                  setDbValue(
                    dbValue.map((v, i) =>
                      i === index ? { ...v, text: e.target.value } : v,
                    ),
                  );
                }}
                fullWidth
                disabled={isPending}
              />
              <TextField
                id={contentKey + "-href"}
                label={label}
                value={val.href}
                onChange={(e) => {
                  setDbValue(
                    dbValue.map((v, i) =>
                      i === index ? { ...v, href: e.target.value } : v,
                    ),
                  );
                }}
                fullWidth
                disabled={isPending}
              />
            </Box>
          </Grid>
        );
      })}
      <Grid sx={{ alignSelf: "center" }}>
        <Typography variant="body2">
          {
            'For local site links use relative paths ("/shop" -> shop page, "/" -> home page, etc.)'
          }
        </Typography>
        <Typography variant="body2" sx={{ pb: 2 }}>
          {"For public site links use absolute paths (https://google.com)"}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mx: 1 }}
          type="button"
          onClick={() =>
            setDbValue([...dbValue, { icon: "Sparkles", text: "", href: "" }])
          }
          disabled={isPending}
        >
          Add
        </Button>
        <Button
          variant="contained"
          type="submit"
          color="primary"
          sx={{ mx: 1 }}
          disabled={isPending || !isDirty}
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
}
