import { Box, Typography } from "@mui/material";

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
  return (
    <Box>
      <Typography variant="h6">{label}</Typography>
      <Typography variant="body1">Content Key: {contentKey}</Typography>
      <Typography variant="body2">Type: {type}</Typography>
    </Box>
  );
}
