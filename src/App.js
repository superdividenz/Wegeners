// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Removed Navigate
import Header from "./components/Header";
import Management from "./screens/Management";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import Customer from "./screens/Customer";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./context/RoleProtectedRoute";
import AdminRoleAssignment from "./context/AdminRoleAssignment";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} /> {/* Add this line */}
          <Route
            path="/management"
            element={
              <ProtectedRoute> {/* Ensure user is authenticated */}
                <RoleProtectedRoute requiredRole="admin">
                  <Management />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer"
            element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-assign-role"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <AdminRoleAssignment />
              </RoleProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;