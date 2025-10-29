# Hobby Map Tracker

A web application that allows users to track and visualize their hobby activities on an interactive world map. Whether you're into scuba diving, photography, hiking, or any other hobby, this application helps you keep track of all the amazing places you've visited and experiences you've had.

## Overview

This application allows you to:

- **Track hobby activities**: Record entries for any hobby with location, date, and notes
- **Interactive world map**: View all your entries on a beautiful Leaflet.js map with markers
- **User authentication**: Secure login with Firebase Auth (Google sign-in and email/password)
- **Personal tracking**: Each user has their own private collection of entries
- **Rich data**: Track hobby type, location, date, country, and detailed notes
- **Responsive design**: Works on desktop, tablet, and mobile devices

## Project Structure

```
├── frontend/          # React application (Create React App)
│   ├── src/
│   │   ├── components/    # Reusable UI components (Map, Header, etc.)
│   │   ├── pages/         # Page components (Home, Login, etc.)
│   │   ├── contexts/      # React context providers (Firebase)
│   │   ├── firebase/      # Firebase service functions
│   │   └── services/      # API service functions
│   ├── public/        # Static assets
│   └── build/         # Production build output
├── backend/           # Node.js/Express API server (optional)
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── server.js      # Express server
├── firebase/          # Firebase configuration files
├── docs/              # Project documentation
└── .github/workflows/ # CI/CD with GitHub Actions
```

## Technologies Used

### Frontend

- **React 18** - Modern React with hooks and context
- **React Router 6** - Client-side routing
- **Leaflet.js** - Interactive maps
- **React Leaflet** - React components for Leaflet
- **Firebase 9** - Authentication and database
- **CSS3** - Styling and responsive design

### Backend (Optional)

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **CORS** - Cross-origin resource sharing

### Database & Authentication

- **Firebase Firestore** - NoSQL cloud database
- **Firebase Auth** - Authentication (Google, email/password)
- **Firebase Hosting** - Static site hosting

### DevOps

- **GitHub Actions** - CI/CD pipeline
- **Firebase CLI** - Deployment tools
- **ESLint** - Code linting
- **Jest & React Testing Library** - Testing

## Setup Instructions

### Prerequisites

- **Node.js 18+** and npm installed
- A **Firebase account** (free tier sufficient)
- **MongoDB** (optional, only needed if running the backend server)

### Quick Start

1. **Clone this repository**

   ```bash
   git clone https://github.com/kmkarakaya/HobbyMap.git
   cd HobbyMap
   ```
2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install --legacy-peer-deps
   ```

   > **Note**: The `--legacy-peer-deps` flag is required due to React dependency conflicts.
   >
3. **Firebase Setup** (if you want your own instance)

   The app comes pre-configured with a demo Firebase project. For your own instance:

   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Firestore Database** (start in test mode)
   - Enable **Authentication** with Google and Email/Password providers
   - Get your Firebase configuration from Project Settings → General → Your apps
   - Update `frontend/src/firebase.js` with your config
4. **Start the application**

   ```bash
   npm start
   ```

   The app will open at http://localhost:3000

### Backend Setup (Optional)

The frontend works independently, but you can also run the backend server:

1. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```
2. **Set up MongoDB**

   - Install and start MongoDB locally, or use MongoDB Atlas
   - Create a `.env` file with your MongoDB connection string
3. **Start the backend server**

   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

### Development Commands

