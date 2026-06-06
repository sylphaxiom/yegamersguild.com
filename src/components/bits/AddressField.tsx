import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchContent, putContent, queryClient } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, Grid, TextField } from "@mui/material";
import type { Address } from "../Location";

export interface AddressFieldProps {
  label: string;
  contentKey: string;
}

export default function AddressField({ label, contentKey }: AddressFieldProps) {
  const { getAccessTokenSilently } = useAuth0();

  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const currentValue =
    content?.objects?.find((c) => c.content_key === contentKey)?.value ?? "";
  const parsedValue = JSON.parse(currentValue) as Address;
  const [dbValue, setDbValue] = React.useState<Address>(parsedValue);
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
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        mutate(JSON.stringify(dbValue));
      }}
      sx={{ display: "flex", gap: 2, alignItems: "center", py: 2 }}
    >
      <Grid>
        <TextField
          id={contentKey}
          label={label + " Line 1"}
          value={dbValue.line1}
          sx={{ mb: 2 }}
          onChange={(e) => setDbValue({ ...dbValue, line1: e.target.value })}
          fullWidth
          disabled={isPending}
        />
        <TextField
          id={contentKey}
          label={label + " Line 2"}
          value={dbValue.line2}
          sx={{ mb: 2 }}
          onChange={(e) => setDbValue({ ...dbValue, line2: e.target.value })}
          fullWidth
          disabled={isPending}
        />
        <TextField
          id={contentKey}
          label={label + " Line 3"}
          value={dbValue.line3}
          sx={{ mb: 2 }}
          onChange={(e) => setDbValue({ ...dbValue, line3: e.target.value })}
          fullWidth
          disabled={isPending}
        />
      </Grid>
      <Grid>
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
    </Box>
  );
}
