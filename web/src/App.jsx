import React from 'react';

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '500px'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>
          🏢 Sistema Almoxarifado
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Dashboard Web em Desenvolvimento
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '0.9rem', color: '#1e40af', margin: 0 }}>
            ✅ Backend API funcionando
          </p>
        </div>
        <a
          href="/api"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#2563eb',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '6px',
            marginTop: '1rem'
          }}
        >
          Acessar API
        </a>
      </div>
    </div>
  );
}

export default App;
