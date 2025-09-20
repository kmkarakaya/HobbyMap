import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

const ProtectedRoute = ({ children }) => {
  const { user, isAuthReady } = useFirebase();

  // If we haven't yet received the initial auth state, show a loading placeholder
  if (!isAuthReady) return <div>Loading...</div>;

  // If auth is ready but user not present, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
