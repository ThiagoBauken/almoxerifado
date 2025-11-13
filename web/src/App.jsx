import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Items from './pages/Items';
import Categories from './pages/Categories';
import Storage from './pages/Storage';
import Obras from './pages/Obras';
import Transfers from './pages/Transfers';
import History from './pages/History';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AcceptInvite from './pages/AcceptInvite';
import Notifications from './pages/Notifications';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            ⚙️
          </div>
          <p style={{ color: '#6b7280' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
          }}>
            ⚙️
          </div>
          <p style={{ color: '#6b7280' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" /> : <Landing />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/invite/:token" element={<AcceptInvite />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/items" element={<PrivateRoute><Items /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
          <Route path="/storage" element={<PrivateRoute><Storage /></PrivateRoute>} />
          <Route path="/obras" element={<PrivateRoute><Obras /></PrivateRoute>} />
          <Route path="/transfers" element={<PrivateRoute><Transfers /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
