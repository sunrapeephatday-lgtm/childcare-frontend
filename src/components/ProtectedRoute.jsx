import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const rawUser = sessionStorage.getItem('user');
  if (!rawUser) return <Navigate to="/login" replace />;
  const user = JSON.parse(rawUser);
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // unauthorized
    return <Navigate to="/" replace />;
  }
  return children;
}
