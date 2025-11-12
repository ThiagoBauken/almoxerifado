import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/items', label: 'Itens', icon: '📦' },
    { path: '/categories', label: 'Categorias', icon: '🏷️' },
    { path: '/storage', label: 'Locais', icon: '📍' },
    { path: '/obras', label: 'Obras', icon: '🏗️' },
    { path: '/transfers', label: 'Transferências', icon: '🔄' },
    { path: '/history', label: 'Histórico', icon: '📋' },
    { path: '/users', label: 'Usuários', icon: '👥', adminOnly: true },
    { path: '/settings', label: 'Configurações', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleMenuItems = menuItems.filter(item =>
    !item.adminOnly || user?.perfil === 'admin'
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '250px' : '70px',
        backgroundColor: '#1f2937',
        color: 'white',
        transition: 'width 0.3s',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{
          padding: '1rem',
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {sidebarOpen && (
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>
              🏢 Almoxarifado
            </h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.5rem',
            }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {visibleMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: location.pathname === item.path ? '#374151' : 'transparent',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #374151' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{user?.nome}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{user?.perfil}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {sidebarOpen ? 'Sair' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
