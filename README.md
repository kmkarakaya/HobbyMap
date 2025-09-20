# Scuba Diving Map Tracker (MVP)

A web application that displays scuba diving sites on an interactive world map.

## Overview

This application allows you to:

- Record dive sites you've visited around the world
- View all your dive sites on an interactive map
- Track the date and location of each dive

## Project Structure

- `/frontend` - React application with Firebase integration and Leaflet.js map

## Technologies Used

- **Frontend**: React, Leaflet.js
- **Database**: Firebase Firestore (serverless)
- **Deployment**: Firebase Hosting

## Setup Instructions

### Prerequisites

- Node.js and npm installed
- A Firebase account (free tier)

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
   - Go to Firestore Database in the Firebase console
   - Click "Create database"
   - Start in test mode (you can update security rules later)
3. Get your Firebase configuration
   - Go to Project settings > General
   - Scroll down to "Your apps" section
   - Click the web app icon (</>) to create a web app if you haven't already
   - Copy the firebaseConfig object

### Application Setup

1. Clone this repository
2. Install dependencies
   ```
   cd frontend
   npm install
   ```
3. Update Firebase configuration

   - Open `src/firebase/firebase.js`
   - Replace the placeholder values in the `firebaseConfig` object with your actual Firebase configuration

4. Start the application
   ```
   npm start
   ```

## Frontend

The frontend application lives in the `frontend/` directory and is a Create React App project. Detailed frontend-specific development and build instructions are in `frontend/README.md`.

Quick links:

- Frontend README: `frontend/README.md`
- Frontend code: `frontend/src/`
## Deployment

To deploy to Firebase Hosting:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase (in project root): `firebase init`
   - Select Hosting and Firestore
   - Use "frontend/build" as your public directory
   - Configure as a single-page app
4. Build the app: `cd frontend && npm run build`
5. Deploy: `firebase deploy`
