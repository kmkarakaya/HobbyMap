# MVP Setup with Firebase

This document provides guidance for setting up the Scuba Diving Map Tracker using Firebase.

## Firebase Setup

1. **Create a Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Follow the setup wizard (you can disable Google Analytics if desired)

2. **Set up Firestore Database**

   - In the Firebase console, navigate to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a region close to your users

3. **Register a Web App**

   - In Project settings, click the web icon (</>) to register an app
   - Name your app (e.g., "Scuba Diving Map Tracker")
   - You don't need to set up Firebase Hosting yet

4. **Copy Your Firebase Configuration**
   - Save the configuration object shown on screen
   - You'll need to add this to the application

## Application Setup

1. **Update Firebase Configuration**

   - Open `frontend/src/firebase/firebase.js`
   - Replace the placeholder values with your actual Firebase configuration:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_ACTUAL_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

2. **Run the Application**
   - Install dependencies: `cd frontend && npm install`
   - Start the development server: `npm start`
   - Open http://localhost:3000 in your browser

## Firestore Data Structure

The application uses the following data structure in Firestore:

```javascript
// Collection: diveSites
{
  "id": "auto-generated-document-id",
  "siteName": "Blue Hole",
  "location": "Belize City",
  "latitude": 17.3156,
  "longitude": -87.5346,
  "date": Timestamp,
  "notes": "Amazing dive with clear visibility",
  "createdAt": Timestamp
}
```

## Security Rules

For the MVP, we're using simple security rules that allow anyone to read and write data:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /diveSites/{diveSite} {
      allow read, write: if true;
    }
  }
}
```

When moving to production, you should implement proper authentication and more restrictive security rules.
