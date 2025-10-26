# Migration plan: Move hosting to project `hobbymap` (goal: https://hobbymap.web.app/)

This document captures the full, step-by-step migration plan for moving the app from
the current Firebase project (`hobbymap-scuba-dive`) to a new project whose project-id is
`hobbymap`, so the app is reachable at https://hobbymap.web.app/.

Assumptions
- You (the operator) have owner permissions on the Google account used for Firebase.
- Nobody is currently using the app (no active auth users or critical production data).
- The repo has been prepared to accept environment-based Firebase config and CI controls
	(see changes to `frontend/src/firebase.js` and `.github/workflows/firebase-hosting.yml`).

Why this process
- The built-in web.app host (PROJECT_ID.web.app) is tied to the Firebase project id and
	cannot be renamed. To get `hobbymap.web.app` you must create a new Firebase project
	with project-id `hobbymap` and deploy the app there. This plan minimizes risk and
	documents commands and verification steps for reproducibility.

High-level plan (summary)
1. Create the new Firebase project `hobbymap` and enable services.
2. Configure GitHub Actions secrets and CI variables (FIREBASE_TOKEN, FIREBASE_PROJECT_ID, optional REACT_APP_* keys).
3. Optionally export/import Firestore / Storage if you have existing data to keep.
4. Build & deploy to the new project (local dry-run and then CI) and verify the site at https://hobbymap.web.app/.
5. Smoke-test Auth / OAuth flows and update OAuth client redirect URIs if necessary.
6. Finalize cutover and optionally decommission the old project.

Detailed step-by-step plan
--------------------------

Pre-flight checks (do these first)
- Confirm `hobbymap` project-id is available — try to create or check in the Firebase Console.
- Confirm you have the Firebase CLI installed and are logged in locally:

	```powershell
	# Windows / PowerShell
	firebase --version
	firebase login
	```

- Confirm repository changes are present (I added env-driven config and CI flexibility):
	- `frontend/src/firebase.js` now reads REACT_APP_FIREBASE_* env vars with safe fallbacks.
	- `.github/workflows/firebase-hosting.yml` accepts a secret `FIREBASE_PROJECT_ID` and will default
		to the old project until you change secrets.

Step 1 — Create the new Firebase project `hobbymap`
- Console (recommended):
	1. Open https://console.firebase.google.com/
	2. Click **Add project** and follow the wizard.
	3. When prompted for a project ID, specify `hobbymap` (if available).

- CLI (alternate):
	```bash
	# may require gcloud auth and proper IAM privileges
	firebase projects:create hobbymap --display-name="HobbyMap"
	```

Step 2 — Provision services in the new project
1. In the Firebase Console for `hobbymap` enable:
	 - Firestore (Native mode)
	 - Authentication (if you use it)
	 - Hosting
	 - Storage (if used)
2. Optionally enable Firestore indexes/rules and the Firebase APIs (Console or gcloud).

Step 3 — Generate a CI deploy token and add GitHub secrets
1. Locally (on your machine where you have access):

	```powershell
	# Ensure you're logged in with the account that can deploy
	firebase login
	# Generate a non-expiring CI token
	firebase login:ci
	```

	Copy the printed token.

2. In GitHub repository settings → Secrets → Actions add/update:
	- `FIREBASE_TOKEN` = <token produced by firebase login:ci>
	- `FIREBASE_PROJECT_ID` = `hobbymap` (this makes CI deploy to the new project)

