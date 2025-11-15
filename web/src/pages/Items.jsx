import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import ImportModal from '../components/ImportModal';

export default function Items() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria_id: '',
    local_armazenamento_id: '',
    estado: '',
    lowStockOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    lacre: '',
    quantidade: 0,
    categoria_id: '',
    local_armazenamento_id: '',
    estado: 'disponivel',
    marca_modelo: '',
    metragem: '',
    unidade: 'UN',
    estoque_minimo: 0,
    valor_unitario: '',
    data_saida: '',
    data_retorno: '',
    data_aquisicao: '',
    observacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when filters or search change
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [filters.categoria_id, filters.estado, searchTerm]);

  const loadData = async () => {
    try {
      // Build query params for filters
      const params = new URLSearchParams();
      if (filters.categoria_id) params.append('categoria_id', filters.categoria_id);
      if (filters.estado) params.append('estado', filters.estado);
      if (searchTerm) params.append('search', searchTerm);
      params.append('limit', '1000');

      const [itemsRes, categoriesRes, storageRes] = await Promise.all([
        api.get(`/items?${params.toString()}`),
        api.get('/categories'),
        api.get('/storage'),
      ]);
      setItems(itemsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
      setStorageLocations(storageRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem.id}`, formData);
      } else {
        await api.post('/items', formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        nome: '',
        codigo: '',
        lacre: '',
        quantidade: 0,
        categoria_id: '',
        local_armazenamento_id: '',
        estado: 'disponivel',
        marca_modelo: '',
        metragem: '',
        unidade: 'UN',
        estoque_minimo: 0,
        valor_unitario: '',
        data_saida: '',
        data_retorno: '',
        data_aquisicao: '',
        observacao: '',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      alert(error.response?.data?.message || 'Erro ao salvar item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nome: item.nome,
      codigo: item.codigo || '',
      lacre: item.lacre || '',
      quantidade: item.quantidade,
      categoria_id: item.categoria_id || '',
      local_armazenamento_id: item.local_armazenamento_id || '',
      estado: item.estado,
      marca_modelo: item.marca_modelo || '',
      metragem: item.metragem || '',
      unidade: item.unidade || 'UN',
      estoque_minimo: item.estoque_minimo || 0,
      valor_unitario: item.valor_unitario || '',
      data_saida: item.data_saida || '',
      data_retorno: item.data_retorno || '',
      data_aquisicao: item.data_aquisicao || '',
      observacao: item.observacao || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      await api.delete(`/items/${id}`);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      alert('Erro ao excluir item');
    }
  };

  const filteredItems = items.filter(item => {
    // Filter by storage location (client-side)
    if (filters.local_armazenamento_id && item.local_armazenamento_id != filters.local_armazenamento_id) {
      return false;
    }

    // Filter by low stock only
    if (filters.lowStockOnly) {
      const estoqueMinimo = item.estoque_minimo || 0;
      if (estoqueMinimo === 0 || item.quantidade > estoqueMinimo) {
        return false;
      }
    }

    return true;
  });

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            📦 Gerenciamento de Itens
          </h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowImportModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              📥 Importar Excel
            </button>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  nome: '',
                  codigo: '',
                  lacre: '',
                  quantidade: 0,
                  categoria_id: '',
                  local_armazenamento_id: '',
                  estado: 'disponivel',
                  marca_modelo: '',
                  metragem: '',
                  unidade: 'UN',
                  estoque_minimo: 0,
                  valor_unitario: '',
                  data_saida: '',
                  data_retorno: '',
                  data_aquisicao: '',
                  observacao: '',
                });
                setShowModal(true);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
              }}
            >
              + Novo Item
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Buscar por nome, código ou lacre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Filter Toggle Button */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: showFilters ? '#2563eb' : '#f3f4f6',
              color: showFilters ? 'white' : '#1f2937',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {showFilters ? '🔽' : '▶️'} Filtros Avançados
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Categoria
                </label>
                <select
                  value={filters.categoria_id}
                  onChange={(e) => setFilters({ ...filters, categoria_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Local de Armazenamento
                </label>
                <select
                  value={filters.local_armazenamento_id}
                  onChange={(e) => setFilters({ ...filters, local_armazenamento_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Todos os locais</option>
                  {storageLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.codigo} - {loc.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Todos os estados</option>
                  <option value="disponivel">Disponível</option>
                  <option value="emprestado">Emprestado</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={filters.lowStockOnly}
                    onChange={(e) => setFilters({ ...filters, lowStockOnly: e.target.checked })}
                    style={{ cursor: 'pointer' }}
                  />
                  Estoque baixo apenas
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setFilters({
                    categoria_id: '',
                    local_armazenamento_id: '',
                    estado: '',
                    lowStockOnly: false,
                  });
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Limpar Filtros
              </button>
            </div>

            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f3f4f6',
              borderRadius: '6px',
              fontSize: '0.875rem',
              color: '#6b7280',
            }}>
              Mostrando {filteredItems.length} de {items.length} itens
            </div>
          </div>
        )}

        {/* Items Table */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Carregando...
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              Nenhum item encontrado
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Nome
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Código Interno
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Lacre/N° Série
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Quantidade
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Categoria
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Local
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Estado
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937', fontWeight: '500' }}>
                      {item.nome}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.codigo || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: item.lacre ? '#2563eb' : '#9ca3af', fontWeight: item.lacre ? '600' : 'normal' }}>
                      {item.lacre || '-'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: item.quantidade < 10 ? '#ef4444' : '#10b981' }}>
                      {item.quantidade}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.categoria_nome || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {item.local_codigo || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          backgroundColor:
                            item.estado === 'disponivel' || item.estado === 'disponivel_estoque' ? '#d1fae5' :
                            item.estado === 'com_funcionario' ? '#dbeafe' :
                            item.estado === 'pendente_aceitacao' || item.estado === 'em_transito' ? '#fef3c7' :
                            '#fee2e2',
                          color:
                            item.estado === 'disponivel' || item.estado === 'disponivel_estoque' ? '#065f46' :
                            item.estado === 'com_funcionario' ? '#1e40af' :
                            item.estado === 'pendente_aceitacao' || item.estado === 'em_transito' ? '#92400e' :
                            '#991b1b',
                          display: 'inline-block',
                        }}>
                          {item.estado === 'disponivel_estoque' ? 'Estoque' :
                           item.estado === 'com_funcionario' ? 'Com Funcionário' :
                           item.estado === 'pendente_aceitacao' ? 'Pendente' :
                           item.estado === 'em_transito' ? 'Em Trânsito' :
                           item.estado}
                        </span>
                        {/* Mostrar detalhes adicionais */}
                        {item.funcionario_nome && (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            👤 {item.funcionario_nome}
                          </span>
                        )}
                        {(item.estado === 'disponivel_estoque' || item.localizacao_tipo === 'almoxarifado') && (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            🏪 Almoxarifado
                          </span>
                        )}
                        {item.obra_nome && (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            🏗️ {item.obra_nome}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
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
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
              {editingItem ? 'Editar Item' : 'Novo Item'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Código Interno (opcional)
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: CABO-001, FIO-123"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                  Use para identificar tipos/grupos de itens em estoque
                </small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Lacre / Número de Série (opcional)
                </label>
                <input
                  type="text"
                  value={formData.lacre}
                  onChange={(e) => {
                    const newLacre = e.target.value;
                    setFormData({
                      ...formData,
                      lacre: newLacre,
                      // Se adicionar lacre, força quantidade = 1
                      quantidade: newLacre ? 1 : formData.quantidade
                    });
                  }}
                  placeholder="Ex: LAC-001, NS-456789"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
                <small style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                  Use para identificar itens individuais/únicos (deve ser único por categoria)
                </small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Quantidade *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
                  disabled={!!formData.lacre}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    backgroundColor: formData.lacre ? '#f3f4f6' : 'white',
                    cursor: formData.lacre ? 'not-allowed' : 'text',
                  }}
                />
                {formData.lacre && (
                  <small style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                    Itens com lacre são considerados individuais (quantidade = 1)
                  </small>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Categoria
                </label>
                <select
                  value={formData.categoria_id}
                  onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Selecione...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Local de Armazenamento
                </label>
                <select
                  value={formData.local_armazenamento_id}
                  onChange={(e) => setFormData({ ...formData, local_armazenamento_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Selecione...</option>
                  {storageLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.codigo} - {loc.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="disponivel">Disponível</option>
                  <option value="emprestado">Emprestado</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Marca/Modelo
                </label>
                <input
                  type="text"
                  value={formData.marca_modelo}
                  onChange={(e) => setFormData({ ...formData, marca_modelo: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Metragem
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.metragem}
                    onChange={(e) => setFormData({ ...formData, metragem: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Unidade
                  </label>
                  <select
                    value={formData.unidade}
                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="M">Metro (M)</option>
                    <option value="M2">Metro² (M2)</option>
                    <option value="M3">Metro³ (M3)</option>
                    <option value="L">Litro (L)</option>
                    <option value="PC">Peça (PC)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Valor Unitário (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor_unitario}
                    onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Data de Aquisição
                </label>
                <input
                  type="date"
                  value={formData.data_aquisicao}
                  onChange={(e) => setFormData({ ...formData, data_aquisicao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Data de Saída
                  </label>
                  <input
                    type="date"
                    value={formData.data_saida}
                    onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Data de Retorno
                  </label>
                  <input
                    type="date"
                    value={formData.data_retorno}
                    onChange={(e) => setFormData({ ...formData, data_retorno: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Observações
                </label>
                <textarea
                  rows="3"
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          type="items"
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            loadData();
          }}
        />
      )}
    </Layout>
  );
}
