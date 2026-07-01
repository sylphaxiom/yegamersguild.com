# Ye Gamer's Guild — Conversation Context

Use this file to resume the conversation on a new device. Paste it into a new Claude Code session.

---

## Project

**Ye Gamer's Guild** — game shop website  
**Working directory:** `c:\Users\image\code_projects\yegamersguild.com`  
**Current branch:** `calendar`  
**User:** Jacob Pell — experienced developer, advisory/planning role only. Claude does not write code unless explicitly asked. Never delete files — retire to `.ret/` directory instead.

---

## Tech Stack

- React 19 + TypeScript
- React Router 7.18.0 (CSR, SSR disabled)
- MUI v9
- TanStack Query v5
- Auth0 (JWT validation via CURL to `/userinfo`, no SDK)
- PHP backend — native mysqli, no Composer packages in use
- Axios for API calls

---

## What This Conversation Did

Removed the Square payment integration entirely and replaced it with an Events Calendar feature. Square files were retired to `.ret/`. The calendar has a month grid view at the top and an event list/detail view below showing events for the current month.

---

## Key Conventions Established

- **Fish header** — shared secret sent on all API requests (CSRF-like). Checked before everything else in every PHP endpoint.
- **`requireAuth()`** in `cms_procedures.php` — validates JWTs via CURL to Auth0's `/userinfo`.
- **HTTP conventions** — POST = create (no id), PUT = update (id required).
- **bind_param types** — `s`=string, `i`=integer (also used for bool/TINYINT), `b`=BLOB. PHP `bool` type hint works with `i` binding.
- **`error_log()`** — used for server-side logging in all PHP endpoints, does not affect response.
- **FormData** only for file uploads (multipart). Plain JSON objects for everything else.
- **Event images** use `content_key = "evnt_<eventId>"` in the existing `content_images` table — no new image infrastructure needed.
- **`deleteEvent`** in `EVNTDB_bucket.php` cleans up `content_images WHERE content_key = "evnt_{$id}"` before deleting the event row.
- **Query keys** — images use a single `["images"]` cache entry; filtering by `content_key` is done client-side (same pattern as `ImageField.tsx`). Event images use `content_key = "evnt_<id>"`.
- MySQL DATETIME returns as plain string `"YYYY-MM-DD HH:MM:SS"` from PHP — type hint as `string`.
- MySQL TINYINT(1) returns as `0`/`1` from `json_encode` — type as `number` in TypeScript, not `boolean`.

---

## Completed Work

### Phase 1 — DB + PHP Backend ✅
- `events` table created (id, title, description, start_datetime, end_datetime, all_day, created_at, updated_at)
- **`src/api/v1/EVNTDB_bucket.php`** — `getAllEvents()`, `putEvent()`, `updateEvent()`, `deleteEvent()` (with image cleanup)
- **`src/api/v1/events.php`** — GET (public, fish-gated), POST (create), PUT (update), DELETE — all with error_log pattern
- **`src/api/v1/content.php`** — error_log pattern applied
- **`src/api/v1/images.php`** — error_log pattern applied
- **`src/api/v1/cms_procedures.php`** — removed stale `require_once "vendor/autoload.php"`

### Frontend ✅
- Square package removed, all react-router packages updated to 7.18.0
- **`src/components/workhorse/queries.ts`** — added `EventsResponse`, `Events`, `EventData` interfaces; `fetchEvents`, `postEvent`, `putEvent`, `deleteEvent` functions
- **`src/routes.ts`** — added `route("events", "./routes/Events.tsx")`
- **`src/routes/Events.tsx`** — prefetches events, renders `<Header />` + `<EventsCalendar events={events} />`
- **`src/components/EventsCalendar.tsx`** — calendar grid + accordion (Steps 1–4 complete, Step 5 placeholder in AccordionDetails)
- **`src/components/bits/DayCell.tsx`** — day cell component with glow highlight, chip per event, ButtonBase click

---

## Current State of Key Files

