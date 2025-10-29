
# Add-entry geolocation bug: investigation & plan

## Problem statement (bug)

Users can create an entry via the Add Entry flow and save it to Firestore, but some of those entries do not appear on the map. Root cause: the Add Entry form currently accepts free-text site/place/country input without guaranteeing it can be resolved to a valid latitude/longitude before saving. If the saved document lacks correct lat/lng (or contains ambiguous/incorrect place/country metadata), the Map page cannot display the entry.

This prompt documents the bug, analyzes the relevant code areas, and proposes a non-code implementation plan to verify and fix the flow by asking the user for better site/place/country information or by validating/auto-filling geolocation before saving.

## Goals

- Ensure every saved `entry` document includes accurate coordinates (lat/lng) so entries reliably display on the map.
- Provide clear UX: inform and guide the user when site/place/country input is insufficient or ambiguous, and offer corrections or suggestions prior to saving.
- Add automated checks and tests (unit + integration) to prevent regressions.

## Related code areas to inspect (codebase)

Check these files and modules to understand current behavior and where to implement validation and UX changes:

- frontend/src/components/EntryForm.js (or EntryForm component)
	- Handles user input for title, place, country, date, notes and likely triggers the submit action. Primary place to run validation and show inline feedback.

- frontend/src/components/EntryForm.css / EntryForm UI
	- For UI affordances (error messages, inline suggestions, map preview inside the form).

- frontend/src/firebase/geocoder.js
	- Geocoding helper(s). Determine which provider is used (Nominatim, Google, Mapbox, etc.), how results are returned (single vs multiple candidates), and any rate limits or API keys required.

- frontend/src/firebase/entriesService.js
	- The abstraction that writes entries to Firestore. Review whether it expects lat/lng fields and whether it performs any transformations or sanitization.

- frontend/src/pages/AddEntryPage.js
	- Page-level wiring between the form and services; may host a preview map component.

- frontend/src/components/Map.js or Map.clean.js
	- Map rendering logic: how entries are fetched and filtered; confirms why entries without coords are excluded or invisible.

- frontend/src/firebase/testConnection.js and frontend/src/firebase/firebase.js
	- Confirm API keys, emulator usage, or geocoder configuration (some geocoders require server-side keys).

- backend/controllers/entryController.js (or any backend write path) and backend/models/Entry.js
	- If server-side validation exists, see how the backend expects coordinates. Confirm whether writes go through backend or direct client Firestore writes.

