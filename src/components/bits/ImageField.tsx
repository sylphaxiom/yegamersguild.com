import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  fetchImages,
  putImage,
  postImage,
  deleteImage,
  queryClient,
  type Image,
} from "../workhorse/queries";
import { useAuth0 } from "@auth0/auth0-react";
import { Box, Button, ButtonGroup, IconButton, TextField } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

interface ImageRowProps {
  image: Image;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onDelete: () => void;
  onReorder: (dir: "up" | "down") => void;
}

export interface ImageFieldProps {
  contentKey: string;
}

function ImageRow({
  image,
  index,
  isFirst,
  isLast,
  onDelete,
  onReorder,
}: ImageRowProps) {
  const [altText, setAltText] = React.useState<string>(image.alt);
  const { getAccessTokenSilently } = useAuth0();
  const { mutate } = useMutation({
    mutationFn: async (value: string) => {
      const token = await getAccessTokenSilently();
      return putImage(
        image.id,
        { alt: value, display_order: image.display_order },
        token,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
    },
  });
  return (
    <>
      <Box
        component="img"
        src={image.src}
        alt={image.alt}
        sx={{
          width: 80,
          height: 80,
          objectFit: "cover",
          borderRadius: 1,
          mx: 2,
        }}
      />
      <TextField
        id={String(index)}
        label={"Alt Text"}
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        fullWidth
        helperText="This is the text that screen readers see to describe the image when it is not visible."
      />
      <ButtonGroup>
        <Button
          variant="contained"
          type="button"
          color="primary"
          sx={{}}
          onClick={(e) => {
            e.preventDefault();
            mutate(altText);
          }}
          disabled={altText === image.alt}
        >
          Save
        </Button>
        <IconButton
          aria-label="Up"
          onClick={() => onReorder("up")}
          disabled={isFirst}
        >
          <ArrowUpwardIcon />
        </IconButton>
        <IconButton
          aria-label="Down"
          onClick={() => onReorder("down")}
          disabled={isLast}
        >
          <ArrowDownwardIcon />
        </IconButton>
        <IconButton aria-label="Delete" onClick={() => onDelete()}>
          <DeleteIcon />
        </IconButton>
      </ButtonGroup>
    </>
  );
}

export default function ImageField({ contentKey }: ImageFieldProps) {
  const { getAccessTokenSilently } = useAuth0();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { data: content } = useQuery({
    queryKey: ["images"],
    queryFn: () => fetchImages(),
  });
  const images = (
    content?.objects?.filter((img) => img.content_key === contentKey) ?? []
  ).sort((a, b) => a.display_order - b.display_order);

  // Mutation
  const { mutate: upload } = useMutation({
    mutationFn: async (file: File) => {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("image", file);
      formData.append("content_key", contentKey);
      return postImage(contentKey, formData, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
  });
  const { mutate: remove } = useMutation({
    mutationFn: async (id: number) => {
      const token = await getAccessTokenSilently();
      return deleteImage(id, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
  });
  const { mutate: reorder } = useMutation({
    mutationFn: async ({ a, b }: { a: Image; b: Image }) => {
      const token = await getAccessTokenSilently();
      await putImage(
        a.id,
        { alt: a.alt, display_order: b.display_order },
        token,
      );
      await putImage(
        b.id,
        { alt: b.alt, display_order: a.display_order },
        token,
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["images"] }),
  });
  const handleReorder = (index: number, dir: "up" | "down") => {
    const neighbour = dir === "up" ? images[index - 1] : images[index + 1];
    if (!neighbour) return;
    reorder({ a: images[index], b: neighbour });
  };

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
      {images.map((img, index) => (
        <ImageRow
          key={img.shortName}
          image={img}
          index={index}
          isFirst={index === 0}
          isLast={index === images.length - 1}
          onDelete={() => remove(img.id)}
          onReorder={(dir) => handleReorder(index, dir)}
        />
      ))}
    </>
  );
}
