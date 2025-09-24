
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
   - Update `frontend/src/firebase/firebase.js` with your config

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
- `DiveMap`: Interactive Leaflet map component
- `Header`: Navigation with authentication state
- `ProtectedRoute`: Route wrapper requiring authentication
- `DiveSiteForm`: Form for adding/editing entries
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
   
   # Deploy from project root
   cd ..
   firebase deploy --only hosting,firestore:rules,firestore:indexes --project hobbymap-scuba-dive
   ```

3. **First-time Firebase Setup**:
   ```bash
   firebase init
   # Select Hosting and Firestore
   # Use "frontend/build" as your public directory
   # Configure as single-page app (yes)
   # Don't overwrite index.html (no)
   ```

### Environment Variables

For production deployment, ensure these are configured:

- **Firebase Config**: Update `frontend/src/firebase/firebase.js` with your project credentials
- **GitHub Secrets**: Set `FIREBASE_TOKEN` for automated deployment

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/firebase-hosting.yml`) includes:

- **Trigger**: Runs on pushes to `master`/`main` affecting frontend files
- **Dependencies**: Installs with `--legacy-peer-deps` flag
- **Build**: Creates production build with `npm run build`
- **Deploy**: Deploys to Firebase using `FIREBASE_TOKEN` secret
- **Scope**: Only frontend, Firestore rules, and indexes

To set up CI/CD:
1. Generate Firebase CI token: `firebase login:ci`
2. Add token to GitHub repository secrets as `FIREBASE_TOKEN`
3. Workflow runs automatically on qualifying pushes

## Backend API (Optional)

The backend server provides additional functionality but is not required for the frontend to work.

### Backend Features
- RESTful API for dive site management
- MongoDB integration with Mongoose
- CORS enabled for frontend integration
- Geocoding services for location data

### Backend Endpoints
- `GET /api/dives` - Get all dive sites
- `POST /api/dives` - Create new dive site  
- `PUT /api/dives/:id` - Update dive site
- `DELETE /api/dives/:id` - Delete dive site

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
