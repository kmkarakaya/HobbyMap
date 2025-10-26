
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

### 🗺️ Interactive Map
- Powered by Leaflet.js with OpenStreetMap tiles
- Click markers to view entry details
- Zoom and pan to explore your activities worldwide
- Responsive design works on all devices

### 🔐 User Authentication
- Secure Firebase Authentication
- Google Sign-In for quick access
- Email/password registration and login
- Protected routes - your data stays private

### 📝 Hobby Tracking
- Add entries for any hobby (diving, hiking, photography, etc.)
- Record location, date, hobby type, and detailed notes
- Edit or delete existing entries
- Search and filter your activities

### 🎨 Modern UI
- Clean, responsive design
- Intuitive navigation
- Mobile-friendly interface
- Real-time updates

## How to Use

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Add Entry**: Click "Add Entry" to record a new hobby activity
3. **View Map**: See all your activities plotted on the interactive world map
4. **Manage Entries**: View, edit, or delete entries from the "My Entries" page
5. **Explore**: Click on map markers to see details about each activity

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
- `EntryMap`: Interactive Leaflet map component (formerly DiveMap)
- `Header`: Navigation with authentication state
- `ProtectedRoute`: Route wrapper requiring authentication
- `EntryForm`: Form for adding/editing entries (formerly DiveSiteForm)
- `FirebaseContext`: Authentication and data management
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
- RESTful API for dive site management
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

**Test Results**: All 22 tests pass successfully

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
