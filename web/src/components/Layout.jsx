import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', minPerfil: 'funcionario' },
    { path: '/items', label: 'Itens', icon: '📦', minPerfil: 'almoxarife' }, // Apenas almoxarife+
    { path: '/categories', label: 'Categorias', icon: '🏷️', minPerfil: 'almoxarife' }, // Apenas almoxarife+
    { path: '/storage', label: 'Locais', icon: '📍', minPerfil: 'almoxarife' }, // Apenas almoxarife+
    { path: '/obras', label: 'Obras', icon: '🏗️', minPerfil: 'gestor' }, // Apenas gestor+
    { path: '/transfers', label: 'Transferências', icon: '🔄', minPerfil: 'funcionario' },
    { path: '/scanner', label: 'Escanear QR', icon: '📷', minPerfil: 'funcionario' },
    { path: '/notifications', label: 'Notificações', icon: '🔔', badge: true, minPerfil: 'funcionario' },
    { path: '/history', label: 'Histórico', icon: '📋', minPerfil: 'funcionario' },
    { path: '/users', label: 'Usuários', icon: '👥', minPerfil: 'admin' }, // Apenas admin
    { path: '/settings', label: 'Configurações', icon: '⚙️', minPerfil: 'gestor' }, // Apenas gestor+ (criar convites)
  ];

  useEffect(() => {
    // Fetch unread notifications count
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch (error) {
        // Silenciar erro se tabela não existir ainda
        console.debug('Notificações não disponíveis:', error.message);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hierarquia de perfis: admin > gestor > almoxarife > funcionario
  const perfilHierarchy = {
    'funcionario': 0,
    'almoxarife': 1,
    'gestor': 2,
    'admin': 3,
  };

  const hasPermission = (minPerfil) => {
    if (!user?.perfil || !minPerfil) return false;
    return perfilHierarchy[user.perfil] >= perfilHierarchy[minPerfil];
  };

  const visibleMenuItems = menuItems.filter(item =>
    hasPermission(item.minPerfil)
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
                position: 'relative',
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
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {item.badge && unreadCount > 0 && (
                <span style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.125rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  minWidth: '20px',
                  textAlign: 'center',
                }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}

          {/* Link do Super Admin - apenas para superadmins */}
          {user?.is_superadmin && (
            <Link
              to="/superadmin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                color: 'white',
                textDecoration: 'none',
                backgroundColor: location.pathname === '/superadmin' ? '#374151' : 'transparent',
                transition: 'background-color 0.2s',
                position: 'relative',
                borderTop: '1px solid #374151',
                marginTop: '0.5rem',
              }}
              onMouseEnter={(e) => {
                if (location.pathname !== '/superadmin') {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== '/superadmin') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>🔐</span>
              {sidebarOpen && (
                <span style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 'bold'
                }}>
                  Super Admin
                </span>
              )}
            </Link>
          )}
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
