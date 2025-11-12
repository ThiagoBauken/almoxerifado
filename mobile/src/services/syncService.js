import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import {
  getSyncQueue,
  removeSyncQueueItem,
  incrementSyncRetries,
  saveSetting,
  getSetting,
  bulkSaveItems,
} from './database';

const API_BASE_URL = 'http://localhost:3000/api'; // Alterar para URL do servidor em produção
const MAX_RETRIES = 3;

// Estado da sincronização
let isSyncing = false;
let syncInterval = null;

// ==================== CONEXÃO ====================

export const checkConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
};

// ==================== SINCRONIZAÇÃO ====================

export const syncData = async () => {
  if (isSyncing) {
    console.log('[SYNC] Já está sincronizando...');
    return { success: false, message: 'Sincronização em andamento' };
  }

  const isOnline = await checkConnection();
  if (!isOnline) {
    console.log('[SYNC] Sem conexão com a internet');
    return { success: false, message: 'Sem conexão' };
  }

  isSyncing = true;
  console.log('[SYNC] Iniciando sincronização...');

  try {
    // 1. Enviar mudanças locais para o servidor
    const uploadResult = await uploadLocalChanges();

    // 2. Baixar dados atualizados do servidor
    const downloadResult = await downloadServerData();

    isSyncing = false;

    // Salvar timestamp da última sincronização
    await saveSetting('last_sync', new Date().toISOString());

    console.log('[SYNC] Sincronização concluída com sucesso!');
    return {
      success: true,
      message: 'Sincronização concluída',
      uploaded: uploadResult.count,
      downloaded: downloadResult.count,
    };
  } catch (error) {
    isSyncing = false;
    console.error('[SYNC] Erro na sincronização:', error);
    return {
      success: false,
      message: error.message || 'Erro na sincronização',
      error,
    };
  }
};

// ==================== UPLOAD (Local → Servidor) ====================

const uploadLocalChanges = async () => {
  console.log('[SYNC] Enviando mudanças locais...');

  const queue = await getSyncQueue();

  if (queue.length === 0) {
    console.log('[SYNC] Nenhuma mudança local para enviar');
    return { success: true, count: 0 };
  }

  console.log(`[SYNC] ${queue.length} operações na fila`);

  let successCount = 0;
  let errorCount = 0;

  for (const item of queue) {
    try {
      const data = JSON.parse(item.data);

      // Decidir endpoint baseado na tabela
      let endpoint = '';
      switch (item.table_name) {
        case 'items':
          endpoint = '/items';
          break;
        case 'transfers':
          endpoint = '/transfers';
          break;
        case 'users':
          endpoint = '/users';
          break;
        default:
          console.warn(`[SYNC] Tabela desconhecida: ${item.table_name}`);
          continue;
      }

      // Fazer requisição baseada na operação
      if (item.operation === 'INSERT' || item.operation === 'UPDATE') {
        await axios.post(`${API_BASE_URL}${endpoint}`, {
          id: item.record_id,
          ...data,
        });
      } else if (item.operation === 'DELETE') {
        await axios.delete(`${API_BASE_URL}${endpoint}/${item.record_id}`);
      }

      // Remover da fila após sucesso
      await removeSyncQueueItem(item.id);
      successCount++;

      console.log(
        `[SYNC] ✓ ${item.operation} ${item.table_name}/${item.record_id}`
      );
    } catch (error) {
      errorCount++;

      // Incrementar tentativas
      await incrementSyncRetries(item.id);

      // Se excedeu máximo de tentativas, remover da fila
      if (item.retries >= MAX_RETRIES) {
        console.error(
          `[SYNC] ✗ Máximo de tentativas excedido para ${item.table_name}/${item.record_id}`
        );
        await removeSyncQueueItem(item.id);
      } else {
        console.error(
          `[SYNC] ✗ Erro ao sincronizar ${item.table_name}/${item.record_id} (tentativa ${item.retries + 1}/${MAX_RETRIES}):`,
          error.message
        );
      }
    }
  }

  console.log(
    `[SYNC] Upload concluído: ${successCount} sucessos, ${errorCount} erros`
  );

  return { success: errorCount === 0, count: successCount };
};

// ==================== DOWNLOAD (Servidor → Local) ====================

const downloadServerData = async () => {
  console.log('[SYNC] Baixando dados do servidor...');

  try {
    // Pegar timestamp da última sincronização
    const lastSync = await getSetting('last_sync');
    const params = lastSync ? { since: lastSync } : {};

    // Baixar itens atualizados
    const itemsResponse = await axios.get(`${API_BASE_URL}/items`, { params });
    if (itemsResponse.data && itemsResponse.data.length > 0) {
      await bulkSaveItems(itemsResponse.data);
      console.log(`[SYNC] Baixados ${itemsResponse.data.length} itens`);
    }

    // Baixar transferências atualizadas
    const transfersResponse = await axios.get(`${API_BASE_URL}/transfers`, {
      params,
    });
    if (transfersResponse.data && transfersResponse.data.length > 0) {
      // Salvar transferências (bulk operation similar)
      console.log(`[SYNC] Baixadas ${transfersResponse.data.length} transferências`);
    }

    return {
      success: true,
      count:
        (itemsResponse.data?.length || 0) +
        (transfersResponse.data?.length || 0),
    };
  } catch (error) {
    console.error('[SYNC] Erro ao baixar dados:', error);
    throw error;
  }
};

// ==================== AUTO-SYNC ====================

export const startAutoSync = (intervalMinutes = 5) => {
  console.log(
    `[SYNC] Auto-sync ativado (intervalo: ${intervalMinutes} minutos)`
  );

  // Limpar intervalo existente
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  // Sincronizar imediatamente
  syncData();

  // Configurar intervalo
  syncInterval = setInterval(() => {
    syncData();
  }, intervalMinutes * 60 * 1000);
};

export const stopAutoSync = () => {
  console.log('[SYNC] Auto-sync desativado');
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
};

// ==================== SYNC ON CONNECTIVITY CHANGE ====================

export const setupConnectivityListener = () => {
  console.log('[SYNC] Monitoramento de conectividade ativado');

  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('[SYNC] Conexão restaurada - sincronizando...');
      syncData();
    } else {
      console.log('[SYNC] Sem conexão - modo offline');
    }
  });
};

// ==================== RESOLUÇÃO DE CONFLITOS ====================

/**
 * Estratégia: Last Write Wins (LWW)
 * O registro com timestamp mais recente prevalece
 */
const resolveConflict = (localData, serverData) => {
  const localTimestamp = new Date(localData.updated_at).getTime();
  const serverTimestamp = new Date(serverData.updated_at).getTime();

  if (localTimestamp > serverTimestamp) {
    console.log('[CONFLICT] Versão local mais recente - mantendo local');
    return { winner: 'local', data: localData };
  } else {
    console.log('[CONFLICT] Versão servidor mais recente - mantendo servidor');
    return { winner: 'server', data: serverData };
  }
};

// ==================== STATUS DA SINCRONIZAÇÃO ====================

export const getSyncStatus = async () => {
  const isOnline = await checkConnection();
  const lastSync = await getSetting('last_sync');
  const queue = await getSyncQueue();

  return {
    online: isOnline,
    syncing: isSyncing,
    lastSync: lastSync ? new Date(lastSync) : null,
    pendingChanges: queue.length,
    autoSyncActive: syncInterval !== null,
  };
};

// ==================== EXPORT ====================

export default {
  checkConnection,
  syncData,
  startAutoSync,
  stopAutoSync,
  setupConnectivityListener,
  getSyncStatus,
};
