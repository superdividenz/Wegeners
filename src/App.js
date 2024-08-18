import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebase';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './screens/Dashboard';
import AddData from './screens/addData'; 
import Management from './screens/Management';
import Management2 from './screens/Management2';

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/management" 
            element={
              <ProtectedRoute>
                <Management />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/management2" 
            element={
              <ProtectedRoute>
                <Management2 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/add-data" 
            element={
              <ProtectedRoute>
                <AddData />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;