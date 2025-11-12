# Sistema Offline e Sincronização

## 📱 Visão Geral

O sistema foi projetado com arquitetura **offline-first**, permitindo que todos os usuários trabalhem normalmente mesmo sem conexão com a internet. As operações são salvas localmente e sincronizadas automaticamente quando a conexão for restabelecida.

---

## 🎯 Por Que Offline-First?

### Desafios em Obras de Construção
- 🏗️ **Internet instável** em canteiros de obra
- 📶 **Áreas remotas** sem cobertura
- 💰 **Custo de dados móveis** elevado
- ⚡ **Necessidade de agilidade** nas operações

### Benefícios
- ✅ **100% de disponibilidade** - trabalhe sempre
- ⚡ **Performance rápida** - sem latência de rede
- 💪 **Confiabilidade** - dados sempre salvos
- 📊 **Produtividade** - sem interrupções

---

## 🔧 Arquitetura Técnica

### Camadas do Sistema

```
┌─────────────────────────────────────┐
│      Interface do Usuário (UI)      │
│         React Native App             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Camada de Sincronização        │
│   (Detecta online/offline)          │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
┌──────▼──────┐  ┌──────▼──────────┐
│   Banco      │  │   API Cloud     │
│   Local      │  │   (Firebase/    │
│  (SQLite)    │  │   Supabase)     │
└──────────────┘  └─────────────────┘
```

### Banco de Dados Local (SQLite)

**Por que SQLite?**
- Rápido e leve
- Funciona 100% offline
- Suporte nativo no React Native
- Queries SQL completas

**Estrutura de Tabelas Locais:**

```sql
-- Tabela de itens (cache completo)
CREATE TABLE items_local (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE,
    nome TEXT,
    categoria TEXT,
    quantidade_total INTEGER,
    unidade TEXT,
    valor_unitario REAL,
    foto_url TEXT,
    qr_code TEXT,

    -- Campos de sincronização
    sync_status TEXT DEFAULT 'synced', -- synced | pending | conflict
    last_synced_at DATETIME,
    local_updated_at DATETIME,
    server_version INTEGER,

    -- Dados completos em JSON
    data_json TEXT
);

-- Tabela de operações pendentes (fila de sincronização)
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT, -- create | update | delete
    entity_type TEXT, -- item | requisicao | movimentacao
    entity_id TEXT,
    data_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    retry_count INTEGER DEFAULT 0,
    error_message TEXT
);

-- Tabela de localização atual de cada item
CREATE TABLE item_locations (
    id TEXT PRIMARY KEY,
    item_id TEXT,
    status TEXT, -- 'estoque' | 'em_obra' | 'com_funcionario'

    -- Localização (apenas um será preenchido)
    estoque_id TEXT,
    obra_id TEXT,
    funcionario_id TEXT,

    quantidade INTEGER,
    updated_at DATETIME,

    FOREIGN KEY (item_id) REFERENCES items_local(id)
);

-- Tabela de requisições locais
CREATE TABLE requisicoes_local (
    id TEXT PRIMARY KEY,
    numero TEXT,
    solicitante_id TEXT,
    obra_id TEXT,
    status TEXT,
    items_json TEXT, -- Array de itens solicitados
    observacoes TEXT,

    -- Aprovações
    aprovacao_almoxarife_status TEXT,
    aprovacao_almoxarife_data DATETIME,
    aprovacao_gestor_status TEXT,
    aprovacao_gestor_data DATETIME,

    -- Sincronização
    sync_status TEXT DEFAULT 'pending',
    created_at DATETIME,
    updated_at DATETIME
);

-- Tabela de movimentações (histórico)
CREATE TABLE movimentacoes_local (
    id TEXT PRIMARY KEY,
    item_id TEXT,
    tipo TEXT, -- entrada | saida | transferencia | devolucao
    quantidade INTEGER,

    origem_tipo TEXT, -- estoque | obra | funcionario
    origem_id TEXT,

    destino_tipo TEXT,
    destino_id TEXT,

    responsavel_id TEXT,
    observacoes TEXT,

    sync_status TEXT DEFAULT 'pending',
    created_at DATETIME,

    FOREIGN KEY (item_id) REFERENCES items_local(id)
);
```

---

## 🔄 Fluxo de Sincronização

### 1. Detecção de Conectividade

```javascript
// Hook React Native para detectar estado da rede
import NetInfo from '@react-native-community/netinfo';

const [isOnline, setIsOnline] = useState(false);

useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setIsOnline(state.isConnected && state.isInternetReachable);

    if (state.isConnected) {
      // Trigger sincronização automática
      syncManager.sync();
    }
  });

  return () => unsubscribe();
}, []);
```

### 2. Operações Offline

Todas as operações são salvas localmente primeiro:

