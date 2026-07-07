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
- **`src/components/EventsCalendar.tsx`** — calendar grid + `<EventListDisplay>` below; `useEffect` defaults to first event on today's date when month changes
- **`src/components/bits/DayCell.tsx`** — day cell with glow highlight, chip per event, ButtonBase click sets selectedEvent to events[0]
- **`src/components/EventListDisplay.tsx`** — responsive event list + detail; mobile uses Collapse, desktop uses 50/50 layout (layout styling deferred); `EventsDetail` internal component filters images by `evnt_<id>`

---

## Current State of Key Files

### `src/components/EventsCalendar.tsx`
- Owns `currentDate: Date` and `selectedEvent: Events | null`
- Filters events to current month (`monthEvents`), builds `eventsByDay: Map<number, Events[]>`
- `useEffect([month, year])` — if current month: selects first event on today's date; else clears selection
- Renders: "Shop Events" heading → calendar grid → `<Divider>` → `<EventListDisplay events={monthEvents} selectedEvent={selectedEvent} onSelect={setSelectedEvent} />`

### `src/components/EventListDisplay.tsx`
- Props: `events: Events[]`, `selectedEvent: Events | null`, `onSelect: (e: Events) => void`
- Fetches all images via `useQuery(["images"], fetchImages)`, filters client-side in `EventsDetail`
- Mobile: `Collapse` per event row; Desktop: 50/50 flex (layout styling still pending)
- Internal `EventsDetail`: filters `images` by `content_key === "evnt_" + event.id`, conditionally renders image

### `src/components/bits/DayCell.tsx`
- Props: `day: number`, `events: Events[]`, `selectedEvent: Events | null`, `onSelect`, `sxProps?`
- Highlight: `events.some(e => e.id === selectedEvent?.id)` → inset glow (`theme.palette.primary.main`)
- ButtonBase onClick: `events.length > 0 && onSelect(events[0])`
- Day number top-left, chips centered below

---

## Remaining Tasks

### Overall Project Plan

| Task | Status |
|---|---|
| `EventListDisplay.tsx` desktop 50/50 layout styling | ⏳ Pending (deferred) |
| **`EventsField.tsx`** — admin CRUD component | ⏳ Next |
| Add Events section + `"events"` editor case to `Console.tsx` | ⏳ Pending |

### EventsField Design

**File:** `src/components/bits/EventsField.tsx`  
**Props:** none (token obtained internally via `useAuth0()` → `getAccessTokenSilently()`)  
**State:** `mode: "list" | "create" | "edit"`, `editingEvent: Events | null`

**List mode** (default):
- `useQuery(["events"], fetchEvents)` — renders each event as a row: title + start date + Edit/Delete buttons
- "Add Event" button → switches to create mode

**Create mode:**
- Text fields only: `title` (required), `description`, `start_datetime` (required), `end_datetime`, `all_day` toggle
- Save → `postEvent(EventData, token)` → invalidate `["events"]` → return to list
- Cancel → return to list

**Edit mode:**
- Same fields pre-populated + `<ImageField contentKey={"evnt_" + editingEvent.id} />` below
- Save → `putEvent(Events, token)` → invalidate `["events"]` → return to list
- Cancel → return to list, clear `editingEvent`

**Delete:** `deleteEvent(id, token)` from list row → invalidate `["events"]`

### Console.tsx changes
- Add `"events"` to `Editor` type union
- Add section: `{ id: "events", label: "Events", contentKeys: [], imageKey: null, editors: [{ key: "events", label: "Events", type: "events" }] }`
- Add `case "events": return <EventsField key={editor.key} />` to editor switch
- Add `case "events": return null` to `renderPreview`

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
