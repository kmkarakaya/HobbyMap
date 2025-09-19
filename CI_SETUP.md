CI setup for Firebase deploy

This repository uses a GitHub Actions workflow to build the frontend and deploy to Firebase Hosting and Firestore rules/indexes automatically.

What you need to do locally (one-time):

1. Install and log in to Firebase CLI (if not already):

   npm install -g firebase-tools
   firebase login

2. Generate a CI token (do this on a machine you trust that has access to the Firebase project):

   firebase login:ci

This prints a token string. Keep it secret.

3. Add the token to GitHub Actions secrets:

   - Go to your GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret
   - Name: FIREBASE_TOKEN
   - Value: paste the token from step 2
   - Save

Notes:

- The workflow deploys to project id `hobbymap-scuba-dive`. Make sure your Firebase account has permissions for that project.
- The workflow triggers on pushes and pull requests to `master` and `main`, but only when files matching the following paths change:
  - frontend/\*\*
  - firebase.json
  - firestore.rules
  - firestore.indexes.json

If you want different behavior (e.g., run on all pushes, or use a different branch), update `.github/workflows/firebase-hosting.yml` accordingly.
