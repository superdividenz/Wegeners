import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Management from "./screens/Management";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";
import Customer from "./screens/Customer";
import AddBid from "./screens/AddSchedule";
import SubcontractorForm from "./screens/Subs"; 
import Unauthorized from "./screens/Unauthorized"; 

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<AddBid />} />
          <Route path="/add-bid" element={<AddBid />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subcontractor" element={<SubcontractorForm />} /> 
          <Route path="/unauthorized" element={<Unauthorized />} /> 

          <Route
            path="/management"
            element={
              <ProtectedRoute>
                <Management />
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
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
