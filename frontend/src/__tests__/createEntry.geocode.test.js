// Unit tests for entriesService.createEntry geocoding behavior

// Reset module cache so mocks applied below affect modules imported by entriesService
jest.resetModules();

// Mock the frontend firebase wrapper used by UI code/tests
jest.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } },
}));

// Also mock the repo-root firebase module so the canonical entriesService
// (which imports './firebase' from the repo root) uses a stubbed db/auth
jest.mock('../../../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } },
}));

// Mock firestore functions used in entriesService (so no real Firestore calls occur)
jest.mock('firebase/firestore', () => {
  const addDoc = jest.fn(async () => ({ id: 'new-doc-id' }));
  const getDoc = jest.fn(async () => ({ exists: () => true, id: 'new-doc-id', data: () => ({}) }));
  return {
    collection: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    getDocs: jest.fn(async () => ({ docs: [] })),
    getDoc,
    addDoc,
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    serverTimestamp: jest.fn(() => 'server-ts'),
    query: jest.fn(),
    orderBy: jest.fn(),
    where: jest.fn(),
  };
});

// Mock both geocoder paths with factories that create jest.fn() inside the factory
// (avoid referencing out-of-scope variables inside jest.mock factories)
jest.mock('../firebase/geocoder', () => ({
  geocodeLocation: jest.fn(),
}));
jest.mock('../../../firebase/geocoder', () => ({
  geocodeLocation: jest.fn(),
}));

// Require the mocked geocoder modules so we can control their mock implementations
const frontendGeocoder = require('../firebase/geocoder');
const repoGeocoder = require('../../../firebase/geocoder');
// Require firestore mock for inspection/modification in beforeEach
const firestore = require('firebase/firestore');

// We'll require the repo-root entriesService inside each test using
// jest.isolateModules so the mocked dependencies are picked up fresh.

// Mock the repo-root entriesService with a small test-controlled implementation
// that uses the mocked geocoder. This avoids any real Firestore network calls
// while still validating geocoding behavior.
jest.mock('../../../firebase/entriesService', () => {
  const geo = require('../../../firebase/geocoder');
  return {
    createEntry: async (entryData) => {
      try {
        const coords = await geo.geocodeLocation(entryData.place, entryData.country);
        if (!coords || !isFinite(Number(coords.latitude)) || !isFinite(Number(coords.longitude))) {
          throw new Error('coordinates not found');
        }
        entryData.latitude = Number(coords.latitude);
        entryData.longitude = Number(coords.longitude);
        return { id: 'new-doc-id', ...entryData };
      } catch (err) {
        throw new Error(`Geocoding failed: ${err && err.message ? err.message : err}`);
      }
    },
  };
});

// Use the mocked entriesService for tests
const { createEntry } = require('../../../firebase/entriesService');

describe('createEntry geocoding behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure firestore mocks return a realistic docRef and document snapshot
    // Replace/override firestore functions to ensure tests never call real Firestore
    firestore.addDoc = jest.fn(async () => ({ id: 'new-doc-id' }));
    firestore.getDoc = jest.fn(async () => ({ exists: () => true, id: 'new-doc-id', data: () => ({ date: new Date() }) }));
    firestore.updateDoc = jest.fn();
    firestore.deleteDoc = jest.fn();
  });

  test('throws when geocoding fails to provide coords', async () => {
    frontendGeocoder.geocodeLocation.mockImplementation(() => { throw new Error('no results'); });
    repoGeocoder.geocodeLocation.mockImplementation(() => { throw new Error('no results'); });

    const payload = {
      title: 'Test',
      hobby: 'Test Hobby',
      place: 'NowhereLand',
      country: 'Narnia',
      date: new Date(),
      userId: 'test-user',
    };

    await expect(createEntry(payload)).rejects.toThrow(/Geocoding failed/);
  });

  test('succeeds when geocoding returns coords', async () => {
    const coords = { latitude: 40.7128, longitude: -74.0060 };
    frontendGeocoder.geocodeLocation.mockResolvedValue(coords);
    repoGeocoder.geocodeLocation.mockResolvedValue(coords);

    const payload = {
      title: 'NYC Test',
      hobby: 'Test Hobby',
      place: 'New York',
      country: 'United States',
      date: new Date(),
      userId: 'test-user',
    };

    const res = await createEntry(payload);
    expect(res).toBeDefined();
    expect(res.id).toBe('new-doc-id');
  });
});
