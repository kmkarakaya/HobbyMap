# HobbyMap - Hobby Map (generic hobby location tracker)

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

HobbyMap is a React-based web application for tracking location-based hobby activity on an interactive map. The application uses Firebase for authentication and data storage, with an optional Node.js backend for additional features.

## Working Effectively

### Initial Setup and Dependencies
- Install frontend dependencies:
  ```bash
  cd frontend
  npm install --legacy-peer-deps
  ```
  - Takes ~60 seconds. NEVER CANCEL.
  - Use `--legacy-peer-deps` flag to resolve React dependency conflicts

### Building the Application
- Build frontend for production:
  ```bash
  cd frontend
  npm run build
  ```
  - Takes ~18 seconds to complete. NEVER CANCEL. Set timeout to 60+ seconds.
  - Creates optimized production build in `frontend/build/` directory
  - Build is required before Firebase deployment

### Testing
- Run frontend tests:
  ```bash
  cd frontend
  npm test -- --watchAll=false
  ```
  - Takes ~2.4 seconds. NEVER CANCEL. Set timeout to 30+ seconds.
  - All tests pass. Test suite includes React component tests and Firebase context tests

- Run frontend linting:
  ```bash
  cd frontend
  npx eslint src/ --ext .js,.jsx,.ts,.tsx
  ```
  - Takes ~5 seconds. Some minor linting issues exist but build still succeeds

### Running the Application
- Start frontend development server:
  ```bash
  cd frontend
  npm start
  ```
  - Takes ~15 seconds to start. NEVER CANCEL.
  - Opens at http://localhost:3000
  - Hot reload enabled for development

- Start backend server (optional - requires MongoDB):
  ```bash
  cd backend
  npm install
  npm start
  ```
  - Backend requires MongoDB running on localhost:27017
  - Backend currently fails without MongoDB connection
  - Frontend works independently without backend

## Validation Scenarios

### Always Test These User Flows After Changes:
1. **Navigation Test**: 
   - Load http://localhost:3000
  - Click through "Map", "Entries", and "Add Entry" navigation links
   - Verify all pages load without errors

2. **Authentication Flow**:
  - Click "Add Entry" - should redirect to login page
   - Verify Firebase authentication UI displays correctly
   - Test that protected routes require authentication

3. **Map Functionality**:
  - Verify Leaflet map renders on main page
  - Test zoom controls (+ and - buttons)
  - Each marker should show the entry title, hobby, and date in the popup
  - Map tiles may show ERR_BLOCKED_BY_CLIENT in sandboxed environments (expected)

## Firebase Configuration

### Firebase Setup Commands:
- Install Firebase CLI:
  ```bash
  npm install -g firebase-tools@latest
  ```
  - Takes 5-10 minutes. NEVER CANCEL. Set timeout to 15+ minutes.
  - May have dependency issues in some environments

-- Deploy to Firebase:
  ```bash
  # Deploy to the project specified by your environment / .firebaserc
  firebase deploy --only hosting,firestore:rules,firestore:indexes --project <PROJECT_ID>
  ```
  - Requires FIREBASE_TOKEN environment variable
  - Deploys frontend build and Firestore configuration

### Firebase Configuration Files:
- Frontend Firebase config in `frontend/src/firebase.js` and client-side service helpers in `frontend/src/firebase/entriesService.js`

## CI/CD Pipeline

### GitHub Actions Workflow:
-- File encoding issue in `frontend/src/firebase/entriesService.js` (if present)
- Requires `FIREBASE_TOKEN` secret in repository settings

### CI Commands (matching workflow):
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
# CI deploy uses FIREBASE_PROJECT_ID secret to select target project
firebase deploy --only hosting,firestore:rules,firestore:indexes --project $FIREBASE_PROJECT_ID
```

## Project Structure

### Key Directories:
- `frontend/` - React application (Create React App)
- `frontend/src/` - React source code
- `frontend/src/components/` - Reusable UI components  
- `frontend/src/pages/` - Page components
- `frontend/src/contexts/` - React context providers
- `frontend/src/firebase/` - Firebase service functions
- `backend/` - Node.js/Express API (optional)
- `docs/` - Project documentation and planning
- `.github/workflows/` - CI/CD configuration

### Important Files:
- `frontend/package.json` - Frontend dependencies and scripts
- `backend/package.json` - Backend dependencies and scripts
- `frontend/src/firebase.js` - Firebase configuration
- `frontend/src/firebase/diveService.js` - Firestore CRUD and geocoding helpers for entries
- `frontend/src/firebase/geocoder.js` - geocoding helper
- `README.md` - Project overview and setup instructions
- `FIREBASE_MIGRATION_GUIDE.md` - Firebase setup guide

## Backend Information

### Backend Status:
- Node.js/Express application in `backend/` directory
- Currently requires MongoDB connection to start
- Database: MongoDB on localhost:27017 
- No tests currently implemented (`npm test` fails)
- Frontend works independently without backend

### Backend Dependencies:
```bash
cd backend
npm install  # Takes ~5 seconds
```

### Backend Environment:
- Requires `.env` file with MongoDB connection string
- Default configuration expects MongoDB on localhost:27017

## Common Issues and Solutions

### Build Issues:
- Use `npm install --legacy-peer-deps` for frontend to resolve React dependency conflicts
- Some ESLint warnings exist but don't prevent builds
-- File encoding issue in `frontend/src/firebase/diveService.js` (UTF-16 BOM)

### Development Environment:
- Map tiles may be blocked in sandboxed environments (shows ERR_BLOCKED_BY_CLIENT)
- Firebase CLI installation may timeout in some environments
- Backend requires local MongoDB installation to run

### Testing Notes:
- Frontend tests pass reliably
- No backend tests currently implemented
- Manual testing required for Firebase authentication features

## Timing Expectations

- Frontend dependency install: ~60 seconds (NEVER CANCEL)
- Frontend build: ~18 seconds (NEVER CANCEL - set 60+ second timeout)
- Frontend tests: ~2.4 seconds (NEVER CANCEL - set 30+ second timeout)
- Frontend dev server startup: ~15 seconds (NEVER CANCEL)
- Firebase CLI install: 5-10 minutes (NEVER CANCEL - set 15+ minute timeout)
- Backend dependency install: ~5 seconds

## Always Run Before Committing:
1. `cd frontend && npm run build` - Verify production build succeeds
2. `cd frontend && npm test -- --watchAll=false` - Verify all tests pass
3. Test complete user navigation flow manually
4. Check that the application loads and displays correctly at http://localhost:3000

## Firebase Project Details:
- Project ID: set in `.firebaserc` or via `FIREBASE_PROJECT_ID` secret
- Hosting URL: configured via Firebase
- Database: Firestore with open rules for development
- Authentication: Firebase Auth with Google provider