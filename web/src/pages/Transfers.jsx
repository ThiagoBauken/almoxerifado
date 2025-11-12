import React from 'react';
import Layout from '../components/Layout';

export default function Transfers() {
  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          🔄 Transferências
        </h1>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#6b7280' }}>
            Funcionalidade de transferências em desenvolvimento
          </p>
        </div>
      </div>
    </Layout>
  );
}
