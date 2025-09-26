/*
Firestore migration script: migrate documents from collection `diveSites` -> `entries`.

Usage:
  - Install admin SDK: npm install firebase-admin
  - Provide a Firebase service account key JSON file and set GOOGLE_APPLICATION_CREDENTIALS env var
    or run this against the Firebase emulator (set FIRESTORE_EMULATOR_HOST)

Dry-run mode (default): prints planned changes without writing
  node scripts/migrate-diveSites-to-entries.js --dry
Apply mode: performs the migration
  node scripts/migrate-diveSites-to-entries.js --apply

Options:
  --preserve-ids  : when applying, preserve original document IDs in the new collection (default true)
  --batch-size=N  : number of documents to write per batch (default 500)

Behavior:
  - Reads all documents from `diveSites`
  - Maps fields:
      siteName -> title (if present)
      hobby (if missing) -> 'general'
      place, country, date, notes, lat, lng, userId -> preserved
  - Writes transformed documents into `entries` (by default preserving doc IDs)
  - In dry-run prints a summary and first 10 planned transforms

Safety:
  - This script does NOT delete the original documents. After verification you can delete them manually.
  - Test against the Firestore emulator before running on production.
*/

const admin = require('firebase-admin');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2));

const DRY_RUN = argv.apply ? false : true;
const PRESERVE_IDS = argv['preserve-ids'] !== undefined ? (argv['preserve-ids'] === 'false' ? false : true) : true;
const BATCH_SIZE = argv['batch-size'] ? parseInt(argv['batch-size'], 10) : 500;

async function main() {
  // Initialize admin SDK. Use default credentials (GOOGLE_APPLICATION_CREDENTIALS) or emulator
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.FIRESTORE_EMULATOR_HOST) {
    console.warn('No GOOGLE_APPLICATION_CREDENTIALS or FIRESTORE_EMULATOR_HOST set. Please set one to run this script.');
    process.exit(1);
  }

  admin.initializeApp();
  const db = admin.firestore();

  console.log(`Starting migration: dryRun=${DRY_RUN}, preserveIds=${PRESERVE_IDS}, batchSize=${BATCH_SIZE}`);

  const srcCol = db.collection('diveSites');
  const dstCol = db.collection('entries');

  const snapshot = await srcCol.get();
  console.log(`Found ${snapshot.size} documents in 'diveSites'`);

  if (snapshot.empty) {
    console.log('No documents to migrate. Exiting.');
    return;
  }

  const transforms = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const transformed = Object.assign({}, data);
    // Map siteName -> title
    if (data.siteName && !data.title) transformed.title = data.siteName;
    // Ensure hobby exists
    if (!transformed.hobby) transformed.hobby = 'general';
    // Keep lat/lng if nested under location
    if (!transformed.lat && data.location && data.location.lat) transformed.lat = data.location.lat;
    if (!transformed.lng && data.location && data.location.lng) transformed.lng = data.location.lng;
    // Keep date formatting as-is
    // Ensure userId exists (for rules)
    if (!transformed.userId) transformed.userId = data.user || data.uid || null;

    transforms.push({ id: doc.id, data: transformed });
  });

  console.log('Sample planned transforms (first 10):');
  transforms.slice(0, 10).forEach(t => {
    console.log(`- ${t.id} -> fields: ${Object.keys(t.data).join(', ')}`);
  });

  if (DRY_RUN) {
    console.log('\nDry-run mode: no writes performed. Rerun with --apply to perform migration.');
    return;
  }

  // Apply in batches
  let batch = db.batch();
  let ops = 0;
  for (let i = 0; i < transforms.length; i++) {
    const t = transforms[i];
    const ref = PRESERVE_IDS ? dstCol.doc(t.id) : dstCol.doc();
    batch.set(ref, t.data, { merge: false });
    ops++;
    if (ops >= BATCH_SIZE) {
      await batch.commit();
      console.log(`Committed ${ops} writes`);
      batch = db.batch();
      ops = 0;
    }
  }
  if (ops > 0) {
    await batch.commit();
    console.log(`Committed final ${ops} writes`);
  }

  console.log('Migration complete. Note: original documents in diveSites were not deleted.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
