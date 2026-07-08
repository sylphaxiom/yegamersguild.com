# Test Suite Documentation

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Tests run against the local dev server (`localhost:5173`) which in turn calls the real API at `api.sylphaxiom.com`.

---

## Fresh Checkout / First-Time Setup

`tests/auth.json` is gitignored and will not exist on a fresh clone. Without it, all admin tests fail immediately. Run auth-setup once before anything else:

```bash
npx playwright test --project=auth-setup
```

This navigates to `/admin`, follows the Auth0 redirect, logs in using your `.env` credentials, and saves the session to `tests/auth.json`. All subsequent runs (including from the VS Code extension) will reuse that file.

> **You only need to do this once per machine.** Re-run it if your session expires or you get auth errors in admin tests.

---

## Running Tests

```bash
# Run all tests
npx playwright test

# Run only public page tests (no auth required)
npx playwright test --project=public

# Run only admin tests (requires auth.json — see above)
npx playwright test --project=admin

# Open the HTML report after a run
npx playwright show-report
```

---

## Auth Setup

Admin tests require you to log in once so Playwright can save the session.

1. Create a `.env` file (or set environment variables) with your admin credentials:
   ```
   TEST_ADMIN_EMAIL=your-admin-email@example.com
   TEST_ADMIN_PASSWORD=your-password
   ```

2. Run `npx playwright test --project=auth-setup` — this navigates to `/admin`, follows the Auth0 redirect, fills in your credentials, and saves the browser session to `tests/auth.json`.

3. All subsequent admin tests load that saved session and skip the login flow entirely.

> **Important:** `tests/auth.json` contains your Auth0 access tokens. It is in `.gitignore` and must never be committed to source control.

---

## Project Structure

```
tests/
  auth.setup.ts         — One-time login; saves tests/auth.json
  home.spec.ts          — Public homepage tests
  events.spec.ts        — Events calendar page tests
  accessibility.spec.ts — Axe accessibility audit
  admin.spec.ts         — Admin console navigation tests
  cms-mutations.spec.ts — CMS field save/restore tests
```

---

## Selector philosophy

All tests use Playwright's web-first selectors — `getByRole`, `getByLabel`, `getByText`, and semantic HTML element types (`h2`, `p`, `legend`). No MUI internal CSS class names (`.MuiCard-root` etc.) appear anywhere in the test suite. Those class names are MUI implementation details and would break silently on an MUI upgrade.

Where the application needed small changes to support unambiguous selectors, those changes were made as real improvements to the component's accessibility:

| Component | Change made | Test that benefits |
|-----------|-------------|-------------------|
| `About.tsx` | Added `aria-label="about"` to the article | `getByRole('article', { name: 'about' })` |
| `Header.tsx` | Added `aria-label="image ticker"` to inner marquee | `getByRole('marquee', { name: 'image ticker' })` |
| `EventsCalendar.tsx` | Added `id="calendarBox"` to the calendar container | Used to scope all calendar selectors |

---

## Test Files

### `auth.setup.ts`

**What it does:** Performs a real login through Auth0 and saves the resulting browser session (cookies + localStorage) to `tests/auth.json`.

**How it works:**
- Navigates to `/admin`, which triggers Auth0's `withAuthenticationRequired` redirect
- Waits for the URL to change to `auth.sylphaxiom.com` (the Auth0 login page)
- Step 1: fills the organization name field with `yegamersguild` and submits
- Step 2: fills `TEST_ADMIN_EMAIL` and `TEST_ADMIN_PASSWORD` from environment variables and submits
- Waits to be redirected back to `/admin`
- Calls `page.context().storageState()` to serialize all cookies and localStorage into `auth.json`

**This file runs once** before the `admin` project. All admin tests then start with the saved session already loaded, so Auth0 never appears during the test run itself.

---

### `home.spec.ts`

Tests the public-facing homepage. All content comes from the CMS API, so tests check for presence and non-emptiness rather than specific hardcoded strings.

