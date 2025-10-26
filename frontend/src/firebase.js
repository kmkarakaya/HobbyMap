// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
// Allow overriding config via environment variables (REACT_APP_FIREBASE_*) so
// we can switch projects in CI without committing new keys. Falls back to the
// existing project's values for local development if the env vars are missing.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD8TkQPGHAxgymcRfdPbWcqB9Z1bk-rRLY",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "hobbyonmap.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "hobbyonmap",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "hobbyonmap.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "903050806873",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:903050806873:web:d9c45fc98b80385d9f5348",
  // Optional measurement id (used by analytics if enabled)
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-MXD8BREPSF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export named bindings for other modules
export { app, db, auth };
