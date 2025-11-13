import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('transfers'); // 'transfers' ou 'notifications'

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notificationsRes, transfersRes] = await Promise.all([
        api.get('/notifications?read=false'),
        api.get('/transfers?status=pendente'),
      ]);

      setNotifications(notificationsRes.data.data || []);

      // Filtrar transferências pendentes para o usuário atual
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userTransfers = (transfersRes.data.data || []).filter(t => {
          // Transferências normais direcionadas ao usuário
          if (t.para_usuario_id === user.id && t.status === 'pendente') {
            return true;
          }

          // Devoluções ao estoque - qualquer almoxarife/gestor/admin pode aprovar
          // EXCETO se for a própria pessoa que enviou
          if (
            t.tipo === 'devolucao' &&
            t.para_localizacao === 'estoque' &&
            t.status === 'pendente' &&
            t.para_usuario_id === null &&
            t.de_usuario_id !== user.id && // Não mostrar suas próprias devoluções
            ['almoxarife', 'gestor', 'admin'].includes(user.perfil)
          ) {
            return true;
          }

          return false;
        });
        setPendingTransfers(userTransfers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      loadData();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      alert('Erro ao marcar notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      loadData();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      alert('Erro ao marcar todas como lidas');
    }
  };

  const handleRespondTransfer = async (transferId, accepted) => {
    try {
      await api.put(`/transfers/${transferId}/respond`, {
        accepted,
        assinatura_destinatario: currentUser?.nome || '',
        observacoes: accepted ? 'Aceito' : 'Rejeitado',
      });

      alert(accepted ? 'Transferência aceita com sucesso!' : 'Transferência rejeitada');
      loadData();
    } catch (error) {
      console.error('Erro ao responder transferência:', error);
      alert(error.response?.data?.message || 'Erro ao responder transferência');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            🔔 Notificações
          </h1>

          {notifications.length > 0 && activeTab === 'notifications' && (
            <button
              onClick={handleMarkAllAsRead}
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
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
        }}>
          <button
            onClick={() => setActiveTab('transfers')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: activeTab === 'transfers' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'transfers' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '-2px',
            }}
          >
            Transferências Pendentes ({pendingTransfers.length})
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'transparent',
              color: activeTab === 'notifications' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: activeTab === 'notifications' ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '-2px',
            }}
          >
            Todas Notificações ({notifications.length})
          </button>
        </div>

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
          <>
            {/* Transferências Pendentes */}
            {activeTab === 'transfers' && (
              <div>
                {pendingTransfers.length === 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '3rem',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                      Você não tem transferências pendentes
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {pendingTransfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          padding: '1.5rem',
                          border: '2px solid #fbbf24',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                backgroundColor: transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque' ? '#dcfce7' : '#fef3c7',
                                color: transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque' ? '#047857' : '#92400e',
                                fontWeight: '600',
                              }}>
                                {transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque' ? '🏪 Devolução ao Estoque' : transfer.tipo}
                              </span>
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {formatDate(transfer.data_envio)}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                              {transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque'
                                ? `Devolução de: ${transfer.de_usuario_nome}`
                                : `Transferência de: ${transfer.de_usuario_nome}`}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              Item: {transfer.item_nome} {transfer.item_lacre && `(${transfer.item_lacre})`}
                            </p>
                            {transfer.tipo === 'devolucao' && transfer.para_localizacao === 'estoque' && (
                              <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.25rem', fontWeight: '500' }}>
                                ℹ️ Este item será devolvido ao estoque após aprovação
                              </p>
                            )}
                          </div>
                        </div>

                        {transfer.observacoes && (
                          <div style={{
                            padding: '0.75rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#6b7280',
                          }}>
                            <strong>Observações:</strong> {transfer.observacoes}
                          </div>
                        )}

                        {transfer.de_localizacao && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                            <strong>De:</strong> {transfer.de_localizacao}
                          </p>
                        )}

                        {transfer.para_localizacao && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                            <strong>Para:</strong> {transfer.para_localizacao}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleRespondTransfer(transfer.id, true)}
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
                            ✓ Aceitar
                          </button>

                          <button
                            onClick={() => handleRespondTransfer(transfer.id, false)}
                            style={{
                              flex: 1,
                              padding: '0.75rem',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                            }}
                          >
                            ✕ Rejeitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Todas as Notificações */}
            {activeTab === 'notifications' && (
              <div>
                {notifications.length === 0 ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    padding: '3rem',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                    <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                      Você não tem notificações não lidas
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                          padding: '1.5rem',
                          border: '1px solid #e5e7eb',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.75rem',
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                fontWeight: '600',
                              }}>
                                {notification.tipo}
                              </span>
                              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                {formatDate(notification.created_at)}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
                              {notification.titulo}
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {notification.mensagem}
                            </p>
                          </div>

                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              marginLeft: '1rem',
                            }}
                          >
                            Marcar como lida
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