| Test | What it checks | How |
|------|---------------|-----|
| Logo image loads | Guild logo is visible with the right src | `getByRole('img', { name: /dragon/ })` |
| Ticker images load from CMS | At least one image appears in the image ticker marquee | `getByRole('marquee', { name: 'image ticker' })` then finds `img` children |
| Header text content renders | The top ticker text line is non-empty | Waits for `<figure>` to have text content |
| Mode switch toggles theme | Clicking the mode button changes the `html` class | Checks `class` attribute before and after click with auto-retry |
| Calendar button navigates to events | Clicking "Check out our calendar of events" goes to `/events` | Clicks button, asserts URL |
| Location section visible with address | Location complementary region has a `<p>` with content | `getByRole('complementary', { name: 'location' })` |
| Hours section visible | Hours region has a `<p>` with content | `getByRole('complementary', { name: 'hours' })` |
| About section visible with bullets | About article region has a `<p>` with content | `getByRole('article', { name: 'about' })` |
| Google map is embedded | The map iframe is present | `#google-map iframe` |

---

### `events.spec.ts`

Tests the public events calendar page. Content (events) comes from the API — tests check structure and behavior rather than specific event data.

| Test | What it checks | How |
|------|---------------|-----|
| Page title is correct | Browser tab title is "Ye Gamer's Guild" | `toHaveTitle` |
| Header logo is visible | Guild logo appears on the events page | `getByRole('img', { name: /dragon/ })` |
| Calendar displays current year | Month heading contains the current year | `#calendarBox` h4 heading contains current year string |
| Day abbreviations are all visible | Sun, Mon, Tue, Wed, Thu, Fri, Sat headings present | `getByRole('heading', { name: day })` scoped to `#calendarBox` |
| Month navigation changes and restores | Clicking next changes the heading; clicking prev restores it | Captures initial text, clicks next (button index 1), asserts change, clicks prev (button index 0), asserts restored |
| Event list area renders below divider | The `<hr>` divider between calendar and list is visible | `page.locator('hr')` |

**Why button index for navigation:** The prev/next IconButtons have no aria-label and render before the day cell ButtonBases in the DOM. Within `#calendarBox`, index 0 is always prev and index 1 is always next. Blank day cells render as plain `<div>` elements (no button), so day cell buttons don't interfere with the index.

---

### `accessibility.spec.ts`