- frontend/src/__tests__/* (EntryForm or Map tests)
	- Extend tests to cover geocoding and save/fail states.

If any of the above files are named differently in the repo (EntryForm, entriesService, geocoder), search for `EntryForm`, `entriesService`, `geocoder`, `entries` and `Map` components.

## Root-cause analysis (high-level)

- The form allows saving when required textual fields are present but does not ensure coordinates are present/accurate.
- Geocoding is currently performed (or available) elsewhere but not necessarily used as a synchronous validation step before writing to DB.
- The system lacks a user-facing flow that (a) disambiguates geocoding results, (b) requests more precise input, or (c) shows a map preview so the user can confirm location prior to saving.

## UX & validation strategies (options)

Below are several approaches (can be combined). For each, note trade-offs (implementation effort, API keys, UX friction):

1) Validate-before-save with single best-effort geocode (recommended minimal change)
	 - On submit, call the geocoder with the place + country (and any site text). If one unambiguous candidate is returned with confidence, auto-fill lat/lng and save.
	 - If geocoder returns zero candidates, block save and show an inline error asking the user to provide more details (town/city/country) or use the map to pinpoint the location.
	 - If geocoder returns multiple candidates, present a small list (or dropdown) of candidate matches for the user to pick from.

2) Autocomplete + suggestion on input (better UX)
	 - Replace free-text place/country input with an autocomplete (place search) powered by the geocoder provider. The user picks a suggestion, guaranteeing coordinates.
	 - Requires integrating an autocomplete widget and handling provider API keys and rate limiting.

3) Map-pin confirmation (visual confirmation)
	 - When user enters site/place, show a small map preview with the geocoded marker. Allow the user to drag the marker to correct it or click the map to set coordinates manually.
	 - This is helpful for ambiguous or small/localized places.

4) Country dropdown + place input (less friction than free-text)
	 - Add a country selector (prefilled by user locale) so geocoding queries include a country bias, increasing accuracy.

5) Server-side fallback geocoding
	 - If the client cannot resolve the location (or lacks API key), save a draft and enqueue a server-side job (or cloud function) to attempt geocoding and notify the user when complete. This is heavier and not recommended as the primary UX.

## Validation rules and acceptance criteria

- Required: an `entry` must have numeric `lat` and `lng` fields to be considered displayable on the map.
- The Add Entry flow must try to populate lat/lng before attempting to write to Firestore. If it cannot, the user must explicitly confirm a manual location selection or be prevented from saving.
- The UX must handle three states: success (coordinates resolved), ambiguous (multiple candidates — user chooses), and failure (no candidates — user corrects input or manually picks on the map).

## Implementation checklist (non-code, high level)

1. Inspect `EntryForm` to find submit handler and current validation points.
2. Inspect `geocoder.js` to understand API surface (search, reverse, candidate format). Confirm whether it supports country bias and whether it returns place type metadata.
3. Design the client flow (pick one or combine above UX strategies):
	 - Minimal: validate-before-save + candidate selection dialog.
	 - Better: autocomplete + map preview + drag-to-correct.
4. Add UI affordances: inline error messages, candidate dropdown, and an optional small map preview/modal.
5. Update `entriesService` to reject write attempts that have missing lat/lng (defensive programming) — return a clear error to the form.
6. Add unit tests for `EntryForm` covering: geocode success, multiple candidates, geocode failure and manual map selection.
7. Manual QA: run dev server, create entries with ambiguous names (e.g., `Springfield`), and verify map shows saved entries.

## Testing and verification plan

- Unit tests: mock geocoder responses and ensure EntryForm behavior matches acceptance criteria.
- Integration test (manual or automated): run with emulator and real geocoder (or a mocked provider) to confirm the full flow.
- E2E: create a test entry, assert it appears on the Map page with the correct popup content.

### Concrete reproduction / test instance

- Example failing input to add as a test case:
	- Site / place: "New York"
	- Country: "United States"
	- Expected: the Add Entry flow should resolve this input to coordinates (e.g., New York City lat/lng) and the saved `entry` document should include `lat` and `lng` so it appears on the Map page immediately after creation.
	- Observed failure: saving an entry with those fields produces a document that the Map page does not render (likely missing/incorrect `lat` & `lng` or mismatched field names).

Include this test case in unit/integration/E2E tests (mock geocoder to return a valid candidate for New York and also test geocoder failure modes).

## Risks and constraints

- Geocoder provider constraints (rate limits, API keys, CORS) may force server-side proxying for production keys.
- Adding autocomplete or map features increases bundle size and implementation complexity.
- UX needs to be simple: blocking saves too aggressively will frustrate users; provide sensible defaults and clear guidance.

## Suggested acceptance criteria (for the PR)

1. New tests cover geocode-success and geocode-failure flows.
2. The Add Entry form will not save an entry without lat/lng unless the user explicitly selects a manual location on the map.
3. Saved entries display on the Map page immediately after creation in a manual test.
4. Any new UI elements have accessible labels and error states.

---

Use this prompt as the source-of-truth when implementing the fix on branch `fix/add-entry-geolocation`.

## Immediate minimal code-change plan (step-by-step)

We will implement a small set of focused edits that fix the observed bug (entries saved without usable coords) and provide clear user feedback — without introducing large UI components or changing providers.

1) Fix `EntryForm` submit wiring (very small, safe change)
	- Problem: `EntryForm` currently uses the `createEntry` function from context directly unless `isEditing` is true. That means the `onSubmit` prop provided by `AddEntryPage` is ignored. This can skip page-level preprocessing and central validation.
	- Action: change the submit logic so that if an `onSubmit` prop is provided, the form calls `await onSubmit(payload)` first; otherwise fall back to `createEntry(payload)`.
	- Rationale: this is a one-line behavioral fix that restores the expected parent-driven submit flow and centralizes pre-submit handling when present.

2) Make `createEntry` fail-fast when geocoding doesn't populate coords (safe, defensive)
	- Problem: `entriesService.createEntry` attempts geocoding but silently continues and saves entries without `latitude`/`longitude` when geocoding fails. This yields documents that the Map component can't render.
	- Action: modify `createEntry` to throw an explicit error if, after its geocoding attempts, no numeric `latitude`/`longitude` are present on the new entry. The thrown error should be descriptive (e.g., `Geocoding failed: unable to resolve location for place/country; please provide more detail or pick a location on the map`).
	- Rationale: this prevents saving invalid display-less entries and surfaces the failure to the UI where we can show helpful instructions. Because we only throw when coords are missing, existing entries that already include lat/lng are unaffected.

3) Surface the geocode error in the form UI (EntryForm) with minimal UX
	- Problem: if createEntry throws, EntryForm currently catches errors and shows a generic message.
	- Action: update EntryForm's catch to recognize geocoding errors (by message or a custom error type) and show a clear, user-friendly message that explains the options: (a) add more place/country detail (city/region), (b) pick the location on a map (if a small map UI is acceptable), or (c) use an autocomplete suggestion (future improvement).
	- Rationale: minimal UX change (text error) is enough initially to stop bad writes and guide users.

4) Add one focused unit test and one manual test case
	- Unit test: mock `geocodeLocation` to throw; call `createEntry` and assert it rejects with the geocode error when no coords are present. Also test the success path when `geocodeLocation` returns coordinates.
	- Manual reproduction test: use the supplied test case (place=`New York`, country=`United States`) and verify that when the geocoder cannot resolve (or is mocked to fail), the UI shows the explicit error and the entry is not saved.

5) Optional small follow-up (non-blocking)
	- After the defensive behavior is in place and tests pass, consider adding a lightweight candidate-selection dialog in EntryForm that appears when the geocoder returns multiple results. That can be implemented later as a separate PR to keep this fix small.

## Developer notes and caveats

- Nominatim (the current geocoder) may be blocked by browser CORS/policy for direct client calls. If geocoding frequently fails in the browser, consider proxying geocoding server-side or using a provider that supports client-side autocomplete with keys.
- This minimal plan intentionally avoids adding third-party autocomplete widgets or a map-picker in this PR to keep changes small and reviewable.

Note about available tooling in this workspace:

- The VS Code workspace already has Firebase MCP and Playwright MCP servers installed and available. The coding agent can use these MCP servers to interact with the test Firestore (or emulator) and exercise the UI in a headed browser during development and testing. There is no need to install or run external CLI tools for Playwright or Firebase when using these MCP servers; use the provided MCP endpoints instead for automated tests and integration checks.

## Updated acceptance criteria (minimal patch)

1. `EntryForm` uses `onSubmit` prop when provided.
2. `createEntry` will throw if after geocoding the entry lacks numeric `latitude` and `longitude`.
3. When geocoding fails, the Add Entry UI shows a clear, actionable error and does not save the entry.
4. Unit tests cover createEntry geocode success and failure, and the `New York / United States` test case is included in test matrix (mocked geocoder).