```javascript
// Exemplo: Criar requisição offline
async function createRequisicao(data) {
  // 1. Gerar ID local (UUID)
  const id = generateUUID();

  // 2. Salvar no banco local
  await db.executeSql(`
    INSERT INTO requisicoes_local
    (id, numero, solicitante_id, obra_id, items_json, status, sync_status)
    VALUES (?, ?, ?, ?, ?, 'pendente', 'pending')
  `, [id, data.numero, data.solicitante, data.obra, JSON.stringify(data.items)]);

  // 3. Adicionar à fila de sincronização
  await db.executeSql(`
    INSERT INTO sync_queue (operation_type, entity_type, entity_id, data_json)
    VALUES ('create', 'requisicao', ?, ?)
  `, [id, JSON.stringify(data)]);

  // 4. Se online, tentar sincronizar imediatamente
  if (isOnline) {
    syncManager.syncEntity('requisicao', id);
  }

  return id;
}
```

### 3. Sincronização Automática

O sistema sincroniza automaticamente em 3 momentos:

1. **Quando reconectar à internet**
2. **A cada 5 minutos** (se online)
3. **Ao abrir o app** (se online)

```javascript
class SyncManager {
  async sync() {
    if (!isOnline) return;

    // 1. Buscar operações pendentes
    const pendingOps = await db.executeSql(`
      SELECT * FROM sync_queue
      ORDER BY created_at ASC
      LIMIT 50
    `);

    // 2. Processar cada operação
    for (const op of pendingOps) {
      try {
        await this.syncOperation(op);

        // Remover da fila após sucesso
        await db.executeSql(`
          DELETE FROM sync_queue WHERE id = ?
        `, [op.id]);

      } catch (error) {
        // Incrementar contador de tentativas
        await db.executeSql(`
          UPDATE sync_queue
          SET retry_count = retry_count + 1,
              error_message = ?
          WHERE id = ?
        `, [error.message, op.id]);

        // Se falhou 5 vezes, marcar para revisão manual
        if (op.retry_count >= 5) {
          await this.notifyConflict(op);
        }
      }
    }

    // 3. Baixar atualizações do servidor
    await this.pullServerUpdates();
  }

  async syncOperation(op) {
    const { operation_type, entity_type, entity_id, data_json } = op;
    const data = JSON.parse(data_json);

    switch (operation_type) {
      case 'create':
        await api.post(`/${entity_type}s`, data);
        break;
      case 'update':
        await api.put(`/${entity_type}s/${entity_id}`, data);
        break;
      case 'delete':
        await api.delete(`/${entity_type}s/${entity_id}`);
        break;
    }
  }

  async pullServerUpdates() {
    // Buscar última sincronização
    const lastSync = await getLastSyncTimestamp();

    // Buscar atualizações do servidor
    const updates = await api.get(`/sync/changes?since=${lastSync}`);

    // Aplicar atualizações localmente
    for (const update of updates.data) {
      await this.applyServerUpdate(update);
    }

    // Atualizar timestamp
    await setLastSyncTimestamp(new Date());
  }
}
```

---

## ⚠️ Resolução de Conflitos

### Tipos de Conflitos

1. **Conflito de Edição Concorrente**
   - Mesmo item editado offline e online simultaneamente

2. **Conflito de Quantidade**
   - Item requisitado offline mas estoque foi alterado online

3. **Conflito de Aprovação**
   - Requisição aprovada offline mas rejeitada online

### Estratégias de Resolução

#### 1. Last Write Wins (LWW)
Para dados não-críticos (ex: observações, notas):

```javascript
if (localVersion.updated_at > serverVersion.updated_at) {
  // Versão local é mais recente, fazer upload
  await api.put(`/items/${id}`, localVersion);
} else {
  // Versão do servidor é mais recente, fazer download
  await updateLocalDatabase(serverVersion);
}
```

#### 2. Validação com Notificação
Para dados críticos (ex: quantidade de estoque):

```javascript
async function resolveStockConflict(localOp, serverState) {
  // Verificar se operação ainda é válida
  if (localOp.tipo === 'saida') {
    if (serverState.quantidade >= localOp.quantidade) {
      // OK, ainda tem estoque suficiente
      await api.post('/movimentacoes', localOp);
    } else {
      // Conflito! Não tem mais estoque
      await notifyUser({
        title: 'Conflito de Estoque',
        message: `O item ${localOp.item_nome} não tem mais quantidade suficiente.
                  Solicitado: ${localOp.quantidade}
                  Disponível: ${serverState.quantidade}`,
        actions: [
          { label: 'Ajustar Quantidade', value: 'adjust' },
          { label: 'Cancelar Operação', value: 'cancel' }
        ]
      });
    }
  }
}
```

#### 3. Merge Manual
Para aprovações e mudanças de estado:

```javascript
async function handleApprovalConflict(requisicao) {
  // Mostrar tela de resolução
  showConflictResolutionScreen({
    title: 'Conflito de Aprovação',
    localState: requisicao.local_status,
    serverState: requisicao.server_status,
    options: [
      'Manter aprovação local',
      'Aceitar aprovação do servidor',
      'Revisar manualmente'
    ]
  });
}
```

---

## 📊 Indicadores Visuais de Sincronização

### Estados Visuais no App

```
┌─────────────────────────────────────┐
│  🟢 ONLINE - Sincronizado           │
│  Última sincronização: há 2 min     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🟡 OFFLINE - 3 operações pendentes │
│  Será sincronizado quando conectar  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🔄 SINCRONIZANDO...                │
│  Enviando 3 operações               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ⚠️ CONFLITO - Requer atenção       │
│  2 operações precisam de revisão    │
│  [Ver Detalhes]                     │
└─────────────────────────────────────┘
```

### Badges em Itens

Cada item/requisição mostra seu status de sincronização:

```
┌─────────────────────────────────────┐
│  Requisição #1234        [✓ Sync]   │  ← Sincronizado
│  Obra: Edifício Central             │
│  5 itens                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Requisição #1235        [📤 Pend]  │  ← Pendente upload
│  Obra: Shopping Norte               │
│  3 itens                            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Requisição #1236        [⚠️ Conf]  │  ← Conflito
│  Obra: Residencial Sul              │
│  2 itens                            │
└─────────────────────────────────────┘
```

---

## 🔐 Segurança Offline

### Criptografia Local

```javascript
// Criptografar dados sensíveis no banco local
import * as Crypto from 'expo-crypto';

async function saveSecureData(key, value) {
  const encrypted = await Crypto.encryptAsync(
    JSON.stringify(value),
    { key: await getEncryptionKey() }
  );

  await AsyncStorage.setItem(key, encrypted);
}
```

### Autenticação

```javascript
// Sistema funciona offline após login inicial
// Token JWT salvo localmente (válido por 30 dias)

async function authenticateOffline() {
  const token = await SecureStore.getItemAsync('auth_token');
  const user = await SecureStore.getItemAsync('user_data');

  if (token && !isTokenExpired(token)) {
    // Usar credenciais em cache
    return { authenticated: true, user: JSON.parse(user) };
  } else {
    // Requer nova autenticação online
    return { authenticated: false, requiresLogin: true };
  }
}
```

---

## 📱 Experiência do Usuário

### Feedback Visual

1. **Banner de Status** (topo da tela)
   ```
   🟢 Online  |  🟡 Offline  |  🔄 Sincronizando
   ```

2. **Notificações**
   - "✅ Operação salva (será sincronizada quando conectar)"
   - "🔄 Sincronizando 5 operações..."
   - "✓ Tudo sincronizado!"
   - "⚠️ 2 conflitos precisam de atenção"

3. **Tela de Sincronização** (acessível no menu)
   ```
   ┌─────────────────────────────────────┐
   │  SINCRONIZAÇÃO                      │
   ├─────────────────────────────────────┤
   │  Status: 🟢 Online                  │
   │  Última sinc.: há 3 minutos         │
   │                                     │
   │  ✓ 15 operações sincronizadas hoje  │
   │  📤 3 operações pendentes           │
   │  ⚠️ 1 conflito                      │
   │                                     │
   │  [Forçar Sincronização Agora]       │
   │  [Ver Operações Pendentes]          │
   │  [Resolver Conflitos]               │
   └─────────────────────────────────────┘
   ```

---

## 🧪 Casos de Uso Práticos

### Caso 1: Almoxarife Sem Internet

**Cenário:**
- Almoxarife está no galpão de estoque (sem WiFi)
- Precisa registrar entrada de 50 novos itens
- Internet só funciona no escritório (100m de distância)

**Fluxo:**
1. ✅ Almoxarife abre o app (funciona offline)
2. ✅ Escaneia QR codes dos novos itens
3. ✅ Registra quantidades e localizações
4. ✅ Dados salvos localmente (SQLite)
5. ⏳ App mostra "📤 50 itens pendentes de sincronização"
6. 🚶 Almoxarife volta ao escritório
7. 🔄 App detecta WiFi e sincroniza automaticamente
8. ✅ "Tudo sincronizado!"

### Caso 2: Funcionário Requisitando na Obra

**Cenário:**
- Funcionário está em obra remota (sem sinal)
- Precisa requisitar ferramentas urgentemente
- Gestor está na mesma obra (também offline)

**Fluxo:**
1. ✅ Funcionário cria requisição offline
2. ✅ Gestor aprova offline (localmente)
3. ⏳ Ambos voltam à área com internet
4. 🔄 Requisição sincroniza automaticamente
5. ✅ Almoxarife no escritório recebe notificação
6. ✅ Separa itens e confirma saída

