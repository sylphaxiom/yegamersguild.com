import { Box, Divider, List, ListItemButton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";
import About from "~/components/About";
import Location from "~/components/Location";
import AddressField from "~/components/bits/AddressField";
import StringField from "~/components/bits/StringField";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import Thinking from "~/components/baubles/Thinking";
import { fetchContent } from "~/components/workhorse/queries";
import { useQuery } from "@tanstack/react-query";
import { useIsMutating } from "@tanstack/react-query";
import HoursField from "~/components/bits/HoursField";
import BulletsField from "~/components/bits/BulletsField";
import LinksField from "~/components/bits/LinksField";

interface Editor {
  key: string;
  label: string;
  type:
    | "string"
    | "bullets"
    | "pipe"
    | "hours"
    | "address"
    | "links"
    | "images";
}

interface Section {
  id: string;
  label: string;
  contentKeys: string[];
  imageKey: string | null;
  editors: Editor[];
}

function renderPreview(sectionId: string) {
  switch (sectionId) {
    case "header":
      return <Header />;
    case "about":
      return <About />;
    case "location":
    case "hours":
      return <Location preview />;
    case "links":
      return <Footer preview />;
    default:
      return null;
  }
}

export default function Console() {
  const [section, setSection] = React.useState<Section | null>(null);
  const isMutating = useIsMutating();
  const { isFetching } = useQuery({
    queryKey: ["content"],
    queryFn: () => fetchContent(),
  });
  const isRefreshing = isMutating > 0 || isFetching;
  const sections: Section[] = [
    {
      id: "header",
      label: "Header",
      contentKeys: ["header_top", "header_bottom"],
      imageKey: "ticker_images",
      editors: [
        {
          key: "header_top",
          label: "Top Ticker Text",
          type: "string",
        },
        {
          key: "header_bottom",
          label: "Bottom Ticker Text",
          type: "string",
        },
      ],
    },
    {
      id: "about",
      label: "About",
      contentKeys: ["about_header", "about_bullets", "about_blurb"],
      imageKey: "about_images",
      editors: [
        {
          key: "about_header",
          label: "Header",
          type: "string",
        },
        {
          key: "about_bullets",
          label: "Bullet Points",
          type: "bullets",
        },
        {
          key: "about_blurb",
          label: "Blurb",
          type: "pipe",
        },
      ],
    },
    {
      id: "hours",
      label: "Hours",
      contentKeys: ["hours_header", "hours_hours"],
      imageKey: null,
      editors: [
        {
          key: "hours_header",
          label: "Header",
          type: "string",
        },
        {
          key: "hours_hours",
          label: "Hours",
          type: "hours",
        },
      ],
    },
    {
      id: "location",
      label: "Location",
      contentKeys: ["location_address", "location_header", "location_blurb"],
      imageKey: null,
      editors: [
        {
          key: "location_address",
          label: "Address",
          type: "address",
        },
        {
          key: "location_header",
          label: "Header",
          type: "string",
        },
        {
          key: "location_blurb",
          label: "Blurb",
          type: "string",
        },
      ],
    },
    {
      id: "links",
      label: "Quick Links",
      contentKeys: ["quick_header", "quick_links"],
      imageKey: null,
      editors: [
        {
          key: "quick_header",
          label: "Header",
          type: "string",
        },
        {
          key: "quick_links",
          label: "Links",
          type: "links",
        },
      ],
    },
  ];
  return (
    <Grid container columns={4} sx={{ borderTop: "1px solid #ccc" }}>
      <Grid size={1} sx={{ borderRight: "1px solid #ccc" }}>
        <Typography
          variant="body1"
          component="p"
          sx={{ m: 2, fontSize: "1.25rem" }}
        >
          Select a section to edit:
        </Typography>
        <List sx={{ justifyItems: "center" }}>
          {sections.map((sec) => (
            <ListItemButton
              key={sec.id}
              selected={sec.id === section?.id}
              onClick={() => setSection(sec)}
            >
              <Typography variant="h4" component="h2">
                {sec.label}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      </Grid>
      <Grid size={3}>
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h3" component="h2">
            {section ? `Editing ${section?.label}` : "Select a section"}
          </Typography>
          <Typography variant="body1" component="p" sx={{ mt: 2 }}>
            {section
              ? `Here you will see the content and images for content keys: ${section?.contentKeys.join(", ")}`
              : "Please select a section from the left to view and edit its content."}
          </Typography>
          <Divider variant="middle" sx={{ my: 4 }} />
          {section?.editors.map((editor) => {
            switch (editor.type) {
              case "string":
              case "pipe":
                return (
                  <StringField
                    key={editor.key}
                    contentKey={editor.key}
                    label={editor.label}
                    isPipe={editor.type === "pipe"}
                  />
                );
              case "address":
                return (
                  <AddressField
                    key={editor.key}
                    contentKey={editor.key}
                    label={editor.label}
                  />
                );
              case "hours":
                return (
                  <HoursField
                    key={editor.key}
                    contentKey={editor.key}
                    label={editor.label}
                  />
                );
              case "bullets":
                return (
                  <BulletsField
                    key={editor.key}
                    label={editor.label}
                    contentKey={editor.key}
                  />
                );
              case "links":
                return (
                  <LinksField
                    key={editor.key}
                    label={editor.label}
                    contentKey={editor.key}
                  />
                );
              // etc.
            }
          })}
          {section && (
            <>
              <Typography variant="h4" component="h3" sx={{ mt: 4, mb: 2 }}>
                Preview:
              </Typography>
              <Typography variant="body1" component="p">
                Note: Changes made here will be reflected on the live site
                immediately after saving.
              </Typography>
              <Box
                sx={{
                  m: 2,
                  border: "2px dashed #ccc",
                  p: 2,
                }}
              >
                {isRefreshing ? <Thinking /> : renderPreview(section.id)}
              </Box>
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
