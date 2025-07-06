import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Login } from './components/Login';
import { Register } from './components/Register';
import Chat from './components/Chat';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <Register />} 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />} 
        />
      </Routes>
    </div>
  );
}

export { App };
export default App;
