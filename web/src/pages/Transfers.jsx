import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Transfers() {
  const [items, setItems] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    item_id: '',
    local_to_id: '',
    quantidade: 1,
    observacao: '',
  });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, storageRes] = await Promise.all([
        api.get('/items'),
        api.get('/storage'),
      ]);
      setItems(itemsRes.data.data || []);
      setStorageLocations(storageRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId) => {
    const item = items.find(i => i.id === parseInt(itemId));
    setSelectedItem(item);
    setFormData({
      ...formData,
      item_id: itemId,
      quantidade: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert('Selecione um item');
      return;
    }

    if (!formData.local_to_id) {
      alert('Selecione o local de destino');
      return;
    }

    if (selectedItem.local_armazenamento_id === parseInt(formData.local_to_id)) {
      alert('O local de destino não pode ser o mesmo que o local atual');
      return;
    }

    if (formData.quantidade > selectedItem.quantidade) {
      alert('Quantidade maior que a disponível');
      return;
    }

    try {
      // Registrar movimentação
      await api.post('/movimentacoes', {
        item_id: formData.item_id,
        tipo: 'transferencia',
        quantidade: formData.quantidade,
        local_from_id: selectedItem.local_armazenamento_id,
        local_to_id: formData.local_to_id,
        observacao: formData.observacao,
      });

      // Atualizar local do item
      await api.put(`/items/${formData.item_id}`, {
        local_armazenamento_id: formData.local_to_id,
      });

      alert('Transferência realizada com sucesso!');

      // Resetar formulário
      setFormData({
        item_id: '',
        local_to_id: '',
        quantidade: 1,
        observacao: '',
      });
      setSelectedItem(null);

      // Recarregar dados
      loadData();
    } catch (error) {
      console.error('Erro ao realizar transferência:', error);
      alert(error.response?.data?.message || 'Erro ao realizar transferência');
    }
  };

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
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {loading ? (
            <p style={{ color: '#6b7280', textAlign: 'center' }}>Carregando...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Item *
                </label>
                <select
                  required
                  value={formData.item_id}
                  onChange={(e) => handleItemChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Selecione um item...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.nome} ({item.codigo}) - Qtd: {item.quantidade}
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    border: '1px solid #e5e7eb',
                  }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Informações do Item
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      <strong>Nome:</strong> {selectedItem.nome}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      <strong>Código:</strong> {selectedItem.codigo}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                      <strong>Quantidade Disponível:</strong> {selectedItem.quantidade}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      <strong>Local Atual:</strong> {selectedItem.local_codigo || 'Sem local definido'}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Local de Destino *
                    </label>
                    <select
                      required
                      value={formData.local_to_id}
                      onChange={(e) => setFormData({ ...formData, local_to_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <option value="">Selecione o local de destino...</option>
                      {storageLocations.map(loc => (
                        <option
                          key={loc.id}
                          value={loc.id}
                          disabled={loc.id === selectedItem.local_armazenamento_id}
                        >
                          {loc.codigo} - {loc.descricao}
                          {loc.id === selectedItem.local_armazenamento_id ? ' (Local Atual)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={selectedItem.quantidade}
                      value={formData.quantidade}
                      onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Máximo: {selectedItem.quantidade} unidades
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Observações
                    </label>
                    <textarea
                      rows="3"
                      value={formData.observacao}
                      onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                      placeholder="Motivo da transferência, responsável pela solicitação, etc."
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        resize: 'vertical',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
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
                    Realizar Transferência
                  </button>
                </>
              )}

              {!selectedItem && (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}>
                  <p>Selecione um item para iniciar a transferência</p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
