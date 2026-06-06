import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  fetchImages,
  putImage,
  postImage,
  deleteImage,
  queryClient,
} from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, TextField } from "@mui/material";

export interface ImageFieldProps {
  contentKey: string;
}

export default function ImageField({ contentKey }: ImageFieldProps) {
  const { getAccessTokenSilently } = useAuth0();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { data: content } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const images =
    content?.objects?.filter((img) => img.content_key === contentKey) ?? [];

  // Mutation
  const { mutate: upload } = useMutation({
    mutationFn: async (file: File) => {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("image", file);
      return postImage(contentKey, formData, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
  });

  return (
    <>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />

      <Button
        variant="contained"
        type="button"
        color="primary"
        sx={{}}
        onClick={() => fileRef.current?.click()}
      >
        Upload Image
      </Button>
    </>
  );
}
