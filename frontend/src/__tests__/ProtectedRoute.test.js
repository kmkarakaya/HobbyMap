/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react';
import { render } from '@testing-library/react';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock the useFirebase hook so we can simulate auth states without the real
// FirebaseProvider (avoids importing firebase modules during tests).
jest.mock('../contexts/FirebaseContext', () => ({
  useFirebase: jest.fn(),
}));

const { useFirebase } = require('../contexts/FirebaseContext');

test('ProtectedRoute shows loading when auth not ready', () => {
  useFirebase.mockReturnValue({ isAuthReady: false, user: null });
  const { getByText } = render(
    <ProtectedRoute>
      <div>Secret</div>
    </ProtectedRoute>
  );

  expect(getByText(/Loading.../i)).toBeTruthy();
});

test('ProtectedRoute renders children when auth ready and user present', () => {
  useFirebase.mockReturnValue({ isAuthReady: true, user: { uid: 'test' } });
  const { getByText } = render(
    <ProtectedRoute>
      <div>Secret</div>
    </ProtectedRoute>
  );

  expect(getByText(/Secret/)).toBeTruthy();
});
