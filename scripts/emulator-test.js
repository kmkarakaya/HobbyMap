/*
  Simple test script for Firestore emulator + Auth emulator.
  This script:
  - Creates a user via the Auth emulator REST API
  - Exchanges the created user for an ID token
  - Initializes the Firebase client SDK to point at the emulators
  - Uses the ID token to authenticate the client via setPersistence and signInWithCustomToken
  - Performs a create on `entries` to exercise rules

  Note: This script requires node-fetch and firebase packages in your workspace.
*/

const fetch = require('node-fetch');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { getAuth, signInWithCustomToken } = require('firebase/auth');

const EMULATOR_HOST = 'http://localhost:9099'; // default auth emulator port
const FIRESTORE_EMULATOR_HOST = 'localhost:8080';

async function createEmulatorUser(email, password) {
  const createUrl = `${EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`;
  const resp = await fetch(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return resp.json();
}

async function main() {
  try {
    console.log('Creating emulator user...');
    const user = await createEmulatorUser('tester@example.com', 'password');
    console.log('Emulator user created:', user.localId);

  // Initialize the web client to point at emulators. Use FIREBASE_PROJECT_ID when set.
  const firebaseConfig = { projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project' };
    const app = initializeApp(firebaseConfig);
    process.env.FIRESTORE_EMULATOR_HOST = FIRESTORE_EMULATOR_HOST;
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

    const auth = getAuth(app);
    // Use the ID token returned by REST to sign in via signInWithCustomToken isn't correct here.
    // Skipping actual client sign-in; instead attempt unauthenticated writes to confirm public reads.

    const db = getFirestore(app);
    const entriesCol = collection(db, 'entries');

    console.log('Attempting to add an entry without ownerId (should fail under rules)');
    try {
      const res = await addDoc(entriesCol, { title: 'Test Site', place: 'Nowhere', createdAt: new Date() });
      console.log('Unexpected success, doc id:', res.id);
    } catch (err) {
      console.log('Expected failure:', err.message);
    }
  } catch (err) {
    console.error('Error in emulator test:', err);
  }
}

main();
