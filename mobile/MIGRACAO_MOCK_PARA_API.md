# 🔄 Guia: Migrar de Mock Data para API Real

Este guia mostra como trocar os dados mock (fake) pela API real do backend.

## 📋 Pré-requisitos

1. **Backend rodando**:
```bash
cd backend
npm run dev
# Servidor em http://localhost:3000
```

2. **Banco populado**:
```bash
cd backend
npm run seed
```

## 🔧 Passo 1: Configurar URL da API

Edite `mobile/src/services/api.js`:

```javascript
// Trocar localhost pelo IP do seu computador
const API_BASE_URL = 'http://192.168.1.100:3000/api';
// Ex: Se seu PC é 192.168.1.50, use: http://192.168.1.50:3000/api
```

**Como descobrir seu IP:**
- Windows: `ipconfig` (procure "IPv4")
- Mac/Linux: `ifconfig` ou `ip addr`

## 🔀 Passo 2: Atualizar Cada Tela

### Exemplo: ItemsListScreen.js

**ANTES (Mock):**
```javascript
import { mockItens, mockCategorias } from '../../data/mockData';

function ItemsListScreen() {
  const [items, setItems] = useState(mockItens);
  // ...
}
```

**DEPOIS (API):**
```javascript
import { getItems } from '../../services/api';
import { useEffect } from 'react';

function ItemsListScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const result = await getItems();
    if (result.success) {
      setItems(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return <LoadingScreen />;
  }
  // ...
}
```

## 📝 Checklist de Migração

### ✅ Telas que precisam ser atualizadas:

- [ ] **LoginScreen** → Usar `login()` da API
- [ ] **HomeScreen** → Usar `getItemsStats()` e `getTransfers()`
- [ ] **ItemsListScreen** → Usar `getItems()`
- [ ] **ItemDetailScreen** → Usar `getItemById()` e `getItemHistory()`
- [ ] **TransferSelectItemsScreen** → Usar `getItems()` e `getUsers()`
- [ ] **TransferGenerateQRScreen** → Usar `createBatchTransfers()`
- [ ] **TransferReceiveScreen** → Usar `respondTransfer()`
- [ ] **HistoryScreen** → Usar `getTransfers()`

### 🔐 Login

**LoginScreen.js**

**ANTES:**
```javascript
import { mockUsers, setCurrentUser } from '../../data/mockData';

const handleLogin = () => {
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
    navigation.replace('Main');
  }
};
```

**DEPOIS:**
```javascript
import { login } from '../../services/api';

const handleLogin = async () => {
  setLoading(true);
  const result = await login(email, senha);

  if (result.success) {
    navigation.replace('Main');
  } else {
    Alert.alert('Erro', result.message);
  }
  setLoading(false);
};
```

### 📊 Dashboard

**HomeScreen.js**

**ANTES:**
```javascript
import { mockEstatisticas, mockItens } from '../../data/mockData';

const stats = mockEstatisticas;
const meusItens = mockItens.filter(item => item.funcionario_id === user.id);
```

**DEPOIS:**
```javascript
import { getItemsStats, getItems } from '../../services/api';

const [stats, setStats] = useState(null);
const [meusItens, setMeusItens] = useState([]);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  const statsResult = await getItemsStats();
  const itemsResult = await getItems({ funcionario_id: user.id });

  if (statsResult.success) setStats(statsResult.data);
  if (itemsResult.success) setMeusItens(itemsResult.data);
};
```

### 🔄 Transferências

**TransferGenerateQRScreen.js**

**ANTES:**
```javascript
const handleConfirmTransfer = () => {
  // Apenas mostrar QR
  setTransferSent(true);
};
```

**DEPOIS:**
```javascript
import { createBatchTransfers } from '../../services/api';

const handleConfirmTransfer = async () => {
  setLoading(true);

  const result = await createBatchTransfers({
    item_ids: itemIds,
    de_usuario_id: currentUser.id,
    para_usuario_id: recipientId,
  });

  if (result.success) {
    setTransferSent(true);
    Alert.alert('Sucesso', 'Transferência criada!');
  } else {
    Alert.alert('Erro', result.message);
  }

  setLoading(false);
};
```

**TransferReceiveScreen.js**

**ANTES:**
```javascript
const handleConfirm = () => {
  // Apenas marcar como aceito localmente
  Alert.alert('Sucesso', 'Recebimento confirmado!');
};
```

**DEPOIS:**
```javascript
import { respondTransfer } from '../../services/api';

const handleConfirm = async () => {
  setLoading(true);

  for (const [itemId, accepted] of Object.entries(itemsDecision)) {
    const transfer = transfers.find(t => t.item_id === itemId);

    await respondTransfer(transfer.id, {
      accepted: accepted,
      assinatura_destinatario: currentUser.nome,
    });
  }

  setLoading(false);
  Alert.alert('Sucesso', 'Recebimento confirmado!');
  navigation.navigate('Home');
};
```

## 🔄 Passo 3: Sincronização Offline

Já está configurado! O arquivo `mobile/src/services/syncService.js` já usa a API:

```javascript
import { syncFull } from './api';

const downloadServerData = async () => {
  const lastSync = await getSetting('last_sync');
  const result = await syncFull(lastSync);

  if (result.success) {
    // Salvar dados no SQLite
    await bulkSaveItems(result.data.items);
    // ...
  }
};
```

## 🧪 Passo 4: Testar

### 1. Modo Online (com backend)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Mobile
cd mobile
npm start
```

**Teste:**
- Login com `thiago@obra.com` / `123456`
- Ver lista de itens (deve carregar do servidor)
- Criar transferência
- Scanner funciona
- Histórico aparece

### 2. Modo Offline (sem backend)

**Teste:**
- Desligar backend (`Ctrl+C`)
- Ou desativar Wi-Fi no celular
- App deve continuar funcionando (dados do SQLite local)
- Fila de sincronização acumula mudanças
- Religar backend
- Mudanças sincronizam automaticamente

## ⚠️ Problemas Comuns

### Erro: "Network request failed"

**Causa:** App não consegue conectar ao backend

**Solução:**
1. Verificar se backend está rodando
2. Trocar `localhost` pelo IP correto em `api.js`
3. Garantir que PC e celular estão na mesma rede Wi-Fi

### Erro: "401 Unauthorized"

**Causa:** Token expirado ou inválido

**Solução:**
1. Fazer logout e login novamente
2. Verificar se JWT_SECRET está configurado no backend

### Dados não aparecem

**Causa:** Banco vazio

**Solução:**
```bash
cd backend
npm run seed
```

## 📦 Componente de Loading

Crie `mobile/src/components/LoadingScreen.js`:

```javascript
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

export default function LoadingScreen({ message = 'Carregando...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});
```

## ✅ Checklist Final

- [ ] Backend rodando (`npm run dev`)
- [ ] Banco populado (`npm run seed`)
- [ ] URL da API configurada (IP correto)
- [ ] Todas as telas migraram de mock para API
- [ ] Loading states adicionados
- [ ] Error handling implementado
- [ ] Testado modo online
- [ ] Testado modo offline
- [ ] Sincronização funcionando

## 🎉 Pronto!

Agora seu app está conectado ao backend real!

**Próximos passos:**
1. Adicionar tratamento de erros robusto
2. Implementar retry automático
3. Melhorar UX com skeleton screens
4. Adicionar notificações de sincronização
