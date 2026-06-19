# Test Suite Documentation

This project uses [Playwright](https://playwright.dev/) for end-to-end testing. Tests run against the local dev server (`localhost:5173`) which in turn calls the real API at `api.sylphaxiom.com`.

## Running Tests

```bash
# Run all tests
npx playwright test

# Run only public page tests (no auth required)
npx playwright test --project=public

# Run only admin tests (requires credentials — see Auth Setup below)
npx playwright test --project=admin

# Open the HTML report after a run
npx playwright show-report
```

## Auth Setup

Admin tests require you to log in once so Playwright can save the session.

1. Create a `.env` file (or set environment variables) with your admin credentials:
   ```
   TEST_ADMIN_EMAIL=your-admin-email@example.com
   TEST_ADMIN_PASSWORD=your-password
   ```

2. The first time you run the admin project, Playwright runs `tests/auth.setup.ts` which navigates to `/admin`, follows the Auth0 redirect, fills in your credentials, and saves the browser session to `tests/auth.json`.

3. All subsequent admin tests load that saved session and skip the login flow entirely.

> **Important:** `tests/auth.json` contains your Auth0 access tokens. It is in `.gitignore` and must never be committed to source control.

---

## Project Structure

```
tests/
  auth.setup.ts        — One-time login; saves tests/auth.json
  home.spec.ts         — Public homepage tests
  shop.spec.ts         — Shop and product detail tests
  accessibility.spec.ts — Axe accessibility audit
  admin.spec.ts        — Admin console navigation tests
  cms-mutations.spec.ts — CMS field save/restore tests
```

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
| Ticker images load from CMS | At least one image appears in the marquee | Locates `role="marquee"` then finds its `img` children |
| Header text content renders | The top ticker text line is non-empty | Waits for `<figure>` to have text content |
| Mode switch toggles theme | Clicking the mode button changes the `html` class | Checks `class` attribute before and after click |
| Inventory button navigates to shop | Clicking "Check out our inventory" goes to `/shop` | Clicks button, asserts URL |
| Location section visible with address | Location complementary region has content | Finds `role="complementary"` with `aria-label="location"` |
| Hours section visible | Hours region has content | Finds `role="complementary"` with `aria-label="hours"` |
| About section visible with bullets | About article region has content | Finds `role="article"` |
| Google map is embedded | The map iframe is present | Locates `#google-map iframe` |

**Why we removed the old ticker image tests:** The original tests checked for specific `src` attributes like `guild_pathfinder.png`. These images are now stored in and served from the database, so their src paths are dynamic (hashed filenames). Testing specific src values would require knowing the exact DB-generated filenames, which defeats the purpose.

---

### `shop.spec.ts`

Tests the shop page and product detail pages. These depend on the Square catalog API.

| Test | What it checks |
|------|---------------|
| Navigates to /shop | URL resolves within 3 seconds |
| Product cards load | At least one `.MuiCard-root` becomes visible |
| Cards display name and price | Typography elements inside each card are non-empty |
| Category filter chips visible | Chip elements are present after load |
| Clicking a chip filters the grid | Card count is ≤ total; clicking again restores count |
| Available Only filter | Filtered count is ≤ unfiltered count |
| Clicking a card navigates to details | URL changes to `/shop/<id>` |
| Detail page loads | `h2` heading is visible and non-empty |
| Detail page shows description | Body text elements are non-empty |
| Back navigation returns to grid | `goBack()` returns to `/shop` with cards visible |

---

### `accessibility.spec.ts`

Runs [axe-core](https://github.com/dequelabs/axe-core) on the homepage and asserts zero violations.

**How it works:** `AxeBuilder({ page }).exclude('#google-map').analyze()` scans the rendered DOM for WCAG violations. The Google Maps iframe is excluded because it has known third-party accessibility issues outside our control.

**Why this matters:** Catches things like missing `aria-label` attributes, insufficient color contrast, and invalid ARIA roles automatically on every test run.

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
| All five sections listed | Header, About, Hours, Location, Quick Links buttons exist |
| Selecting Header shows text editors | Two TextFields appear: Top Ticker Text, Bottom Ticker Text |
| Selecting Header shows image upload | Upload Image button appears |
| Selecting About shows bullets and image upload | Add button and Upload Image button appear |
| Selecting Hours shows day rows | "Monday" text and Closed checkboxes appear |
| Selecting Location shows address editor | Editor area is visible |
| Selecting Quick Links shows links editor | Add button appears for managing link rows |
| Preview appears when section selected | "Preview:" heading is visible |
| Switching sections updates editor | Going from Header to Hours hides Header editor, shows Hours |

---

### `cms-mutations.spec.ts`

Tests that CMS fields actually save to the database and reflect back in the UI. These are the most important tests — they verify the full round-trip from form to API to preview.

> **Data safety:** Tests that modify content save the original value first and restore it after the assertion. The site is left in its original state after every test.

| Test | What it verifies |
|------|-----------------|
| Save button disabled when unchanged | The `isDirty` guard prevents accidental saves |
| StringField saves — round-trip confirmed | Edit, save via PUT, assert Save re-disables (isDirty=false after refetch) |
| BulletsField Add appends a row | Clicking Add increases Delete button count (not TextField count — duplicate IDs make that unreliable) |
| Hours Closed checkbox disables spinners | Ensures unchecked first, checks it, asserts Open/Close spinners are disabled |
| Image upload button triggers file picker | Clicking Upload Image opens the OS file dialog |
| LinksField Add appends a row | Same Delete button counting approach as BulletsField |

#### How the StringField round-trip test works

```
1. Navigate to Header section
2. Scope the form to the one containing "Top Ticker Text" (avoids matching sibling forms)
3. Read the current value and save it
4. Fill in "CMS Test Value"
5. Click Save while simultaneously waiting for a PUT response from /api/v1/content.php
6. Assert the PUT response was OK (200)
7. Assert the Save button becomes disabled again — this proves isDirty=false, meaning
   the mutation completed, invalidateQueries fired, the refetch returned, and React
   re-rendered with the confirmed DB value
8. Restore the original value in a finally block (runs even if an assertion fails)
```

The key insight: waiting for `saveBtn` to be disabled is a precise, state-based signal that the full round-trip (PUT → refetch → render) completed. A `waitForTimeout` would be both slower and less reliable.

#### Why try/finally matters for data restoration

If the assertion at step 7 fails (e.g., the mutation errored), the test would throw before reaching the restore code. Without `try/finally`, the database would be left with "CMS Test Value" permanently. With `finally`, the restore always runs.

#### How the Hours Closed checkbox test works

HoursField's Closed checkbox sets `start: 0` and `end: 0` in local React state, which causes `isClosed = true` and passes `disabled={isClosed}` to both NumberSpinner components. This is UI-only — there is a separate Save button that must be clicked to persist, so the test can check and uncheck freely without mutating the database.

The test always runs regardless of whether Monday happens to be closed in the DB, by explicitly unchecking first if needed, then checking and asserting, then restoring.

#### Why Delete buttons are used to count BulletsField / LinksField rows

Both BulletsField and LinksField pass `id={contentKey}` to every TextField in their map. This means all TextFields in BulletsField share `id="about_bullets"`, and browsers resolve duplicate IDs by returning only the first match. Playwright's `getByLabel` uses the label's `for` attribute to find the input, so it would return at most 1 element regardless of row count.

Each row does have a unique, reliable marker: one `<IconButton aria-label="delete">`. Counting `getByLabel('delete')` gives the true row count.

---

## Configuration (`playwright.config.ts`)

```
projects:
  auth-setup  → runs auth.setup.ts once
  public      → home, shop, accessibility (no storageState)
  admin       → admin, cms-mutations (depends on auth-setup, loads auth.json)
```

The `webServer` block starts `npm run dev` automatically before tests run. If the server is already running (local development), it reuses the existing instance.
