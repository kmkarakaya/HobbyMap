// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBpbR2s0_iKTT-mXHFd6_t8a5-VlAG5gH8",
  authDomain: "hobbymap-scuba-dive.firebaseapp.com",
  projectId: "hobbymap-scuba-dive",
  storageBucket: "hobbymap-scuba-dive.firebasestorage.app",
  messagingSenderId: "155802485714",
  appId: "1:155802485714:web:e1e707d384cf9a03bf7e0b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
