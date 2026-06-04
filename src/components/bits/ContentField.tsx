import { Box, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchContent,
  fetchImages,
  putContent,
  queryClient,
} from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";

export interface ContentFieldProps {
  contentKey: string;
  label: string;
  type: string;
}

export default function ContentField({
  contentKey,
  label,
  type,
}: ContentFieldProps) {
  const { getAccessTokenSilently } = useAuth0();

  // Grab content and images data from the server
  const { data: allImages } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const { data: content } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });

  // Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (value: string) => {
      const token = await getAccessTokenSilently();
      return putContent(contentKey, value, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });

  // Switch on the type
  switch (type) {
    case "string":
      break;
    case "pipe":
      break;
    case "address":
      break;
    case "hours":
      break;
    case "links":
      break;
    case "bullets":
      break;
    default:
      console.log("Default case reached for type: %s", type);
  }

  return (
    <Box>
      <Typography variant="h6">{label}</Typography>
      <Typography variant="body1">Content Key: {contentKey}</Typography>
      <Typography variant="body2">Type: {type}</Typography>
    </Box>
  );
}
