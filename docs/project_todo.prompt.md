Project TODOs — gap analysis vs. project description & MVP
=========================================================

This document lists missing features, improvements, and next actions discovered by comparing the current codebase to the goals in:
- `docs/project_description.prompt.md` (project goals)
- `docs/project_MVP_implementation.prompt.md` (MVP plan)

For each item: priority, short description, acceptance criteria, and suggested files/locations to implement.

High priority (necessary for MVP)
---------------------------------

1) Verify and enforce Firestore security rules
	- Why: MVP requires a secure Firestore (rules were touched earlier but must be confirmed and committed).
	- Acceptance criteria: Firestore rules file present and secure for reads/writes used by the app; rules stored in `frontend/firestore.rules` or top-level `firestore.rules` and validated with `firebase emulators` or `firebase deploy --only firestore:rules`.
	- Suggested files: `firestore.rules`, `frontend/firestore.rules`, `firebase/*.js` (client config)

2) Confirm Firestore data model and consistency (use `place` + `country` schema)
	- Why: The app was refactored to use `place` + `country` (MVP). Ensure all read/write code, backend model, and docs are consistent.
	- Acceptance criteria: All create/update flows write `place`, `country`, `latitude`, `longitude`, `date` (timestamp) and `siteName`/`notes`. No code path still writes or reads `location`.
	- Suggested files: `frontend/src/firebase/diveService.js`, `frontend/src/pages/*`, `backend/models/DiveSite.js`, `backend/controllers/*`.

3) Client-side geocoding reliability & debug logging
	- Why: Geocoder previously returned wrong country-prefixed results for ambiguous names. We improved heuristics but need debug tooling to catch future mis-resolutions.
	- Acceptance criteria: Client geocoder prefers country-matched results; when a geocode lookup fails or returns a non-matching country, debug output (console or log) includes the top N raw responses. Add optional environment-driven verbose logging.
	- Suggested files: `frontend/src/firebase/geocoder.js`, `frontend/src/firebase/diveService.js`.

4) Map marker behavior and verification
	- Why: MVP requires interactive markers with popups showing siteName and date.
	- Acceptance criteria: Map displays markers for saved dive sites; clicking shows siteName and ISO-formatted date; markers persist after reload.
	- Suggested files: `frontend/src/components/Map.js`, `frontend/src/components/DiveSitesList.js`.

Medium priority (improve UX & robustness)
----------------------------------------

5) Country selection UX: store ISO code vs. name
	- Why: Using country name works, but storing ISO2 codes is more robust for geocoding and internationalization.
	- Acceptance criteria: `country` stored in Firestore as ISO2 code (e.g., "EG"), geocoder accepts ISO2 or name. UI shows human-readable name but persists ISO2. Provide migration guidance for existing data (empty DB was noted earlier).
	- Suggested files: `frontend/src/components/DiveSiteForm.js`, `frontend/src/data/countries.js`, `frontend/src/firebase/geocoder.js`, `frontend/src/firebase/diveService.js`.

6) Searchable country component polish
	- Why: Already added `react-select`. Improve keyboard accessibility and ensure mobile styling.
	- Acceptance criteria: Country input works on touch devices; accessible labels; value preservation while editing.
	- Suggested files: `frontend/src/components/DiveSiteForm.js`, `frontend/src/components/DiveSiteForm.css`.

7) Add validation & user feedback on geocoding failures
	- Why: If geocoding fails, user should see a friendly error and be able to enter coordinates manually.
	- Acceptance criteria: When geocoder cannot find a location, show a suggestion and optional latitude/longitude fields; prevent saving without coords unless user confirms.
	- Suggested files: `frontend/src/components/DiveSiteForm.js`.

Low / Optional priority (post-MVP)
---------------------------------

8) User authentication (optional MVP enhancement)
	- Why: Allows per-user dive histories and sharing.
	- Acceptance criteria: Firebase Auth implemented (Google/email), dive sites scoped to user ID, UI login/logout flows.
	- Suggested files: `frontend/src/contexts/FirebaseContext.js`, `frontend/src/pages/*`, `firebase/*.js`.

9) Share map & export options
	- Why: Project doc lists sharing as a feature.
	- Acceptance criteria: Generate a sharable URL or export CSV of dive sites; public view (read-only) possible.
	- Suggested files: new `frontend/src/pages/ShareMapPage.js`, small API or Firestore rule for public read.

10) Marker clustering & performance for many sites
	 - Why: If users add many sites, the map should remain usable.
	 - Acceptance criteria: Use Leaflet marker clustering for >100 markers; map remains responsive.
	 - Suggested files: `frontend/src/components/Map.js`.

11) Tests & CI
	 - Why: Improve maintainability.
	 - Acceptance criteria: Basic unit tests for critical services (geocoder wrapper and diveService); a CI workflow that runs lint and tests on PRs.
	 - Suggested files: `frontend/.github/workflows/ci.yml`, `frontend/src/__tests__/*`.

12) README and deployment instructions
	 - Why: Needed for reproducibility and deployment.
	 - Acceptance criteria: `README.md` updated with run, build, and deploy steps; how to configure Firebase project and set env variables.
	 - Suggested files: root `README.md`, `frontend/README.md` (update existing), `CI_SETUP.md` (if needed).

Implementation notes & assumptions
--------------------------------
- The codebase already contains a React frontend with Leaflet, Firebase helpers, and a Node backend. The database was reported as empty, so schema migration is not required immediately.
- For geocoding reliability, a short-term solution is the existing Nominatim heuristic; long-term consider a paid geocoding provider (Mapbox/Google) for better place disambiguation and rate limits.
- Storing ISO2 country codes will require changing the frontend form and the geocoder to accept codes (recommended).

Suggested next concrete tasks (in order)
--------------------------------------
1. Add debug logging to `frontend/src/firebase/geocoder.js` (low-risk) and re-test problematic entries (Sharm el Sheikh, Zanzibar). (1-2 hrs)
2. Migrate `country` to ISO2 in Firestore: change UI to store code and update geocoder to accept code. (2-4 hrs)
3. Add latitude/longitude manual input fallback in `DiveSiteForm.js`. (1-2 hrs)
4. Harden Firestore security rules and include a `firestore.rules` in repo. (1-2 hrs)
5. Add basic unit tests and a minimal CI step to run lint. (2-4 hrs)

If you'd like, I can now implement task #1 (add debug logging for failing geocoder queries) and create a small test harness that runs a few representative queries and prints raw Nominatim responses for analysis.

---
Generated by repository analysis on 2025-09-19