### Caso 3: Inventário Simultâneo (Multi-usuário)

**Cenário:**
- 3 almoxarifes fazendo inventário offline
- Cada um em uma seção diferente do estoque
- Todos trabalhando simultaneamente

**Fluxo:**
1. ✅ Cada almoxarife trabalha independentemente (offline)
2. ✅ Registra contagens em seu dispositivo
3. 🔄 Ao reconectar, dados são mesclados automaticamente
4. ✅ Sistema soma contagens de seções diferentes
5. ⚠️ Se mesmo item contado 2x, notifica para revisão

---

## 🎯 Métricas de Performance

### Metas de Performance Offline

| Métrica | Meta | Medição |
|---------|------|---------|
| **Tempo de resposta** | < 100ms | Operações locais |
| **Capacidade offline** | 10.000 registros | Banco SQLite |
| **Tamanho do cache** | < 50MB | Dados + imagens |
| **Tempo de sincronização** | < 30s | Para 100 operações |
| **Taxa de conflitos** | < 1% | Do total de operações |
| **Resolução automática** | > 95% | Conflitos resolvidos sem intervenção |

---

## 🛠️ Stack Tecnológico Recomendado

### Mobile App
```javascript
{
  "framework": "React Native + Expo",
  "database": "SQLite (expo-sqlite)",
  "storage": "AsyncStorage + SecureStore",
  "networking": "@react-native-community/netinfo",
  "sync": "Custom Sync Manager",
  "state": "React Query + Zustand"
}
```

### Backend
```javascript
{
  "api": "Node.js + Express / NestJS",
  "database": "PostgreSQL",
  "realtime": "Firebase / Supabase",
  "storage": "AWS S3 / Firebase Storage",
  "sync": "Timestamp-based delta sync"
}
```

---

## 📚 Bibliotecas Úteis

```bash
# Banco de dados local
npm install expo-sqlite

# Detectar conectividade
npm install @react-native-community/netinfo

# Armazenamento seguro
npm install expo-secure-store

# State management com cache
npm install @tanstack/react-query zustand

# Geração de UUIDs
npm install uuid
```

---

## ✅ Checklist de Implementação

### Fase 1: Fundação
- [ ] Configurar SQLite no app
- [ ] Criar esquema de banco de dados local
- [ ] Implementar detecção de conectividade
- [ ] Criar sistema de fila de sincronização

### Fase 2: Operações Básicas
- [ ] CRUD de itens offline
- [ ] Requisições offline
- [ ] Movimentações offline
- [ ] Indicadores visuais de status

### Fase 3: Sincronização
- [ ] Sincronização automática
- [ ] Sincronização manual
- [ ] Delta sync (apenas mudanças)
- [ ] Logs de sincronização

### Fase 4: Conflitos
- [ ] Detecção de conflitos
- [ ] Resolução automática (LWW)
- [ ] Interface de resolução manual
- [ ] Notificações de conflitos

### Fase 5: Performance
- [ ] Cache de imagens
- [ ] Paginação de dados
- [ ] Limpeza de dados antigos
- [ ] Monitoramento de performance

---

## 🎓 Boas Práticas

### 1. Sempre Priorize Local-First
```javascript
// ❌ ERRADO: Tentar salvar online primeiro
try {
  await api.post('/items', data);
  await saveLocally(data);
} catch (error) {
  showError('Sem internet!');
}

// ✅ CORRETO: Salvar localmente primeiro
await saveLocally(data);
if (isOnline) {
  syncManager.sync();
}
```

### 2. Feedback Imediato
```javascript
// Sempre mostre sucesso imediato ao usuário
showToast('✅ Requisição criada!');
// Não espere sincronização para confirmar operação
```

### 3. Timestamps Confiáveis
```javascript
// Use timestamp do servidor após sincronização
const serverTime = await api.get('/time');
const item = {
  ...data,
  created_at: serverTime, // Timestamp confiável
  local_created_at: Date.now() // Apenas para referência
};
```

### 4. IDs Universais
```javascript
// Use UUIDs para evitar conflitos de ID
import uuid from 'uuid';

const id = uuid.v4(); // "550e8400-e29b-41d4-a716-446655440000"
```

---

## 📞 Suporte

Em caso de problemas de sincronização:

1. **Verificar conectividade** - Tela de configurações → Sincronização
2. **Forçar sincronização** - Botão "Sincronizar Agora"
3. **Ver logs** - Exportar logs de sincronização
4. **Suporte técnico** - suporte@seuapp.com

---

**Documentação criada em:** 2025-11-11
**Versão:** 1.0
**Próxima revisão:** Após implementação do MVP
