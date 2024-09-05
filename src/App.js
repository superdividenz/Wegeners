import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Management from "./screens/Management";
import Login from "./screens/Login";
import Customer from "./screens/Customer";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./context/RoleProtectedRoute";
import AdminRoleAssignment from "./context/AdminRoleAssignment";
import { AuthProvider } from "./context/AuthContext";
import SharedJobView from "./screens/Addon/SharedJobView";
import SharedDayJobsView from "./screens/Addon/SharedDayJobsView"; // Import the new component
import Dashboard from './screens/Dashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/management"
            element={
              <RoleProtectedRoute requiredRole="admin">
                <Management />
              </RoleProtectedRoute>
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
          <Route path="/share/:shareId" element={<SharedJobView />} />
          <Route path="/share-day/:shareId" element={<SharedDayJobsView />} /> 
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;