import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração da API
// ALTERE PARA O IP DO SEU COMPUTADOR EM DESENVOLVIMENTO
// Exemplo: http://192.168.1.100:3000/api
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Desenvolvimento - ALTERE para IP do seu computador
  : 'https://private-appalmoxerifado.pbzgje.easypanel.host/api'; // Produção

// Instância do Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - fazer logout
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('current_user');
      // Navegar para login (você pode usar um navigation service aqui)
    }
    return Promise.reject(error);
  }
);

// ==================== AUTENTICAÇÃO ====================

export const login = async (email, senha) => {
  try {
    const response = await api.post('/auth/login', { email, senha });
    const { user, token } = response.data.data;

    // Salvar token e usuário
    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));

    return { success: true, user, token };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao fazer login',
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data.data;

    await AsyncStorage.setItem('auth_token', token);
    await AsyncStorage.setItem('current_user', JSON.stringify(user));

    return { success: true, user, token };
  } catch (error) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao criar usuário',
    };
  }
};

export const logout = async () => {
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('current_user');
};

export const getCurrentUser = async () => {
  const userJson = await AsyncStorage.getItem('current_user');
  return userJson ? JSON.parse(userJson) : null;
};

// ==================== ITENS ====================

export const getItems = async (filters = {}) => {
  try {
    const response = await api.get('/items', { params: filters });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return { success: false, message: 'Erro ao buscar itens' };
  }
};

export const getItemById = async (id) => {
  try {
    const response = await api.get(`/items/${id}`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return { success: false, message: 'Erro ao buscar item' };
  }
};

export const createItem = async (itemData) => {
  try {
    const response = await api.post('/items', itemData);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return { success: false, message: 'Erro ao criar item' };
  }
};

export const updateItem = async (id, itemData) => {
  try {
    const response = await api.put(`/items/${id}`, itemData);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return { success: false, message: 'Erro ao atualizar item' };
  }
};

export const getItemsStats = async () => {
  try {
    const response = await api.get('/items/stats/overview');
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return { success: false, message: 'Erro ao buscar estatísticas' };
  }
};

// ==================== TRANSFERÊNCIAS ====================

export const getTransfers = async (filters = {}) => {
  try {
    const response = await api.get('/transfers', { params: filters });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar transferências:', error);
    return { success: false, message: 'Erro ao buscar transferências' };
  }
};

export const createTransfer = async (transferData) => {
  try {
    const response = await api.post('/transfers', transferData);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao criar transferência:', error);
    return { success: false, message: 'Erro ao criar transferência' };
  }
};

export const createBatchTransfers = async (transferData) => {
  try {
    const response = await api.post('/transfers/batch', transferData);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao criar transferências:', error);
    return { success: false, message: 'Erro ao criar transferências' };
  }
};

export const respondTransfer = async (transferId, responseData) => {
  try {
    const response = await api.put(`/transfers/${transferId}/respond`, responseData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao responder transferência:', error);
    return { success: false, message: 'Erro ao responder transferência' };
  }
};

export const getItemHistory = async (itemId) => {
  try {
    const response = await api.get(`/transfers/item/${itemId}/history`);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return { success: false, message: 'Erro ao buscar histórico' };
  }
};

// ==================== USUÁRIOS ====================

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return { success: false, message: 'Erro ao buscar usuários' };
  }
};

// ==================== OBRAS ====================

export const getObras = async () => {
  try {
    const response = await api.get('/obras');
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar obras:', error);
    return { success: false, message: 'Erro ao buscar obras' };
  }
};

// ==================== CATEGORIAS ====================

export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return { success: false, message: 'Erro ao buscar categorias' };
  }
};

// ==================== SINCRONIZAÇÃO ====================

export const syncFull = async (lastSync = null) => {
  try {
    const response = await api.post('/sync/full', { lastSync });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { success: false, message: 'Erro na sincronização' };
  }
};

// ==================== NOTIFICAÇÕES ====================

export const getNotifications = async (read = null) => {
  try {
    const params = read !== null ? { read } : {};
    const response = await api.get('/notifications', { params });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return { success: false, message: 'Erro ao buscar notificações' };
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return { success: true, count: response.data.count || 0 };
  } catch (error) {
    console.error('Erro ao buscar contador:', error);
    return { success: false, count: 0 };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    return { success: false, message: 'Erro ao marcar como lida' };
  }
};

export const markAllAsRead = async () => {
  try {
    const response = await api.post('/notifications/mark-all-read');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    return { success: false, message: 'Erro ao marcar todas como lidas' };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return { success: false, message: 'Erro ao deletar notificação' };
  }
};

// ==================== MOVIMENTAÇÕES (HISTÓRICO) ====================

export const getMovimentacoes = async (filters = {}) => {
  try {
    const response = await api.get('/movimentacoes', { params: filters });
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return { success: false, message: 'Erro ao buscar movimentações' };
  }
};

export const createMovimentacao = async (movimentacaoData) => {
  try {
    const response = await api.post('/movimentacoes', movimentacaoData);
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return { success: false, message: 'Erro ao criar movimentação' };
  }
};

// ==================== HELPER: Verificar Conexão ====================

export const checkApiConnection = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 3000,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

export default api;
