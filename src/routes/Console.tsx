import { Box, Divider, List, ListItemButton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import * as React from "react";
import AddressField from "~/components/bits/AddressField";
import StringField from "~/components/bits/StringField";

interface Editor {
  key: string;
  label: string;
  type: "string" | "bullets" | "pipe" | "hours" | "address" | "links";
}

interface Section {
  id: string;
  label: string;
  contentKeys: string[];
  imageKey: string | null;
  editors: Editor[];
}

export default function Console() {
  const [section, setSection] = React.useState<Section | null>(null);
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
              // etc.
            }
          })}
        </Box>
      </Grid>
    </Grid>
  );
}