3. Optional but recommended: add REACT_APP_FIREBASE_* environment secrets (values from the new project's SDK config):
	- `REACT_APP_FIREBASE_API_KEY`
	- `REACT_APP_FIREBASE_AUTH_DOMAIN` (e.g. hobbymap.firebaseapp.com)
	- `REACT_APP_FIREBASE_PROJECT_ID` (hobbymap)
	- `REACT_APP_FIREBASE_STORAGE_BUCKET`
	- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
	- `REACT_APP_FIREBASE_APP_ID`

	The CI workflow can automatically inject these into the build step, producing a build configured for the new project.

Step 4 — (Optional) Export / import Firestore & Storage if you have data
Only do this if you have documents or storage objects you need to preserve. If the project is brand new and unused, skip.

Firestore export/import (gcloud)
	1. Create a GCS bucket accessible to both projects (or use an existing neutral bucket).
	2. Export from old project:

		 ```bash
		 gcloud config set project hobbymap-scuba-dive
		 gcloud firestore export gs://BUCKET_NAME/exports/hobbymap-scuba-dive
		 ```

	3. Import into new project:

		 ```bash
		 gcloud config set project hobbymap
		 gcloud firestore import gs://BUCKET_NAME/exports/hobbymap-scuba-dive/EXPORT_FOLDER
		 ```

Storage copy (gsutil)
	```bash
	# copy bucket contents from old to new
	gsutil -m rsync -r gs://old-bucket-name gs://new-bucket-name
	```

Notes on auth user migration
- If you have real users (passwords), migrating Auth is complex and requires careful handling of password hashes and possible user resets.
- Because you said nobody is using the app, we assume there are no users to migrate and you can skip this step.

Step 5 — Local dry-run deploy (validate everything before CI)
1. Build and deploy the frontend to the new project from your machine:

	```powershell
	cd frontend
	npm ci --legacy-peer-deps
	npm run build
	firebase deploy --only hosting --project=hobbymap
	```

2. Visit https://hobbymap.web.app/ and verify the site loads.

Step 6 — Run CI / GitHub Actions deploy
1. If you added `FIREBASE_PROJECT_ID` and `FIREBASE_TOKEN` secrets, push a trivial commit or re-run the workflow in Actions.
2. Watch the workflow logs. Our workflow prints the selected deploy project before calling `firebase deploy`.

Step 7 — Verify and test (smoke tests)
- Confirm the following on the new project:
	- The site loads at https://hobbymap.web.app/.
	- Firestore reads and writes work from the UI.
	- If you use Auth (Google sign-in), add `hobbymap.web.app` to OAuth authorized redirect URIs in Google Cloud Console and to Firebase Auth "Authorized domains".
	- Storage reads/downloads work (if used).
	- Any server-side functions behave correctly (re-deploy functions to the new project if applicable).

Step 8 — Finalize and cleanup
- After successful verification, you can optionally:
	- Remove `FIREBASE_PROJECT_ID` or update it permanently in CI to `hobbymap`.
	- Remove or archive the old project `hobbymap-scuba-dive` (careful: deleting is irreversible).
	- Update docs and README to reference the new project and URLs.

Rollbacks & safeguards
- Keep the old project active (do not delete) until you are confident the new deployment is stable.
- If something goes wrong, you can revert CI secrets to the old token/project id so CI deploys back to `hobbymap-scuba-dive`.
- Keep a local copy of `firebase.json`, `firestore.rules` and `firestore.indexes.json` — these are already in the repo.

Checklist (copy this into your issue tracker and tick items off)
- [ ] Create Firebase project `hobbymap` (Console/CLI).
- [ ] Enable Firestore/Auth/Hosting/Storage on the new project.
- [ ] Generate CI token and set `FIREBASE_TOKEN` secret.
- [ ] Set `FIREBASE_PROJECT_ID` secret to `hobbymap`.
- [ ] (Optional) Set `REACT_APP_FIREBASE_*` secrets with SDK config values.
- [ ] (Optional) Export/import Firestore/Storage data if needed.
- [ ] Local dry-run deploy to the new project.
- [ ] Push commit to trigger GitHub Actions and validate the deploy.
- [ ] Validate app functionality on https://hobbymap.web.app/.
- [ ] Finalize cleanup and optional deletion of the old project.

Notes and tips
- If you prefer to continue using the existing `hobbymap-scuba-dive` project and simply want a nicer URL, consider adding a custom domain (cheaper and safer). The steps above are only necessary to change the built-in web.app host.
- The repo has already been updated to make the frontend config env-driven and the workflow project configurable via `FIREBASE_PROJECT_ID` secret. This means you can perform the migration by creating the new project and updating secrets — no further code changes required.
- Keep your `FIREBASE_TOKEN` secret secure — treat it like a deploy credential.

Contact & context
- If you want me to: I can patch the CI to inject `REACT_APP_FIREBASE_*` secrets into the build step so the produced bundle is configured for the new project automatically. I can also produce the exact `REACT_APP_*` values you should copy into GitHub Secrets once you create the project.

End of migration plan.