Runs [axe-core](https://github.com/dequelabs/axe-core) on the homepage and asserts zero violations.

**How it works:** `AxeBuilder({ page }).exclude('#google-map').analyze()` scans the rendered DOM for WCAG violations. The Google Maps iframe is excluded because it has known third-party accessibility issues outside our control.

**Why we wait for CMS content first:** Layout.tsx shows a loading spinner until the `content` and `images` queries resolve. If axe runs during the loading state, there is no `<main>` landmark and no `<h1>` — both legitimate violations that would be false positives. Waiting for a `<figure>` to have content confirms CMS data has loaded and the full page is rendered before scanning.

---

### `admin.spec.ts`

Tests the admin console. Split into two groups:

#### Unauthenticated group

Overrides `storageState` to an empty state so no session is active:

```ts
test.use({ storageState: { cookies: [], origins: [] } });
```

| Test | What it checks |
|------|---------------|
| Redirects to Auth0 when not authenticated | Going to `/admin` redirects to `auth.sylphaxiom.com` |

This verifies that `withAuthenticationRequired` (from Auth0) is correctly protecting the admin route.

#### Authenticated group

Uses the session saved by `auth.setup.ts`.

| Test | What it checks |
|------|---------------|
| Admin header and logo visible | Guild logo and "Admin Console" heading are present |
| All six sections listed | Header, About, Hours, Location, Quick Links, Events buttons exist |
| Selecting Header shows text editors | Two TextFields appear: Top Ticker Text, Bottom Ticker Text |
| Selecting Header shows image upload | Upload Image button appears |
| Selecting About shows bullets and image upload | Add button and Upload Image button appear |
| Selecting Hours shows day rows | Monday `<legend>` and Closed checkboxes appear |
| Selecting Location shows address editor | Editor area is visible |
| Selecting Quick Links shows links editor | Add button appears for managing link rows |
| Selecting Events shows Add Event button | "Add Event" button is visible in the events admin list |
| Selecting Events does not show preview | "Preview:" heading is absent for the Events section |
| Preview appears when section selected | "Preview:" heading is visible when Location is selected |
| Switching sections updates editor | Going from Header to Hours hides Header editor, shows Hours |

**Why `legend` is used to find the Monday row:** `getByText('Monday')` matches three elements — the HoursField `<legend>`, and two paragraph nodes in the Location preview (`Monday:` and `Monday: 3pm - 10pm`). Using `page.locator('legend').filter({ hasText: 'Monday' })` is a semantic HTML selector, not a workaround; `<legend>` is the correct element type for a fieldset label.

---

### `cms-mutations.spec.ts`

Tests that CMS fields actually save to the database and reflect back in the UI. These are the most important tests — they verify the full round-trip from form to API to preview.

> **Data safety:** Tests that modify content save the original value first and restore it after the assertion. The site is left in its original state after every test.

| Test | What it verifies |
|------|-----------------|
| Save button disabled when unchanged | The `isDirty` guard prevents accidental saves |
| StringField saves — round-trip confirmed | Edit, save via PUT, assert Save re-disables (isDirty=false after refetch) |
| BulletsField Add appends a row | Clicking Add increases Delete button count |
| Hours Closed checkbox disables spinners | Checks checkbox, asserts Open/Close spinners disabled, then restores |
| Image upload button triggers file picker | Clicking Upload Image opens the OS file dialog |
| LinksField Add appends a row | Same Delete button counting approach as BulletsField |

#### How the StringField round-trip test works

```
1. Navigate to Header section
2. Locate the field by label; navigate up to its ancestor <form> via XPath
3. Read the current value and save it as `original`
4. Fill in a timestamp-based test value (guaranteed unique even if a prior run failed)
5. Assert the field holds the test value and the Save button is now enabled (isDirty=true)
6. Click Save while simultaneously waiting for a PUT to api.sylphaxiom.com/content.php
7. Assert the PUT response was OK (200)
8. Assert the Save button becomes disabled again — proves isDirty=false, meaning
   the mutation completed, invalidateQueries fired, the refetch returned, and React
   re-rendered with the confirmed DB value
9. Restore the original value in a finally block (runs even if an assertion fails)
```

**Why ancestor XPath for the save button:** StringField renders as `<Box component="form">` containing a TextField and a Save Button. The Header section has multiple such forms. Using `field.locator('xpath=ancestor::form[1]').getByRole('button', { name: 'Save' })` navigates up from the known field to its containing form and finds that form's Save button — unambiguous and order-independent.

**Why a timestamp-based test value:** If a previous test run failed mid-way and left the test value in the database, filling with the same string would leave `isDirty=false` and the Save button would never become enabled. A unique value (`__pw_${Date.now()}__`) is always different from whatever is currently in the DB.

**Why `toHaveValue` and `toBeEnabled` come before `Promise.all`:** These two assertions confirm that the fill succeeded and isDirty is true before the save attempt starts. If either fails, the error points to the exact step that broke rather than surfacing as a cryptic `waitForResponse` timeout.

#### Why try/finally matters for data restoration

If an assertion fails mid-test, the database would be left with the test value permanently. `finally` ensures the restore runs regardless of test outcome. The restore itself is wrapped in `try/catch` so a cleanup failure doesn't replace the original test failure as the reported error.

#### How the Hours Closed checkbox test works

HoursField's Closed checkbox sets `isClosed = true` in local React state, which passes `disabled={isClosed}` to the Open and Close NumberSpinner components. This is UI-only state — the database is only updated when Save is clicked. The test can check and uncheck freely without mutations.

#### Why Delete buttons count BulletsField / LinksField rows

Both fields pass `id={contentKey}` to every TextField in their row map, so all TextFields in BulletsField share `id="about_bullets"`. `getByLabel()` resolves via the label's `for` attribute, which maps to only the first element with that ID. Each row has exactly one `<IconButton aria-label="delete">`, making Delete button count a reliable row count.

---

## Configuration (`playwright.config.ts`)

```
projects:
  auth-setup  → runs auth.setup.ts once (generates tests/auth.json)
  public      → home, events, accessibility (no storageState)
  admin       → admin, cms-mutations (depends on auth-setup, loads auth.json)
```

The `webServer` block starts `npm run dev` automatically before tests run. If the server is already running (local development), it reuses the existing instance. Environment variables are loaded via `process.loadEnvFile()` at the top of the config (Node 22 built-in — no dotenv package needed).
