import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { fetchContent, putContent, queryClient } from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, TextField } from "@mui/material";

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

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        mutate(dbValue);
      }}
    >
      <TextField
        id={contentKey}
        label={label}
        value={dbValue}
        onChange={(e) => setDbValue(e.target.value)}
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending}>
        Save
      </Button>
    </Box>
  );
}

// Grab content and images data from the server
//   const { data: allImages } = useQuery({
//     queryKey: ["images"],
//     queryFn: () => fetchImages(),
//   });
//   const { data: content } = useQuery({
//     queryKey: ["content"],
//     queryFn: () => fetchContent(),
//   });

//   // Mutation
//   const { mutate, isPending } = useMutation({
//     mutationFn: async (value: string) => {
//       const token = await getAccessTokenSilently();
//       return putContent(contentKey, value, token);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["content"] });
//       queryClient.invalidateQueries({ queryKey: ["images"] });
//     },
//   });
