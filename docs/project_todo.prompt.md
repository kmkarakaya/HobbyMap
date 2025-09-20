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

2) Confirm Firestore data model and consistency (use `place` + `country` + `hobby` schema)
	- Why: Project scope extended from scuba dives to arbitrary hobby entries. Ensure all read/write code, backend model, and docs are consistent with the new `title` and `hobby` fields while keeping `place` + `country` for geocoding.
	- Acceptance criteria: All create/update flows write `title`, `hobby`, `place`, `country`, `latitude`, `longitude`, `date` (timestamp) and `notes`. No code path still writes or reads legacy `location` fields. Existing `siteName` usages should be mapped to `title` in UI and docs.
	- Suggested files: `frontend/src/firebase/diveService.js`, `frontend/src/pages/*`, `backend/models/DiveSite.js`, `backend/controllers/*`, `frontend/src/components/DiveSiteForm.js`.

3) Client-side geocoding reliability & debug logging
	- Why: Geocoder previously returned wrong country-prefixed results for ambiguous names. We improved heuristics but need debug tooling to catch future mis-resolutions.
	- Acceptance criteria: Client geocoder prefers country-matched results; when a geocode lookup fails or returns a non-matching country, debug output (console or log) includes the top N raw responses. Add optional environment-driven verbose logging.
	- Suggested files: `frontend/src/firebase/geocoder.js`, `frontend/src/firebase/diveService.js`.

4) Map marker behavior and verification
	- Why: MVP requires interactive markers with popups showing entry title, hobby and date.
	- Acceptance criteria: Map displays markers for saved entries; clicking shows `title`, `hobby` and ISO-formatted date; markers persist after reload.
	- Suggested files: `frontend/src/components/Map.js`, `frontend/src/components/DiveSitesList.js`.


