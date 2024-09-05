// RoleProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser || userRole !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default RoleProtectedRoute;