**Frontend commands** (run from `frontend/` directory):

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
npm run test -- --watchAll=false  # Run tests once
```

**Backend commands** (run from `backend/` directory):

```bash
npm start          # Start server
npm run dev        # Start with nodemon (auto-reload)
npm test           # Run tests (currently not implemented)
```

## Features

The Hobby Map Tracker provides a compact set of features focused on recording, viewing, and managing location-based hobby activities. The UI and data flows are optimized for quick entry of places and reliable rendering on the interactive map.

Key features at a glance:

- Interactive map (Leaflet + OpenStreetMap): markers for entries, panning/zooming, and responsive layout for desktop and mobile devices.
- Reliable geolocation & fallback: automatic geocoding for typed places and an in-form MapPicker fallback when geocoding fails or when you want to select coordinates manually.
- Firebase-backed user data: secure sign-in (Google and email/password) and per-user private entries stored in Firestore.
- Full entry lifecycle: add, edit, and delete entries with date, hobby type, place, country (ISO code supported), and notes.
- UX & accessibility improvements: marker popups include a clear close (×) button, Escape/outside-click to close, and hover/open behavior for discoverability.

Why this matters:

- Ensures entries always have usable numeric coordinates (saved entries will render on the map).
- Provides a safe fallback (MapPicker) so users are never blocked by a geocoding failure.


## Recent changes (branch: fix/add-entry-geolocation)

This branch contains a set of stability and UX fixes related to entry geolocation and map popups. If you're reviewing this branch before merging, please verify the items below.

Key changes:

- Added an in-form MapPicker so users can pick coordinates when geocoding fails or proactively choose a location.
- Fixed client-side geocoding issues (removed forbidden User-Agent header, improved country/country-code matching).
- `entriesService.createEntry` now defensively requires numeric coordinates (throws a descriptive error when geocoding fails) to avoid saving entries that would not display on the map.
- Entry form (`EntryForm`) no longer overwrites local edits when the global entries list updates (prevents typed fields from being lost while editing).
- Map popups: added an accessible close (×) button, Escape/outside-click handlers, and hover-open/short-hide behavior. Popups now show values-only (no inline labels) per UX request.
- Additional diagnostics and defensive logging in `FirebaseContext` and `entriesService` to help diagnose intermittent false-negative create errors.
- Added a focused unit test covering createEntry geocoding behavior (`frontend/src/__tests__/createEntry.geocode.test.js`).

Files touched (high-level):

- `frontend/src/components/EntryForm.js` — form initialization and MapPicker wiring
- `frontend/src/components/MapPicker.js` — new lightweight map picker component
- `frontend/src/components/Map.js` & `frontend/src/components/Map.css` — popup UX, hover behavior, tile diagnostics
- `frontend/src/firebase/geocoder.js` — removed forbidden header; added reverse geocode helper
- `frontend/src/firebase/entriesService.js` — defensive geocoding and numeric coordinate enforcement
- `frontend/src/contexts/FirebaseContext.js` — createEntry instrumentation and recovery/optimistic logic
- `frontend/src/pages/EditEntryPage.js` — fixed effect deps to avoid clobbering in-progress edits
- `frontend/src/__tests__/createEntry.geocode.test.js` — unit tests for geocoding behavior

Quick testing checklist (recommended before creating PR):

1. From project root run frontend tests:

```powershell
cd frontend
npm test -- --watchAll=false
```

2. Start the dev server and manually test the user flows:

```powershell
cd frontend
npm start
# Open http://localhost:3000
```

3. Manual verification steps:

- Add Entry → try geocoding (Place/Country) → if geocode fails, use "Pick location on map" to set coordinates → Save → confirm the saved entry appears on the main Map with a marker.
- Edit an entry and verify typing isn't overwritten by background refreshes.
- Hover and click map markers to verify popup close (×), Escape, and outside-click behavior.


## How to Use

A short, practical walkthrough to get started quickly.

1. Sign up / log in

   - Create an account or sign in with Google (or use email/password). Protected routes require authentication.

2. Add an entry

   - Click "Add Entry" in the app.
   - Fill in required fields: title, hobby type, date, and place (free-text).
   - The app attempts to geocode the typed place automatically. If geocoding succeeds, latitude/longitude and country are filled in.
   - If geocoding fails, the form displays a helpful message and you can choose "Pick location on map" to open the MapPicker. Use the MapPicker to drop a pin and return precise coordinates.

3. Save and verify

   - Click Save to store the entry in Firestore. The app enforces numeric coordinates for saved entries so they render on the main map.
   - After saving, the entry should appear as a marker on the main map. Click a marker to open a popup (use ×, press Escape, or click outside to close).

4. Edit or delete entries

   - From the "My Entries" or entry detail view, choose Edit to update an entry.
   - The form preserves any in-progress typing (it won't overwrite your edits when background refreshes occur).

5. Explore and manage

   - View, filter, and search your entries on the map or in list views.
   - Use the popup to inspect an entry quickly or open the full edit page for more changes.

Quick tips

- Use the MapPicker when you need precision (e.g., a specific trailhead or viewpoint).
- If markers don't appear after saving, confirm the saved entry has numeric latitude/longitude in Firestore.
- Run the test-suite and dev server locally while developing: see the "Development Commands" section above.

## Frontend Architecture

The frontend is a modern React application built with:

- **Create React App**: Standard React project setup
- **React Router**: Client-side routing with protected routes
- **Context API**: State management for authentication
- **Firebase SDK**: Direct integration with Firebase services
- **Component-based**: Reusable UI components
- **CSS Modules**: Scoped styling

### Key Components

- `LandingPage`: Welcome page with call-to-action
- `EntryMap`: Interactive Leaflet map component
- `Header`: Navigation with authentication state
- `ProtectedRoute`: Route wrapper requiring authentication
- `EntryForm`: Form for adding/editing entries.
- `FirebaseContext`: Authentication and data management
- `MapPicker`: Small map-based coordinate picker used by the entry form when geocoding fails

## Deployment

### Firebase Hosting (Recommended)

The project includes automated deployment via GitHub Actions:

1. **Automatic Deployment**:

   - Pushes to `master`/`main` automatically trigger deployment
   - The workflow builds the frontend and deploys to Firebase Hosting
   - Also deploys Firestore rules and indexes
2. **Manual Deployment**:

   ```bash
   # Install Firebase CLI globally
   npm install -g firebase-tools@latest

   # Login to Firebase
   firebase login

   # Build the frontend
   cd frontend
   npm run build

   # Deploy from project root (replace <PROJECT_ID> with your project id)
   cd ..
   firebase deploy --only hosting,firestore:rules,firestore:indexes --project <PROJECT_ID>

   # Example using an environment variable in PowerShell:
   # firebase deploy --only hosting,firestore:rules,firestore:indexes --project $env:FIREBASE_PROJECT_ID
   ```
3. **First-time Firebase Setup**:

   ```bash
   firebase init
   # Select Hosting and Firestore
   # Use "frontend/build" as your public directory
   # Configure as single-page app (yes)
   # Don't overwrite index.html (no)
   ```

### Environment variables & CI

This repository supports environment-driven Firebase configuration and CI deploys.

- The frontend reads build-time env vars from `process.env.REACT_APP_FIREBASE_*` — see `frontend/src/firebase.js`.
- CI / GitHub Actions picks up `FIREBASE_PROJECT_ID` and `FIREBASE_TOKEN` from repository secrets to select the deploy target and authenticate the deploy.
- Optional but recommended: set `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, and `REACT_APP_FIREBASE_APP_ID` as GitHub repository secrets so the CI build embeds the correct config into the production bundle.

