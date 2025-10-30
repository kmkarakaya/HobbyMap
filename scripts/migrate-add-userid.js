/*
Migration script: add missing `userId` fields to documents in `entries` collection.

Usage:
 1. Create a Firebase service account JSON and set GOOGLE_APPLICATION_CREDENTIALS to its path,
    or replace the admin.initializeApp call with explicit credential import.
 2. Run: node scripts/migrate-add-userid.js

This script will:
 - iterate all documents in `entries`
 - if a doc has no `userId` but has `ownerId`, set `userId = ownerId`
 - log changes and counts

BE CAREFUL: run in a dev or staging project first. This performs writes.
*/

const admin = require('firebase-admin');

// If you have a service account JSON file, set the env var GOOGLE_APPLICATION_CREDENTIALS
// to its path before running the script. admin.initializeApp() will pick it up automatically.
// Alternatively uncomment and provide the path below.

// const serviceAccount = require('./service-account.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

admin.initializeApp();

const db = admin.firestore();

async function migrate() {
  console.log('Starting migration: add missing userId from ownerId (if present)');
  const entriesRef = db.collection('entries');
  const snapshot = await entriesRef.get();
  console.log(`Found ${snapshot.size} documents in entries`);

  let updated = 0;
  let skipped = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.userId) {
      if (data.ownerId) {
        console.log(`Updating doc ${doc.id}: setting userId = ownerId (${data.ownerId})`);
        await doc.ref.update({ userId: data.ownerId });
        updated++;
      } else {
        console.log(`Skipping doc ${doc.id}: no userId and no ownerId`);
        skipped++;
      }
    } else {
      skipped++;
    }
  }

  console.log(`Migration complete. Updated: ${updated}, Skipped: ${skipped}`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