### `src/components/EventsCalendar.tsx`
- Owns `currentDate: Date` (useState to new Date()) and `selectedEvent: Events | null`
- Filters events to current month (`monthEvents`)
- Builds `eventsByDay: Map<number, Events[]>` from monthEvents
- Renders calendar grid with MUI Grid (7 columns), header row (prev/month/next), day-of-week labels, DayCell per day
- Below calendar: renders `<EventListDisplay>` (see Remaining Tasks — currently still has old MUI Accordion placeholder)

### `src/components/bits/DayCell.tsx`
- Props: `day: number`, `events: Events[]`, `selectedEvent: Events | null`, `onSelect`, `sxProps?`
- Highlight: `events.some(e => e.id === selectedEvent?.id)` → inset glow using `theme.palette.primary.main`
- ButtonBase onClick: `events.length > 0 && onSelect(events[0])`
- Day number top-left (`alignSelf: "flex-start"`), chips centered below

---

## Remaining Tasks

### Overall Project Plan

| Task | Status |
|---|---|
| **EventListDisplay.tsx** — event list + detail component (see design below) | ⏳ Pending |
| Replace accordion block in `EventsCalendar.tsx` with `<EventListDisplay>` | ⏳ Pending |
| EventsField.tsx — admin CRUD component (follows StringField/ImageField pattern) | ⏳ Pending |
| Add Events section + `"events"` editor case to `Console.tsx` | ⏳ Pending |

### EventListDisplay Design

**Single component** (`src/components/bits/EventListDisplay.tsx`) that handles both mobile and desktop layouts.

**Props:** `events: Events[]`, `selectedEvent: Events | null`, `onSelect: (e: Events) => void`

**Internal `EventDetail` component** (same file, not exported):
- Props: `event: Events`, `images: Image[]`
- Filters images client-side: `images.filter(img => img.content_key === "evnt_" + event.id)`
- Renders: image (if any) → title → start/end date (formatted short, e.g. "Jun 15") → description

**`EventListDisplay` body:**
- `isMobile = useMediaQuery(theme.breakpoints.down("sm"))`
- `useQuery(["images"], fetchImages)` — single fetch, pass `objects` down to `EventDetail`
- **Mobile branch:** vertical list; each row shows title + date; `Collapse in={selectedEvent?.id === event.id}` wraps `EventDetail` below the row
- **Desktop branch:** flex row 50/50; left column is clickable rows (title + date, highlight + `ChevronRightIcon` when selected); right column shows `EventDetail` for `selectedEvent`, or a "No event selected" placeholder

**`EventsCalendar.tsx` changes needed:**
- Remove existing MUI Accordion block
- Add logic to default-select the first event on today's date when `monthEvents` changes (useEffect or derived — if today is not in current month or no events today, `selectedEvent` stays null)
- Render `<EventListDisplay events={monthEvents} selectedEvent={selectedEvent} onSelect={setSelectedEvent} />`

---

## Interfaces (from queries.ts)

```typescript
export interface Events {
    id: number;
    title: string;
    description?: string;
    start_datetime: string;   // MySQL DATETIME → plain string
    end_datetime?: string;
    all_day: number;          // TINYINT → 0 or 1, not boolean
    created_at: string;
    updated_at: string;
}

export interface EventData {  // used for POST (create) — no id/timestamps
    title: string;
    description?: string;
    start_datetime: string;
    end_datetime?: string;
    all_day: number;
}
```

---

## PHP API Summary

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `events.php` | GET | Fish only | Returns all events |
| `events.php` | POST | Fish + JWT | Creates event via `putEvent()` |
| `events.php` | PUT | Fish + JWT | Updates event via `updateEvent()` |
| `events.php` | DELETE | Fish + JWT | Deletes event + its images via `deleteEvent()` |
| `images.php` | GET | Fish only | Returns images, optionally filtered by `content_key` |
| `images.php` | POST | Fish + JWT | Uploads image file to `content_images` |
| `images.php` | PUT | Fish + JWT | Updates image metadata |
| `images.php` | DELETE | Fish + JWT | Removes image file + DB row |
