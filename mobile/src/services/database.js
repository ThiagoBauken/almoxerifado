import * as SQLite from 'expo-sqlite';

// Abrir/criar banco de dados
const db = SQLite.openDatabase('almoxarifado.db');

// Inicializar tabelas
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Tabela de itens
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS items (
          id TEXT PRIMARY KEY,
          lacre TEXT UNIQUE NOT NULL,
          nome TEXT NOT NULL,
          categoria_id TEXT,
          estado TEXT,
          localizacao_tipo TEXT,
          localizacao_id TEXT,
          funcionario_id TEXT,
          obra_id TEXT,
          foto TEXT,
          qr_code TEXT,
          synced INTEGER DEFAULT 0,
          updated_at TEXT
        );`,
        [],
        () => console.log('Tabela items criada'),
        (_, error) => console.error('Erro ao criar tabela items:', error)
      );

      // Tabela de usuários
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          perfil TEXT,
          obra_id TEXT,
          foto TEXT,
          synced INTEGER DEFAULT 0,
          updated_at TEXT
        );`,
        [],
        () => console.log('Tabela users criada'),
        (_, error) => console.error('Erro ao criar tabela users:', error)
      );

      // Tabela de obras
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS obras (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          endereco TEXT,
          status TEXT,
          responsavel_id TEXT,
          data_inicio TEXT,
          synced INTEGER DEFAULT 0,
          updated_at TEXT
        );`,
        [],
        () => console.log('Tabela obras criada'),
        (_, error) => console.error('Erro ao criar tabela obras:', error)
      );

      // Tabela de transferências
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS transfers (
          id TEXT PRIMARY KEY,
          item_id TEXT,
          tipo TEXT,
          de_usuario_id TEXT,
          para_usuario_id TEXT,
          de_localizacao TEXT,
          para_localizacao TEXT,
          status TEXT,
          data_envio TEXT,
          data_aceitacao TEXT,
          assinatura_remetente TEXT,
          assinatura_destinatario TEXT,
          motivo TEXT,
          synced INTEGER DEFAULT 0,
          updated_at TEXT
        );`,
        [],
        () => console.log('Tabela transfers criada'),
        (_, error) => console.error('Erro ao criar tabela transfers:', error)
      );

      // Tabela de fila de sincronização
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT NOT NULL,
          record_id TEXT NOT NULL,
          operation TEXT NOT NULL,
          data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          retries INTEGER DEFAULT 0
        );`,
        [],
        () => console.log('Tabela sync_queue criada'),
        (_, error) => console.error('Erro ao criar tabela sync_queue:', error)
      );

      // Tabela de configurações
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TEXT
        );`,
        [],
        () => {
          console.log('Tabela settings criada');
          resolve();
        },
        (_, error) => {
          console.error('Erro ao criar tabela settings:', error);
          reject(error);
        }
      );
    });
  });
};

// ==================== ITEMS ====================

