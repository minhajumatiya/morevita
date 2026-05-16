import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Admin from './Admin.jsx';
import Login from './Login.jsx';
import './index.css';

// --- ROUTE GUARD (Security Check) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  // Agar token NAHI hai, toh sidha login par bhej do
  if (!token || token === "") {
    return <Navigate to="/login" replace />;
  }

  // Agar token hai, toh hi Admin page dikhao
  return children;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Sabse important: path="/*" hona chahiye taaki App.jsx ke routes chalein */}
        <Route path="/*" element={<App />} />

        {/* Admin Login */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);