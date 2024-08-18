// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Management from "./screens/Management";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login"; // Ensure this matches the file name
import AddData from "./screens/AddData"; // Use AddData instead of Customer
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
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
          path="/add-data"
          element={
            <ProtectedRoute>
              <AddData /> {/* Use AddData component here */}
            </ProtectedRoute>
          }
        />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
};

export default App;