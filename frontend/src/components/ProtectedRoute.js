import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useFirebase();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
