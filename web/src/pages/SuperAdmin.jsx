import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SuperAdmin.css';

const SuperAdmin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);

  // Estados para estatísticas
  const [stats, setStats] = useState(null);

  // Estados para usuários
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({});
  const [usersFilters, setUsersFilters] = useState({
    search: '',
    perfil: '',
    organization_id: '',
    is_superadmin: '',
    ativo: 'true',
    page: 1,
  });

  // Estados para organizações
  const [organizations, setOrganizations] = useState([]);
  const [orgsPagination, setOrgsPagination] = useState({});
  const [orgsFilters, setOrgsFilters] = useState({
    search: '',
    plano: '',
    ativo: 'true',
    page: 1,
  });

  // Estados de modais
  const [showUserModal, setShowUserModal] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);

  // Formulário de usuário
  const [userForm, setUserForm] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'funcionario',
    organization_id: '',
    is_superadmin: false,
  });

  // Formulário de organização
  const [orgForm, setOrgForm] = useState({
    nome: '',
    plano: 'free',
    max_usuarios: 5,
    max_itens: 100,
  });

  // Verificar se é superadmin
  useEffect(() => {
    if (!user?.is_superadmin) {
      window.location.href = '/dashboard';
    }
  }, [user]);

  // Carregar dados
  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'organizations') {
      fetchOrganizations();
    }
  }, [activeTab, usersFilters, orgsFilters]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/superadmin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      alert('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(usersFilters).forEach(key => {
        if (usersFilters[key]) params.append(key, usersFilters[key]);
      });
      const response = await api.get(`/superadmin/users?${params}`);
      setUsers(response.data.data);
      setUsersPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(orgsFilters).forEach(key => {
        if (orgsFilters[key]) params.append(key, orgsFilters[key]);
      });
      const response = await api.get(`/superadmin/organizations?${params}`);
      setOrganizations(response.data.data);
      setOrgsPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
      alert('Erro ao carregar organizações');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/superadmin/users', userForm);
      alert('Usuário criado com sucesso!');
      setShowUserModal(false);
      setUserForm({
        nome: '',
        email: '',
        senha: '',
        perfil: 'funcionario',
        organization_id: '',
        is_superadmin: false,
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updateData = { ...userForm };
      if (!updateData.senha) delete updateData.senha;
      await api.put(`/superadmin/users/${editingUser.id}`, updateData);
      alert('Usuário atualizado com sucesso!');
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({
        nome: '',
        email: '',
        senha: '',
        perfil: 'funcionario',
        organization_id: '',
        is_superadmin: false,
      });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja desativar este usuário?')) return;
    try {
      await api.delete(`/superadmin/users/${userId}`);
      alert('Usuário desativado com sucesso!');
      fetchUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      alert(error.response?.data?.message || 'Erro ao deletar usuário');
    }
  };

  const handleToggleSuperAdmin = async (userId) => {
    if (!confirm('Tem certeza que deseja alterar o status de super admin deste usuário?')) return;
    try {
      const response = await api.put(`/superadmin/users/${userId}/toggle-superadmin`);
      alert(response.data.message);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar super admin:', error);
      alert(error.response?.data?.message || 'Erro ao alterar super admin');
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.post('/superadmin/organizations', orgForm);
      alert('Organização criada com sucesso!');
      setShowOrgModal(false);
      setOrgForm({
        nome: '',
        plano: 'free',
        max_usuarios: 5,
        max_itens: 100,
      });
      fetchOrganizations();
    } catch (error) {
      console.error('Erro ao criar organização:', error);
      alert(error.response?.data?.message || 'Erro ao criar organização');
    }
  };

  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/superadmin/organizations/${editingOrg.id}`, orgForm);
      alert('Organização atualizada com sucesso!');
      setShowOrgModal(false);
      setEditingOrg(null);
      setOrgForm({
        nome: '',
        plano: 'free',
        max_usuarios: 5,
        max_itens: 100,
      });
      fetchOrganizations();
    } catch (error) {
      console.error('Erro ao atualizar organização:', error);
      alert(error.response?.data?.message || 'Erro ao atualizar organização');
    }
  };

  const handleDeleteOrg = async (orgId) => {
    if (!confirm('Tem certeza que deseja desativar esta organização?')) return;
    try {
      await api.delete(`/superadmin/organizations/${orgId}`);
      alert('Organização desativada com sucesso!');
      fetchOrganizations();
    } catch (error) {
      console.error('Erro ao deletar organização:', error);
      alert(error.response?.data?.message || 'Erro ao deletar organização');
    }
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        nome: user.nome,
        email: user.email,
        senha: '',
        perfil: user.perfil,
        organization_id: user.organization_id || '',
        is_superadmin: user.is_superadmin || false,
      });
    }
    setShowUserModal(true);
  };

  const openOrgModal = (org = null) => {
    if (org) {
      setEditingOrg(org);
      setOrgForm({
        nome: org.nome,
        plano: org.plano,
        max_usuarios: org.max_usuarios,
        max_itens: org.max_itens,
      });
    }
    setShowOrgModal(true);
  };

  return (
    <div className="superadmin-container">
      <div className="superadmin-header">
        <h1>🔐 Painel Super Admin</h1>
        <p>Bem-vindo, {user?.nome}</p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Estatísticas
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Usuários
        </button>
        <button
          className={activeTab === 'organizations' ? 'active' : ''}
          onClick={() => setActiveTab('organizations')}
        >
          🏢 Organizações
        </button>
      </div>

      {loading && <div className="loading">Carregando...</div>}

      {/* TAB: ESTATÍSTICAS */}
      {activeTab === 'stats' && stats && (
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏢</div>
              <div className="stat-info">
                <h3>Organizações Ativas</h3>
                <p className="stat-value">{stats.total_organizations}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Usuários Ativos</h3>
                <p className="stat-value">{stats.total_users}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔐</div>
              <div className="stat-info">
                <h3>Super Admins</h3>
                <p className="stat-value">{stats.total_superadmins}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>Itens no Sistema</h3>
                <p className="stat-value">{stats.total_items}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <h3>Transferências</h3>
                <p className="stat-value">{stats.total_transfers}</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Usuários por Perfil</h3>
              <ul>
                {stats.users_by_perfil.map(item => (
                  <li key={item.perfil}>
                    <span>{item.perfil}:</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
            <div className="chart-card">
              <h3>Organizações por Plano</h3>
              <ul>
                {stats.organizations_by_plano.map(item => (
                  <li key={item.plano}>
                    <span>{item.plano}:</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB: USUÁRIOS */}
      {activeTab === 'users' && (
        <div className="users-container">
          <div className="table-header">
            <div className="filters">
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={usersFilters.search}
                onChange={(e) => setUsersFilters({ ...usersFilters, search: e.target.value, page: 1 })}
              />
              <select
                value={usersFilters.perfil}
                onChange={(e) => setUsersFilters({ ...usersFilters, perfil: e.target.value, page: 1 })}
              >
                <option value="">Todos os perfis</option>
                <option value="funcionario">Funcionário</option>
                <option value="almoxarife">Almoxarife</option>
                <option value="gestor">Gestor</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={usersFilters.is_superadmin}
                onChange={(e) => setUsersFilters({ ...usersFilters, is_superadmin: e.target.value, page: 1 })}
              >
                <option value="">Todos</option>
                <option value="true">Super Admins</option>
                <option value="false">Não Super Admins</option>
              </select>
              <select
                value={usersFilters.ativo}
                onChange={(e) => setUsersFilters({ ...usersFilters, ativo: e.target.value, page: 1 })}
              >
                <option value="true">Ativos</option>
                <option value="false">Inativos</option>
                <option value="">Todos</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => openUserModal()}>
              + Novo Usuário
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Organização</th>
                  <th>Super Admin</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.perfil}`}>{u.perfil}</span>
                    </td>
                    <td>{u.organization_name || 'N/A'}</td>
                    <td>
                      {u.is_superadmin ? (
                        <span className="badge badge-superadmin">✓ Super Admin</span>
                      ) : (
                        <span className="badge badge-normal">Normal</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.ativo ? 'badge-active' : 'badge-inactive'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openUserModal(u)} title="Editar">✏️</button>
                        <button onClick={() => handleToggleSuperAdmin(u.id)} title="Toggle Super Admin">
                          {u.is_superadmin ? '⬇️' : '⬆️'}
                        </button>
                        <button onClick={() => handleDeleteUser(u.id)} title="Desativar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {usersPagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={usersFilters.page === 1}
                onClick={() => setUsersFilters({ ...usersFilters, page: usersFilters.page - 1 })}
              >
                Anterior
              </button>
              <span>Página {usersPagination.page} de {usersPagination.totalPages}</span>
              <button
                disabled={usersFilters.page === usersPagination.totalPages}
                onClick={() => setUsersFilters({ ...usersFilters, page: usersFilters.page + 1 })}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: ORGANIZAÇÕES */}
      {activeTab === 'organizations' && (
        <div className="organizations-container">
          <div className="table-header">
            <div className="filters">
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={orgsFilters.search}
                onChange={(e) => setOrgsFilters({ ...orgsFilters, search: e.target.value, page: 1 })}
              />
              <select
                value={orgsFilters.plano}
                onChange={(e) => setOrgsFilters({ ...orgsFilters, plano: e.target.value, page: 1 })}
              >
                <option value="">Todos os planos</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={orgsFilters.ativo}
                onChange={(e) => setOrgsFilters({ ...orgsFilters, ativo: e.target.value, page: 1 })}
              >
                <option value="true">Ativas</option>
                <option value="false">Inativas</option>
                <option value="">Todas</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => openOrgModal()}>
              + Nova Organização
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Plano</th>
                  <th>Usuários</th>
                  <th>Itens</th>
                  <th>Limites</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map(org => (
                  <tr key={org.id}>
                    <td>{org.nome}</td>
                    <td>
                      <span className={`badge badge-plan-${org.plano}`}>{org.plano}</span>
                    </td>
                    <td>{org.total_users}</td>
                    <td>{org.total_items}</td>
                    <td>
                      <small>
                        {org.max_usuarios} users / {org.max_itens} items
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${org.ativo ? 'badge-active' : 'badge-inactive'}`}>
                        {org.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => openOrgModal(org)} title="Editar">✏️</button>
                        <button onClick={() => handleDeleteOrg(org.id)} title="Desativar">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orgsPagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={orgsFilters.page === 1}
                onClick={() => setOrgsFilters({ ...orgsFilters, page: orgsFilters.page - 1 })}
              >
                Anterior
              </button>
              <span>Página {orgsPagination.page} de {orgsPagination.totalPages}</span>
              <button
                disabled={orgsFilters.page === orgsPagination.totalPages}
                onClick={() => setOrgsFilters({ ...orgsFilters, page: orgsFilters.page + 1 })}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: USUÁRIO */}
      {showUserModal && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h2>
            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={userForm.nome}
                  onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Senha {editingUser && '(deixe em branco para não alterar)'}</label>
                <input
                  type="password"
                  value={userForm.senha}
                  onChange={(e) => setUserForm({ ...userForm, senha: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Perfil</label>
                <select
                  value={userForm.perfil}
                  onChange={(e) => setUserForm({ ...userForm, perfil: e.target.value })}
                  required
                >
                  <option value="funcionario">Funcionário</option>
                  <option value="almoxarife">Almoxarife</option>
                  <option value="gestor">Gestor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID da Organização (opcional)</label>
                <input
                  type="number"
                  value={userForm.organization_id}
                  onChange={(e) => setUserForm({ ...userForm, organization_id: e.target.value })}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={userForm.is_superadmin}
                    onChange={(e) => setUserForm({ ...userForm, is_superadmin: e.target.checked })}
                  />
                  É Super Admin
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowUserModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORGANIZAÇÃO */}
      {showOrgModal && (
        <div className="modal-overlay" onClick={() => setShowOrgModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingOrg ? 'Editar Organização' : 'Nova Organização'}</h2>
            <form onSubmit={editingOrg ? handleUpdateOrg : handleCreateOrg}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={orgForm.nome}
                  onChange={(e) => setOrgForm({ ...orgForm, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Plano</label>
                <select
                  value={orgForm.plano}
                  onChange={(e) => setOrgForm({ ...orgForm, plano: e.target.value })}
                  required
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div className="form-group">
                <label>Máximo de Usuários</label>
                <input
                  type="number"
                  value={orgForm.max_usuarios}
                  onChange={(e) => setOrgForm({ ...orgForm, max_usuarios: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Máximo de Itens</label>
                <input
                  type="number"
                  value={orgForm.max_itens}
                  onChange={(e) => setOrgForm({ ...orgForm, max_itens: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowOrgModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingOrg ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
