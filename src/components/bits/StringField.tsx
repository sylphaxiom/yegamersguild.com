import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchContent, putContent, queryClient } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, TextField } from "@mui/material";

export interface StringFieldProps {
  label: string;
  contentKey: string;
  isPipe: boolean;
}

export default function StringField({
  label,
  contentKey,
  isPipe,
}: StringFieldProps) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const currentValue =
    content?.objects?.find((c) => c.content_key === contentKey)?.value ?? "";
  const [dbValue, setDbValue] = React.useState(currentValue);
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
  const isDirty = dbValue !== currentValue;

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        mutate(dbValue);
      }}
      sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}
    >
      <TextField
        id={contentKey}
        label={label}
        value={dbValue}
        onChange={(e) => setDbValue(e.target.value)}
        fullWidth
        multiline
        helperText={
          isPipe
            ? "Use '|' character (without surrounding spaces) to enlarge the text preceding it."
            : undefined
        }
        slotProps={{ formHelperText: { sx: { fontSize: "0.95rem" } } }}
        disabled={isPending}
      />
      <Button
        variant="contained"
        type="submit"
        color="primary"
        sx={{}}
        disabled={isPending || !isDirty}
      >
        Save
      </Button>
    </Box>
  );
}
