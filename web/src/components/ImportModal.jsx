import React, { useState } from 'react';
import api from '../services/api';

export default function ImportModal({ type, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const typeConfig = {
    categories: {
      title: 'Importar Categorias',
      endpoint: '/import/categories',
      templateHeaders: ['nome', 'icone'],
      example: [
        { nome: 'Ferramentas', icone: '🔧' },
        { nome: 'Materiais Elétricos', icone: '⚡' },
        { nome: 'EPIs', icone: '🦺' },
      ],
    },
    storage: {
      title: 'Importar Locais',
      endpoint: '/import/storage',
      templateHeaders: ['codigo', 'descricao', 'tipo', 'capacidade', 'setor'],
      example: [
        { codigo: 'DEP-01', descricao: 'Depósito Principal', tipo: 'deposito', capacidade: 1000, setor: 'Geral' },
        { codigo: 'EST-A1', descricao: 'Estante A1', tipo: 'estante', capacidade: 50, setor: 'Ferramentas' },
      ],
    },
    items: {
      title: 'Importar Itens',
      endpoint: '/import/items',
      templateHeaders: ['nome', 'codigo', 'quantidade', 'categoria', 'local', 'estado', 'marca_modelo', 'unidade', 'estoque_minimo', 'valor_unitario'],
      example: [
        { nome: 'Martelo', codigo: 'MART-001', quantidade: 10, categoria: 'Ferramentas', local: 'DEP-01', estado: 'disponivel_estoque', marca_modelo: 'Tramontina', unidade: 'UN', estoque_minimo: 5, valor_unitario: 45.90 },
        { nome: 'Capacete de Segurança', codigo: 'CAP-001', quantidade: 20, categoria: 'EPIs', local: 'EST-A1', estado: 'disponivel_estoque', marca_modelo: 'Vonder', unidade: 'UN', estoque_minimo: 10, valor_unitario: 35.00 },
      ],
    },
  };

  const config = typeConfig[type];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(config.endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      if (res.data.success) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erro ao importar arquivo',
        data: error.response?.data?.data,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Criar um CSV simples
    const headers = config.templateHeaders.join(',');
    const rows = config.example.map(row =>
      config.templateHeaders.map(h => row[h] || '').join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}.csv`;
    link.click();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
          {config.title}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Selecione o arquivo Excel (.xlsx, .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            color: '#6b7280',
          }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#1f2937' }}>
              Formato esperado:
            </strong>
            <p style={{ marginBottom: '0.5rem' }}>
              Colunas: <code style={{ backgroundColor: 'white', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>
                {config.templateHeaders.join(', ')}
              </code>
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                marginTop: '0.5rem',
              }}
            >
              📥 Baixar Modelo CSV
            </button>
          </div>

          {result && (
            <div style={{
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              backgroundColor: result.success ? '#d1fae5' : '#fee2e2',
              color: result.success ? '#065f46' : '#991b1b',
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                {result.message}
              </strong>
              {result.data && (
                <div style={{ fontSize: '0.875rem' }}>
                  <div>Total: {result.data.total}</div>
                  <div>Importados: {result.data.success}</div>
                  <div>Erros: {result.data.errors?.length || 0}</div>
                  {result.data.errors && result.data.errors.length > 0 && (
                    <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflow: 'auto' }}>
                      <strong>Erros encontrados:</strong>
                      <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem' }}>
                        {result.data.errors.slice(0, 10).map((err, idx) => (
                          <li key={idx}>Linha {err.linha}: {err.erro}</li>
                        ))}
                        {result.data.errors.length > 10 && (
                          <li>... e mais {result.data.errors.length - 10} erros</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {result?.success ? 'Fechar' : 'Cancelar'}
            </button>
            {!result?.success && (
              <button
                type="submit"
                disabled={loading || !file}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: loading || !file ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || !file ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                {loading ? 'Importando...' : 'Importar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
