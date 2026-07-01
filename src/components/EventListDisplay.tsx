import Box from "@mui/material/Box";
import { fetchImages, type Events, type Image } from "./workhorse/queries";
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

interface EventsListProps {
    events: Events[];
    selectedEvent: Events | null;
    onSelect: (e: Events) => void;
}

interface EventsDetailProps {
    event: Events;
    images: Image[];
}

export default function EventListDisplay({ events, selectedEvent, onSelect }: EventsListProps) {
    const {data} = useQuery({queryKey: ["images"], queryFn: fetchImages});
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        
    );
}

function EventsDetail({ event, images }: EventsDetailProps) {
    const selectedImage: Image = images.filter(img => img.content_key === "evnt_" + event.id)[0] ?? null;
    return (
        <Box sx={{ alignItems:"center", width:"100%", maxHeight:"350px"}}>
            <Typography variant="h5">{event.title}</Typography>
            <Box component="img" width={200} height={200} src={selectedImage?.src} alt={selectedImage?.alt} />
            <Typography variant="body1">{event.description}</Typography>
        </Box>
    )
}