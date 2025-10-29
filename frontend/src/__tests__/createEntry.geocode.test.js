// Unit tests for entriesService.createEntry geocoding behavior

jest.mock('../firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-user' } },
}));

// Mock firestore functions used in entriesService
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  getDocs: jest.fn(),
  getDoc: jest.fn(async () => ({ exists: () => true, data: () => ({}) })),
  addDoc: jest.fn(async () => ({ id: 'new-doc-id' })),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'server-ts'),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
}));

// Mock the geocoder module
jest.mock('../firebase/geocoder', () => ({
  geocodeLocation: jest.fn(),
}));

const { createEntry } = require('../firebase/entriesService');
const { geocodeLocation } = require('../firebase/geocoder');

describe('createEntry geocoding behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure firestore mocks return a realistic docRef and document snapshot
    const firestore = require('firebase/firestore');
    if (firestore.addDoc) {
      firestore.addDoc.mockResolvedValue({ id: 'new-doc-id' });
    }
    if (firestore.getDoc) {
      firestore.getDoc.mockResolvedValue({ exists: () => true, id: 'new-doc-id', data: () => ({ date: new Date() }) });
    }
  });

  test('throws when geocoding fails to provide coords', async () => {
    geocodeLocation.mockImplementation(() => { throw new Error('no results'); });

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
    geocodeLocation.mockResolvedValue({ latitude: 40.7128, longitude: -74.0060 });

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
