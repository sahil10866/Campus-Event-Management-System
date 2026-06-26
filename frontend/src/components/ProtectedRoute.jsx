// src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  // Grab the user's role from local storage
  const userRole = localStorage.getItem('userRole');

  // DYNAMIC THEMING: Change the whole UI style based on role with NO extra component edits!
  useEffect(() => {
    if (userRole) {
      document.documentElement.setAttribute('data-theme', userRole);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [userRole]);

  // 1. If they have no role (not logged in), send them to the login screen
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // 2. If this page requires specific roles, and the user doesn't have one of them
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Kick them back to their correct home page
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'organizer') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/student" replace />;
  }

  // 3. If they pass all checks, allow them to see the page!
  return children;
}