export const saveItem = (item) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO items (
          id, lacre, nome, categoria_id, estado,
          localizacao_tipo, localizacao_id, funcionario_id,
          obra_id, foto, qr_code, synced, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          item.id,
          item.lacre,
          item.nome,
          item.categoria_id,
          item.estado,
          item.localizacao_tipo,
          item.localizacao_id,
          item.funcionario_id,
          item.obra_id,
          item.foto,
          item.qr_code,
          new Date().toISOString(),
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllItems = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM items;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getItemById = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM items WHERE id = ?;',
        [id],
        (_, { rows: { _array } }) => resolve(_array[0]),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateItemState = (itemId, newState, locationInfo) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE items
         SET estado = ?,
             localizacao_tipo = ?,
             localizacao_id = ?,
             funcionario_id = ?,
             obra_id = ?,
             synced = 0,
             updated_at = ?
         WHERE id = ?;`,
        [
          newState,
          locationInfo.localizacao_tipo,
          locationInfo.localizacao_id,
          locationInfo.funcionario_id,
          locationInfo.obra_id,
          new Date().toISOString(),
          itemId,
        ],
        (_, result) => {
          // Adicionar à fila de sincronização
          addToSyncQueue('items', itemId, 'UPDATE', {
            estado: newState,
            ...locationInfo,
          });
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// ==================== USERS ====================

export const saveUser = (user) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO users (
          id, nome, email, perfil, obra_id, foto, synced, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          user.id,
          user.nome,
          user.email,
          user.perfil,
          user.obra_id,
          user.foto,
          new Date().toISOString(),
        ],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM users;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

// ==================== TRANSFERS ====================

export const saveTransfer = (transfer) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO transfers (
          id, item_id, tipo, de_usuario_id, para_usuario_id,
          de_localizacao, para_localizacao, status,
          data_envio, data_aceitacao, assinatura_remetente,
          assinatura_destinatario, motivo, synced, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [
          transfer.id,
          transfer.item_id,
          transfer.tipo,
          transfer.de_usuario_id,
          transfer.para_usuario_id,
          transfer.de_localizacao,
          transfer.para_localizacao,
          transfer.status,
          transfer.data_envio,
          transfer.data_aceitacao,
          transfer.assinatura_remetente,
          transfer.assinatura_destinatario,
          transfer.motivo,
          new Date().toISOString(),
        ],
        (_, result) => {
          // Adicionar à fila de sincronização
          addToSyncQueue('transfers', transfer.id, 'INSERT', transfer);
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getAllTransfers = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM transfers ORDER BY data_envio DESC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateTransferStatus = (transferId, status, acceptanceData) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE transfers
         SET status = ?,
             data_aceitacao = ?,
             assinatura_destinatario = ?,
             synced = 0,
             updated_at = ?
         WHERE id = ?;`,
        [
          status,
          acceptanceData.data_aceitacao,
          acceptanceData.assinatura_destinatario,
          new Date().toISOString(),
          transferId,
        ],
        (_, result) => {
          // Adicionar à fila de sincronização
          addToSyncQueue('transfers', transferId, 'UPDATE', {
            status,
            ...acceptanceData,
          });
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};

// ==================== SYNC QUEUE ====================

export const addToSyncQueue = (tableName, recordId, operation, data) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT INTO sync_queue (table_name, record_id, operation, data)
         VALUES (?, ?, ?, ?);`,
        [tableName, recordId, operation, JSON.stringify(data)],
        (_, result) => {
          console.log(`[SYNC QUEUE] Adicionado: ${operation} ${tableName} ${recordId}`);
          resolve(result);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getSyncQueue = () => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM sync_queue ORDER BY created_at ASC;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const removeSyncQueueItem = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM sync_queue WHERE id = ?;',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const incrementSyncRetries = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE sync_queue SET retries = retries + 1 WHERE id = ?;',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// ==================== SETTINGS ====================

export const saveSetting = (key, value) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO settings (key, value, updated_at)
         VALUES (?, ?, ?);`,
        [key, value, new Date().toISOString()],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSetting = (key) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT value FROM settings WHERE key = ?;',
        [key],
        (_, { rows: { _array } }) => resolve(_array[0]?.value || null),
        (_, error) => reject(error)
      );
    });
  });
};

// ==================== BULK OPERATIONS ====================

export const bulkSaveItems = (items) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      items.forEach((item, index) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO items (
            id, lacre, nome, categoria_id, estado,
            localizacao_tipo, localizacao_id, funcionario_id,
            obra_id, foto, qr_code, synced, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?);`,
          [
            item.id,
            item.lacre,
            item.nome,
            item.categoria_id,
            item.estado,
            item.localizacao_tipo,
            item.localizacao_id,
            item.funcionario_id,
            item.obra_id,
            item.foto,
            item.qr_code,
            new Date().toISOString(),
          ],
          (_, result) => {
            if (index === items.length - 1) {
              console.log(`[DB] Salvos ${items.length} itens`);
              resolve(result);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  });
};

export default {
  initDatabase,
  saveItem,
  getAllItems,
  getItemById,
  updateItemState,
  saveUser,
  getAllUsers,
  saveTransfer,
  getAllTransfers,
  updateTransferStatus,
  addToSyncQueue,
  getSyncQueue,
  removeSyncQueueItem,
  incrementSyncRetries,
  saveSetting,
  getSetting,
  bulkSaveItems,
};
