# Consolidating Duplicate Helper Files

## Current status (this patch)
- Added frontend wrapper: `frontend/src/firebase/geocoder.js` (re-exports repo-root).
- Added frontend wrapper: `frontend/src/firebase/entriesService.js` (re-exports repo-root).
- Updated this document to record progress and remaining manual steps.

Inventory summary (performed by automation):

- I scanned the repository for usages of `firebase/entriesService` and `firebase/geocoder`.
- Findings: frontend imports use the frontend wrappers at `frontend/src/firebase/*` (e.g. `../firebase/entriesService`, `../firebase/geocoder`). The frontend wrappers themselves re-export the canonical implementations under the repo-root `firebase/` directory (e.g. `../../../firebase/entriesService`).
- Backend and server-side code use their own utilities (for example `backend/utils/geocoder.js`) and are not impacted by the frontend wrappers.

Decision: Option B (keep repo-root canonical)

- Rationale: keeping the canonical helpers in the repo-root `firebase/` directory and retaining the frontend wrappers in `frontend/src/firebase/` is the least risky approach. It preserves existing frontend import paths, keeps a single canonical implementation (repo-root), and avoids needing to update many import paths across the codebase.


## Remaining manual steps (must run locally)
1. Inventory: (already performed here) verify there are no external consumers outside the frontend that import the repo-root `firebase/` helpers directly. If you have other projects that consume this repo via subpath imports, re-check them.
   - Optional PowerShell command to re-run locally:
     Select-String -Path "**/*" -Pattern "firebase/entriesService|firebase/geocoder" -SimpleMatch | Select-Object Path,LineNumber,Line

2. Decide consolidation strategy: (done) Option B chosen — keep repo-root `firebase/` as canonical implementations and retain frontend wrappers in `frontend/src/firebase/` that re-export them.

3. Create branch and implement chosen strategy (local steps):
  - Create a branch and commit the decision/any optional housekeeping (this repo already has wrappers and canonical files):

    git checkout -b chore/consolidate-firebase-helpers
    # If you want to rename/move the original firebase helpers or archive them, do it here.
    # Otherwise just commit the documentation/decision and run tests.
    git add -A
    git commit -m "chore(shared): consolidate firebase helpers — keep repo-root canonical and retain frontend wrappers"

4. Run tests & build locally:
   cd frontend
   npm install --legacy-peer-deps
   npm test -- --watchAll=false
   npm run build

5. Fix any import path issues reported by tests/build, commit, push, open PR.

## Quick commands (examples)
- Create branch:
  git checkout -b chore/consolidate-firebase-helpers

- Option A (archive root copy):
  git mv firebase .firebase-archive || Remove-Item -Recurse -Force firebase
  git add -A
  git commit -m "chore: remove duplicate root firebase helpers; consolidated under frontend/src/firebase"

- Option B (move canonical to root and keep frontend wrappers):
  # move canonical files into repo-root firebase/ then keep wrappers unchanged
  git add -A
  git commit -m "refactor(shared): consolidate firebase helpers under repo-root and add frontend wrappers"

## Notes
- I could not run shell/git commands, modify repo-root files, or run tests from this environment. The wrappers for the frontend are present to keep existing frontend imports working while you complete the remaining steps locally.
- After you run the inventory, follow Option A or B above, run the build/tests, and push the branch.