5) Authentication & session handling (check user on app load)
	- Why: The app currently lacks a consistent authentication/session check flow. For MVP we prefer a simple, robust approach that protects user data without complex migration. The frontend must detect whether a visitor is signed in on page load, present a clear login/signup flow when unauthenticated, and ensure Firestore reads/writes include the current user's UID so users only see their own dive sites.
	- MVP acceptance criteria (simple approach):
		- On app startup the client checks Firebase Auth state immediately and routes appropriately (loading -> authenticated -> app, or loading -> unauthenticated -> auth UI).
		- Auth UI provides sign-up and sign-in (email/password) and a Google Sign-In option.
		- While auth state is being determined a visual loading state prevents flash of unauthenticated UI.
	- All Firestore queries include the current user's UID (stored on each document as `userId` in the existing top-level `diveSites` collection) so users only see their own entries. (Note: for MVP we will keep the existing top-level `diveSites` collection and require `userId` on writes — migration is not required.)
		- Protected routes/components (map, dive list, add/edit forms) redirect to login if unauthenticated.
		- Basic unit tests exist for the auth context/session-check logic (happy path + unauthenticated redirect).
	- Files to change (MVP-focused):
		- `frontend/src/contexts/FirebaseContext.js` — ensure the context exposes: `user`, `isAuthReady` (or equivalent), `loading`, `error`, and helpers `signUp`, `signIn`, `signOut`, `signInWithGoogle`.
		- `frontend/src/App.js` and `frontend/src/index.js` — ensure app is wrapped with the provider; do not render main routes until `isAuthReady` is true (context can show a global loading state).
		- `frontend/src/pages/LoginPage.js`, `frontend/src/pages/SignupPage.js` — add Google Sign-In button + redirect after successful auth. If `user` exists, redirect away from auth pages.
		- `frontend/src/components/ProtectedRoute.js` — use `isAuthReady` and `user` to prevent redirect until auth init completes; redirect to `/login` only after `isAuthReady` and user is null.
	- `frontend/src/firebase/diveService.js` — continue using the top-level `diveSites` collection, but require `userId` on create/update; modify `getDiveSites(userId)` to query `where('userId', '==', userId)`. Update field mapping for `title`/`hobby`.
		- `frontend/src/components/Header.js` — already reads `user`; ensure sign-out clears local state and navigates if needed.
	- Detailed step-by-step implementation (MVP, no migration):
		1. Ensure `FirebaseContext` uses `onAuthStateChanged` and exposes an `isAuthReady` flag:
			- `isAuthReady` should be `true` after the first `onAuthStateChanged` callback runs. Provide `isAuthReady` in the context `value` so consumers can avoid redirect until initial auth resolution.
		2. Render a global loading state while `isAuthReady` is false:
			- In `FirebaseContext` render a simple placeholder like `Initializing authentication...` instead of children until `isAuthReady`.
		3. Update `ProtectedRoute` to use `isAuthReady` + `user`:
			- If `!isAuthReady` return a loading element (don't redirect).
			- If `isAuthReady && !user` redirect to `/login`.
		4. Add Google Sign-In helper to the context and a UI button:
			- In `FirebaseContext` add a `signInWithGoogle` helper using `GoogleAuthProvider` and `signInWithPopup` (or `signInWithRedirect` for mobile-heavy apps). Expose it in the context.
			- In `LoginPage` add a button that calls `signInWithGoogle()` and navigates to `/dives` on success.
		5. Ensure `LoginPage` and `SignupPage` redirect when `user` exists:
			- If `user` is present (context), run `navigate('/dives')` to avoid showing login to signed-in users.
		6. Enforce `userId` on Firestore writes (simple serverless client-side enforcement):
			- In `FirebaseContext.createDiveSite` attach `user.uid` to the document payload before calling the service. Rename UI payload fields (`siteName` -> `title`) as needed.
			- In `diveService.createDiveSite` log/warn and reject if no `userId` present to catch programming mistakes during development.
		7. Scope reads to `userId`:
			- Update `getDiveSites(userId)` to require `userId` and query `where('userId', '==', userId)` (context already calls `fetchDiveSites(u.uid)`).
		8. Add minimal unit tests (Jest + React Testing Library):
			- Test `FirebaseContext` behavior: mock `onAuthStateChanged` to simulate initial unauthenticated/authenticated callbacks. Verify `isAuthReady` toggles and `user` becomes set.
			- Test `ProtectedRoute` behavior for `isAuthReady=false` (renders loading), `isAuthReady=true && user=null` (redirects), `isAuthReady=true && user!=null` (renders children).
		9. Update firewall/rules notes for MVP:
			- Provide `firestore.rules` that enforce `request.auth != null && request.auth.uid == request.resource.data.userId` on create/update where appropriate. Example rule for `diveSites` top-level:
			  match /databases/{database}/documents {
								match /diveSites/{docId} {
									allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
									allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
								}
			  }
			- Recommend testing rules with the Firebase emulator before deploying.
	- Security note (MVP tradeoff):
		- For speed and simplicity we keep the top-level `diveSites` collection and use a `userId` field to enforce per-user access in rules. This is simpler for an MVP; later you can migrate to `/users/{uid}/dives` if desired.
	- Estimated effort for MVP approach: 2-4 hours (add Google sign-in + auth-ready guard + update reads/writes + tests).

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
	- Why: Allows per-user histories and sharing.
	- Acceptance criteria: Firebase Auth implemented (Google/email), entries scoped to user ID, UI login/logout flows.
	- Suggested files: `frontend/src/contexts/FirebaseContext.js`, `frontend/src/pages/*`, `firebase/*.js`.

9) Share map & export options
	 - Why: Project doc lists sharing as a feature.
	 - Acceptance criteria: Generate a sharable URL or export CSV of entries; public view (read-only) possible.
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
4. Add `title` and `hobby` fields to `DiveSiteForm.js`, update `DiveSitesList` and `Map` popups to show `title` and `hobby`. (1-2 hrs)
4. Harden Firestore security rules and include a `firestore.rules` in repo. (1-2 hrs)
5. Add basic unit tests and a minimal CI step to run lint. (2-4 hrs)

If you'd like, I can now implement task #1 (add debug logging for failing geocoder queries) and create a small test harness that runs a few representative queries and prints raw Nominatim responses for analysis.

---
Generated by repository analysis on 2025-09-19

