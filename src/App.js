import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Management from "./screens/Management";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import Customer from "./screens/Customer";
import AddBid from "./screens/AddBid"; // Import AddBid page
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
          <Route path="/" element={<AddBid />} /> {/* AddBid is now the home page */}
          <Route path="/add-bid" element={<AddBid />} /> {/* Optional route for AddBid */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/management"
            element={
              <ProtectedRoute>
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
