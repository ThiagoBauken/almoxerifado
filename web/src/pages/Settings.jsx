import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Layout from '../components/Layout';

export default function Settings() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    perfil: 'funcionario',
    max_uses: 1,
  });
  const [orgUsers, setOrgUsers] = useState([]);

  useEffect(() => {
    if (user?.organization_id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [orgRes, invitesRes, usersRes] = await Promise.all([
        api.get(`/organizations/${user.organization_id}`),
        api.get('/invites'),
        api.get(`/organizations/${user.organization_id}/users`),
      ]);

      setOrganization(orgRes.data.data);
      setInvites(invitesRes.data.data || []);
      setOrgUsers(usersRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/invites', inviteForm);

      alert(`Convite criado! Link: ${res.data.inviteLink}`);

      setShowInviteModal(false);
      setInviteForm({ perfil: 'funcionario', max_uses: 1 });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao criar convite');
    }
  };

  const handleCancelInvite = async (id) => {
    if (!confirm('Cancelar este convite?')) return;

    try {
      await api.delete(`/invites/${id}`);
      loadData();
    } catch (error) {
      alert('Erro ao cancelar convite');
    }
  };

  const copyInviteLink = (token) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    alert('Link copiado!');
  };

  const isInviteActive = (invite) => {
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    return expiresAt > now && invite.current_uses < invite.max_uses;
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#6b7280' }}>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          ⚙️ Configurações
        </h1>

        {/* Informações da Organização */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
            Organização
          </h2>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Nome</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
              {organization?.nome}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Plano</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
              {organization?.plano || 'Free'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Usuários</div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>
              {orgUsers.length} / {organization?.max_usuarios || 5}
            </div>
          </div>
        </div>

        {/* Usuários da Organização */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          padding: '2rem',
          marginBottom: '2rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
              Membros da Equipe
            </h2>
            {['admin', 'gestor'].includes(user?.perfil) && (
              <button
                onClick={() => setShowInviteModal(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                + Gerar Link de Convite
              </button>
            )}
          </div>

          {orgUsers.length === 0 ? (
            <p style={{ color: '#6b7280' }}>Nenhum usuário encontrado</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Nome
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Email
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Perfil
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orgUsers.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>
                      {u.nome}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                      }}>
                        {u.perfil}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        backgroundColor: u.ativo ? '#d1fae5' : '#fee2e2',
                        color: u.ativo ? '#065f46' : '#991b1b',
                      }}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Convites */}
        {['admin', 'gestor'].includes(user?.perfil) && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '2rem',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
              Links de Convite
            </h2>

            {invites.length === 0 ? (
              <p style={{ color: '#6b7280' }}>Nenhum convite criado</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Perfil
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Usos
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Expira em
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Status
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(invite => {
                    const active = isInviteActive(invite);
                    return (
                      <tr key={invite.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#1f2937' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            backgroundColor: '#dbeafe',
                            color: '#1e40af',
                          }}>
                            {invite.perfil}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          {invite.current_uses} / {invite.max_uses}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#6b7280' }}>
                          {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            backgroundColor: active ? '#d1fae5' : '#fee2e2',
                            color: active ? '#065f46' : '#991b1b',
                          }}>
                            {active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {active && (
                              <button
                                onClick={() => copyInviteLink(invite.token)}
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
                                Copiar Link
                              </button>
                            )}
                            <button
                              onClick={() => handleCancelInvite(invite.id)}
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
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal de Convite */}
      {showInviteModal && (
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
            maxWidth: '400px',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>
              Gerar Link de Convite
            </h2>

            <form onSubmit={handleSendInvite}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Perfil *
                </label>
                <select
                  value={inviteForm.perfil}
                  onChange={(e) => setInviteForm({ ...inviteForm, perfil: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="almoxarife">Almoxarife</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Número de Usos *
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={inviteForm.max_uses}
                  onChange={(e) => setInviteForm({ ...inviteForm, max_uses: parseInt(e.target.value) || 1 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                  }}
                  placeholder="Quantas pessoas podem usar este link?"
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Número máximo de pessoas que podem usar este link
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
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
                  Gerar Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
