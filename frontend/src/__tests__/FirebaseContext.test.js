/* eslint-disable testing-library/prefer-screen-queries, testing-library/prefer-find-by */
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { FirebaseProvider, useFirebase } from '../contexts/FirebaseContext';

// A tiny consumer component that shows auth-ready/user info
const Consumer = () => {
  const { isAuthReady, user } = useFirebase();
  return (
    <div>
      <div>ready:{isAuthReady ? 'yes' : 'no'}</div>
      <div>user:{user ? user.uid : 'null'}</div>
    </div>
  );
};

test('FirebaseProvider exposes isAuthReady after initialization', async () => {
  const { getByText } = render(
    <FirebaseProvider>
      <Consumer />
    </FirebaseProvider>
  );

  // Initially, provider shows initializing text
  expect(getByText(/Initializing authentication/i)).toBeTruthy();

  // Wait a short amount — onAuthStateChanged should run and then the provider
  // will render children. We assert that children eventually appear.
  await waitFor(() => getByText(/ready:/i));
});
