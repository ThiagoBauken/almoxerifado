import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import QRCode from 'qrcode';

export default function Transfers() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [obras, setObras] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    para_usuario_id: '',
    para_localizacao: '',
    tipo: 'transferencia',
    observacoes: '',
    motivo: '',
    devolverAoEstoque: false,
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [transferData, setTransferData] = useState(null);
  const qrCanvasRef = useRef(null);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFuncionario, setFilterFuncionario] = useState('');
  const [filterObra, setFilterObra] = useState('');
  const [filterOrigem, setFilterOrigem] = useState(''); // meus_itens | estoque | todos

  useEffect(() => {
    loadData();
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const loadData = async () => {
    try {
      const [itemsRes, usersRes, storageRes, obrasRes] = await Promise.all([
        api.get('/items?limit=1000'),
        api.get('/users'),
        api.get('/storage'),
        api.get('/obras'),
      ]);

      setItems(itemsRes.data.data || []);
      setUsers(usersRes.data.data || []);
      setStorageLocations(storageRes.data.data || []);
      setObras(obrasRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const generateQRCode = async (data) => {
    try {
      const qrString = JSON.stringify(data);
      const dataURL = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeDataURL(dataURL);
      setTransferData(data);
      setShowQRModal(true);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  const handleSubmit = async (e, offline = false) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item');
      return;
    }

    // Destinatário obrigatório apenas para transferências normais
    if (!formData.devolverAoEstoque && !formData.para_usuario_id) {
      alert('Selecione o destinatário');
      return;
    }

    if (!currentUser) {
      alert('Usuário não identificado');
      return;
    }

    // Devolução ao estoque não pode ser offline
    if (offline && formData.devolverAoEstoque) {
      alert('Devolução ao estoque deve ser feita online');
      return;
    }

    // Modo offline - apenas gerar QR Code
    if (offline) {
      const qrData = {
        type: 'transfer',
        item_ids: selectedItems,
        de_usuario_id: currentUser.id,
        para_usuario_id: formData.para_usuario_id,
        tipo: formData.tipo,
        para_localizacao: formData.para_localizacao,
        motivo: formData.motivo,
        observacoes: formData.observacoes,
        timestamp: new Date().toISOString(),
      };

      generateQRCode(qrData);
      return;
    }

    // Modo online - enviar para API
    try {
      // DEVOLUÇÃO AO ESTOQUE - envia para aprovação de todos almoxarifes/gestores/admins
      if (formData.devolverAoEstoque) {
        // Processar cada item com devolver_estoque=true (sem para_usuario_id)
        let sucessos = 0;
        let mensagemResposta = '';
        for (const item_id of selectedItems) {
          try {
            const response = await api.post('/transfers', {
              item_id,
              tipo: 'devolucao',
              de_usuario_id: currentUser.id,
              devolver_estoque: true,
              observacoes: formData.observacoes || 'Devolução ao estoque',
            });
            sucessos++;
            // Pegar mensagem do backend sobre quantos responsáveis foram notificados
            if (response.data.message) {
              mensagemResposta = response.data.message;
            }
          } catch (err) {
            console.error(`Erro ao enviar devolução do item ${item_id}:`, err);
          }
        }

        alert(`✅ ${sucessos} ${sucessos === 1 ? 'devolução enviada' : 'devoluções enviadas'} para aprovação!\n${mensagemResposta}`);

        // Resetar formulário
        setFormData({
          para_usuario_id: '',
          para_localizacao: '',
          tipo: 'transferencia',
          observacoes: '',
          motivo: '',
          devolverAoEstoque: false,
        });
        setSelectedItems([]);
        loadData();
        return;
      }

      // TRANSFERÊNCIA NORMAL PARA OUTRO USUÁRIO
      if (selectedItems.length === 1) {
        // Transferência única
        await api.post('/transfers', {
          item_id: selectedItems[0],
          tipo: formData.tipo,
          de_usuario_id: currentUser.id,
          para_usuario_id: formData.para_usuario_id,
          de_localizacao: '',
          para_localizacao: formData.para_localizacao || '',
          motivo: formData.motivo,
          observacoes: formData.observacoes,
        });

        alert('Transferência criada com sucesso! O destinatário receberá uma notificação.');
      } else {
        // Transferência em lote
        await api.post('/transfers/batch', {
          item_ids: selectedItems,
          de_usuario_id: currentUser.id,
          para_usuario_id: formData.para_usuario_id,
          observacoes: formData.observacoes,
        });

        alert(`${selectedItems.length} transferências criadas com sucesso! O destinatário receberá uma notificação.`);
      }

      // Resetar formulário
      setFormData({
        para_usuario_id: '',
        para_localizacao: '',
        tipo: 'transferencia',
        observacoes: '',
        motivo: '',
        devolverAoEstoque: false,
      });
      setSelectedItems([]);

      // Recarregar dados
      loadData();
    } catch (error) {
      console.error('Erro ao criar transferência:', error);
      alert(error.response?.data?.message || 'Erro ao criar transferência');
    }
  };

  // Filtrar itens: mostrar apenas itens que o usuário atual possui ou que estão no almoxarifado
  const availableItems = items.filter(item => {
    if (!currentUser) return false;

    // ADMINS/GESTORES/ALMOXARIFES podem ver e transferir QUALQUER item
    const isAdmin = ['almoxarife', 'gestor', 'admin'].includes(currentUser.perfil);
    if (isAdmin) {
      return true; // Vê todos os itens
    }

    // Funcionários normais só veem seus próprios itens
    return item.funcionario_id === currentUser.id;
  });

  // Aplicar filtros de busca e seleção
  const filteredItems = availableItems.filter(item => {
    // Filtro de busca por nome/lacre
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.nome?.toLowerCase().includes(searchLower) ||
        item.lacre?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtro por ORIGEM (meus itens vs estoque vs outros funcionários) - para almoxarifes/gestores
    if (filterOrigem && currentUser) {
      if (filterOrigem === 'meus_itens') {
        // Mostrar apenas itens que estão COM O USUÁRIO ATUAL
        if (item.funcionario_id !== currentUser.id) return false;
      } else if (filterOrigem === 'estoque') {
        // Mostrar apenas itens do ESTOQUE/ALMOXARIFADO
        // CORREÇÃO: Removido 'disponivel' - apenas 'disponivel_estoque' indica que está no estoque
        const isInStock =
          item.estado === 'disponivel_estoque' ||
          (item.localizacao_tipo === 'almoxarifado' && !item.funcionario_id) ||
          (item.localizacao_tipo === 'estoque' && !item.funcionario_id);
        if (!isInStock) return false;
      } else if (filterOrigem === 'outros_funcionarios') {
        // Mostrar apenas itens que estão COM OUTROS FUNCIONÁRIOS (não o usuário atual e não no estoque)
        const isWithOthers = item.funcionario_id && item.funcionario_id !== currentUser.id;
        if (!isWithOthers) return false;
      }
    }

    // Filtro por funcionário
    if (filterFuncionario && item.funcionario_id !== filterFuncionario) {
      return false;
    }

    // Filtro por obra
    if (filterObra && item.obra_id !== filterObra) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterFuncionario('');
    setFilterObra('');
    setFilterOrigem('');
  };

  const getItemLocation = (item) => {
    if (item.funcionario_nome) return `Com: ${item.funcionario_nome}`;
    if (item.local_codigo) return `Local: ${item.local_codigo}`;
    if (item.obra_nome) return `Obra: ${item.obra_nome}`;
    return 'Localização não definida';
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          🔄 Transferências
        </h1>

        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '2rem',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            Carregando...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '1.5rem',
            alignItems: 'start',
          }}>
            {/* Lista de Itens */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>
                  Selecione os Itens para Transferir
                </h2>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {filteredItems.length} {filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'}
                </div>
              </div>

              {/* Filtros */}
              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '1rem',
                border: '1px solid #e5e7eb',
              }}>
                {/* Busca */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar por nome ou lacre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                {/* Filtro de ORIGEM - só para almoxarifes/gestores/admin */}
                {currentUser && ['almoxarife', 'gestor', 'admin'].includes(currentUser.perfil) && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <select
                      value={filterOrigem}
                      onChange={(e) => setFilterOrigem(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        fontWeight: '500',
                      }}
                    >
                      <option value="">📦 Todos os Itens</option>
                      <option value="meus_itens">👤 Meus Itens Pessoais</option>
                      <option value="estoque">🏪 Itens do Estoque</option>
                      <option value="outros_funcionarios">👥 Itens de Outros Funcionários</option>
                    </select>
                  </div>
                )}

                {/* Filtros em linha */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <select
                    value={filterFuncionario}
                    onChange={(e) => setFilterFuncionario(e.target.value)}
                    style={{
                      padding: '0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">👤 Todas as Pessoas</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.nome}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterObra}
                    onChange={(e) => setFilterObra(e.target.value)}
                    style={{
                      padding: '0.625rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                    }}
                  >
                    <option value="">🏗️ Todas as Obras</option>
                    {obras.map(obra => (
                      <option key={obra.id} value={obra.id}>
                        {obra.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botão Limpar Filtros */}
                {(searchTerm || filterFuncionario || filterObra || filterOrigem) && (
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      width: '100%',
                    }}
                  >
                    🗑️ Limpar Filtros
                  </button>
                )}
              </div>

              {filteredItems.length === 0 ? (
                <div style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280',
                  backgroundColor: '#f9fafb',
                  borderRadius: '6px',
                }}>
                  {availableItems.length === 0 ? (
                    <p>Você não possui itens disponíveis para transferência</p>
                  ) : (
                    <p>Nenhum item encontrado com os filtros aplicados</p>
                  )}
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleItemToggle(item.id)}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: selectedItems.includes(item.id) ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: selectedItems.includes(item.id) ? '#eff6ff' : 'white',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => {}}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                              {item.nome}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Lacre: {item.lacre} | Qtd: {item.quantidade}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {getItemLocation(item)}
                            </div>
                          </div>
                        </div>
                        {item.foto && (
                          <img
                            src={item.foto}
                            alt={item.nome}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '1.5rem',
              position: 'sticky',
              top: '2rem',
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Detalhes da Transferência
              </h2>

              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Itens selecionados:
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {selectedItems.length}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Tipo de Transferência *
                  </label>
                  <select
                    required
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="transferencia">Transferência</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="devolucao">Devolução</option>
                  </select>
                </div>

                {/* Checkbox Devolver ao Estoque */}
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: formData.devolverAoEstoque ? '#dcfce7' : '#f9fafb',
                  border: formData.devolverAoEstoque ? '2px solid #10b981' : '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setFormData({
                  ...formData,
                  devolverAoEstoque: !formData.devolverAoEstoque,
                  para_usuario_id: '' // Limpa usuário ao alternar
                })}
                >
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: formData.devolverAoEstoque ? '#047857' : '#374151',
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.devolverAoEstoque}
                      onChange={() => {}} // Handled by div onClick
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: '#10b981'
                      }}
                    />
                    <span>
                      {formData.devolverAoEstoque ? '✅ Devolvendo ao Estoque (Requer Aprovação)' : '📦 Devolver ao Estoque'}
                    </span>
                  </label>
                  {formData.devolverAoEstoque && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#047857',
                      marginLeft: '2rem'
                    }}>
                      Todos os almoxarifes, gestores e admins serão notificados. Qualquer um deles poderá aprovar ou rejeitar a devolução.
                    </div>
                  )}
                </div>

                {/* Campo de destinatário - só aparece quando NÃO for devolução ao estoque */}
                {!formData.devolverAoEstoque && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Para Usuário *
                    </label>
                    <select
                      required
                      value={formData.para_usuario_id}
                      onChange={(e) => setFormData({ ...formData, para_usuario_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                      }}
                    >
                      <option value="">Selecione o destinatário...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.id === currentUser?.id ? 'Você - ' : ''}{user.nome} ({user.perfil})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Local de Destino (opcional)
                  </label>
                  <select
                    value={formData.para_localizacao}
                    onChange={(e) => setFormData({ ...formData, para_localizacao: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="">Sem local específico</option>
                    {storageLocations.map(loc => (
                      <option key={loc.id} value={loc.codigo}>
                        {loc.codigo} - {loc.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedItems.length === 1 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                      Motivo
                    </label>
                    <input
                      type="text"
                      value={formData.motivo}
                      onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                      placeholder="Ex: Necessário para obra X"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    Observações
                  </label>
                  <textarea
                    rows="3"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais sobre a transferência..."
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="submit"
                    disabled={selectedItems.length === 0}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: selectedItems.length === 0 ? '#9ca3af' : formData.devolverAoEstoque ? '#10b981' : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    {formData.devolverAoEstoque ? '🏪 Enviar para Aprovação' : '📡 Enviar Online'}
                  </button>

                  <button
                    type="button"
                    disabled={selectedItems.length === 0 || formData.devolverAoEstoque}
                    onClick={(e) => handleSubmit(e, true)}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: (selectedItems.length === 0 || formData.devolverAoEstoque) ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: (selectedItems.length === 0 || formData.devolverAoEstoque) ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                    title={formData.devolverAoEstoque ? 'Devolução ao estoque deve ser feita online' : ''}
                  >
                    📱 QR Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal QR Code */}
        {showQRModal && (
          <div
            onClick={() => setShowQRModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center', color: '#1f2937' }}>
                QR Code da Transferência
              </h2>

              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
                O destinatário pode escanear este QR Code para aceitar a transferência offline.
                Os dados serão sincronizados quando ambos estiverem online.
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
              }}>
                {qrCodeDataURL && (
                  <img
                    src={qrCodeDataURL}
                    alt="QR Code da Transferência"
                    style={{
                      width: '300px',
                      height: '300px',
                      border: '4px solid white',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                )}
              </div>

              {transferData && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '6px',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem',
                }}>
                  <div style={{ marginBottom: '0.5rem', color: '#374151' }}>
                    <strong>Tipo:</strong> {transferData.tipo}
                  </div>
                  <div style={{ marginBottom: '0.5rem', color: '#374151' }}>
                    <strong>Itens:</strong> {transferData.item_ids.length}
                  </div>
                  {transferData.observacoes && (
                    <div style={{ color: '#6b7280' }}>
                      <strong>Obs:</strong> {transferData.observacoes}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.download = `transfer-qr-${Date.now()}.png`;
                    link.href = qrCodeDataURL;
                    link.click();
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  💾 Baixar QR Code
                </button>

                <button
                  onClick={() => setShowQRModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