Quick checklist for CI-driven deployment:

1. Generate a CI token locally: `firebase login:ci` and copy the token.
2. In your GitHub repo settings → Secrets → Actions add:
   - `FIREBASE_TOKEN` = <token from `firebase login:ci`>
   - `FIREBASE_PROJECT_ID` = <your target project id, e.g. `hobbymap`>
   - (optional) `REACT_APP_FIREBASE_*` values copied from the Firebase SDK config for your project

The workflow at `.github/workflows/firebase-hosting.yml` will inject these into the build and deploy steps.

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/firebase-hosting.yml`) includes:

- **Trigger**: Runs on pushes to `master`/`main` affecting frontend files
- **Dependencies**: Installs with `--legacy-peer-deps` flag
- **Build**: Creates production build with `npm run build`
- **Deploy**: Deploys to Firebase using `FIREBASE_TOKEN` and `FIREBASE_PROJECT_ID` secrets
- **Scope**: Only frontend, Firestore rules, and indexes

To set up CI/CD:

1. Generate Firebase CI token: `firebase login:ci`
2. Add token to GitHub repository secrets as `FIREBASE_TOKEN`
3. Add `FIREBASE_PROJECT_ID` to your repo secrets (so CI deploys to the intended project)
4. (Optional) Add `REACT_APP_FIREBASE_*` secrets so the built bundle contains the correct Firebase SDK config for your production project
5. Push to `master`/`main` (or re-run the workflow) to trigger a CI deploy

### Migration & runbook

If you need to move hosting to a new Firebase project (for example to change the built-in `*.web.app` domain), follow the detailed migration runbook at `.github/prompts/migrate.prompt.md`. It documents creating the new project, exporting/importing Firestore or Storage (if needed), required GitHub secrets, a local dry-run, and CI cutover steps.

## Backend API (Optional)

The backend server provides additional functionality but is not required for the frontend to work.

### Backend Features

- RESTful API for  site management
- MongoDB integration with Mongoose
- CORS enabled for frontend integration
- Geocoding services for location data

### Backend Endpoints

- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create new entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry

### Backend Requirements

- **Node.js 18+**
- **MongoDB** (local or Atlas)
- **Environment Variables**: MongoDB connection string in `.env`

### Backend Limitations

- Currently requires MongoDB to start
- No tests implemented yet
- Frontend works independently without backend

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
cd frontend
npm test -- --watchAll=false

# Run tests in watch mode
npm test
```

**Test Coverage**:

- Component rendering tests
- Firebase context functionality
- Protected route behavior
- Map component interactions
- Form submission flows

**Test Results**: All 24 tests pass successfully

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test -- --watchAll=false`
5. Build successfully: `npm run build`
6. Submit a pull request

## License

MIT License - feel free to use this project for your own hobby tracking needs!

## Developer

**Murat Karakaya** - [muratkarakaya.net](https://muratkarakaya.net)

---

*Built with ❤️ for hobbyists who love to track their adventures around the world.*
