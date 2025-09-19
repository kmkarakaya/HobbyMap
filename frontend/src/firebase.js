// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpbR2s0_iKTT-mXHFd6_t8a5-VlAG5gH8",
  authDomain: "hobbymap-scuba-dive.firebaseapp.com",
  projectId: "hobbymap-scuba-dive",
  storageBucket: "hobbymap-scuba-dive.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "155802485714",
  appId: "1:155802485714:web:e1e707d384cf9a03bf7e0b",
};

// Initialize Firebase with error handling
console.log("Initializing Firebase with config:", firebaseConfig);
let app, db;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized:", app);

  db = getFirestore(app);
  console.log("Firestore initialized:", db);

  // Test that db is accessible
  if (!db) {
    console.error("Firebase DB is undefined after initialization!");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
  console.error("Stack trace:", error.stack);
  // Create dummy objects to prevent crashes, though the app won't work without Firebase
  app = {};
  db = {};
}

export { app, db };
