# 📱 Almoxarifado Mobile App

App mobile React Native com **funcionalidade offline-first** para gestão de almoxarifado.

## 🚀 Tecnologias

- **React Native** com Expo
- **SQLite** para persistência local
- **React Navigation** para navegação
- **Expo Camera** para scanner QR Code
- **Axios** para comunicação com API

## 📋 Funcionalidades

### ✅ Implementadas

1. **Autenticação**
   - Login
   - Perfil do usuário

2. **Dashboard**
   - Estatísticas em tempo real
   - Alertas de transferências pendentes
   - Ações rápidas

3. **Gestão de Itens**
   - Listagem com busca e filtros
   - Detalhes do item
   - Rastreamento de localização

4. **Scanner QR Code**
   - Escanear itens (lacres)
   - Escanear transferências
   - Feedback visual

5. **Transferências (Sistema Bilateral)**
   - Selecionar múltiplos itens
   - Escolher destinatário
   - Gerar QR Code
   - Receber e aceitar/rejeitar itens
   - Aceitação parcial (aceitar alguns, rejeitar outros)

6. **Histórico**
   - Todas as movimentações
   - Filtros por status
   - Detalhes de cada transferência

7. **Sistema Offline**
   - Banco de dados SQLite local
   - Fila de sincronização
   - Auto-sync quando online
   - Resolução de conflitos (Last Write Wins)

## 📁 Estrutura do Projeto

```
mobile/
├── App.js                      # Arquivo principal com navegação
├── package.json                # Dependências
├── src/
│   ├── screens/                # Telas do app
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── ProfileScreen.js
│   │   ├── Home/
│   │   │   └── HomeScreen.js
│   │   ├── Items/
│   │   │   ├── ItemsListScreen.js
│   │   │   └── ItemDetailScreen.js
│   │   ├── QR/
│   │   │   └── QRScannerScreen.js
│   │   ├── Transfer/
│   │   │   ├── TransferSelectItemsScreen.js
│   │   │   ├── TransferGenerateQRScreen.js
│   │   │   └── TransferReceiveScreen.js
│   │   └── History/
│   │       └── HistoryScreen.js
│   ├── services/               # Serviços
│   │   ├── database.js         # SQLite operations
│   │   └── syncService.js      # Sincronização online/offline
│   └── data/
│       └── mockData.js         # Dados de exemplo (development)
```

## 🔧 Como Rodar

### 1. Instalar dependências

```bash
cd mobile
npm install
```

### 2. Iniciar o app

```bash
# Android
npm run android

# iOS
npm run ios

# Web (para testes)
npm run web
```

### 3. Testar no dispositivo físico

1. Instale o app **Expo Go** no seu celular:
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)

2. Execute:
```bash
npm start
```

3. Escaneie o QR Code que aparecer no terminal

## 👥 Usuários de Teste

Use estes usuários para fazer login no app:

| Email | Perfil | Senha |
|-------|--------|-------|
| thiago@obra.com | Funcionário | 123456 |
| fabricio@obra.com | Funcionário | 123456 |
| carlos@almoxarifado.com | Almoxarife | 123456 |
| maria@gestao.com | Gestor | 123456 |

## 🔄 Sistema Offline

### Como Funciona

1. **Todas as operações são salvas localmente primeiro** (SQLite)
2. **Fila de sincronização** armazena mudanças não enviadas
3. **Auto-sync** tenta enviar mudanças a cada 5 minutos
4. **Sync on reconnect** sincroniza automaticamente quando internet volta
5. **Resolução de conflitos** usa Last Write Wins (timestamp mais recente)

### Testando Offline

1. Desative Wi-Fi e dados móveis
2. Use o app normalmente (transferir itens, aceitar, etc.)
3. Todas as mudanças ficam na fila
4. Reative a conexão
5. App sincroniza automaticamente

### Verificar Status de Sincronização

No código:
```javascript
import { getSyncStatus } from './src/services/syncService';

const status = await getSyncStatus();
console.log(status);
// {
//   online: true,
//   syncing: false,
//   lastSync: Date,
//   pendingChanges: 3,
//   autoSyncActive: true
// }
```

## 📦 Banco de Dados SQLite

### Tabelas

- **items** - Itens do almoxarifado
- **users** - Usuários do sistema
- **obras** - Obras/locais
- **transfers** - Histórico de transferências
- **sync_queue** - Fila de sincronização
- **settings** - Configurações do app

### Visualizar Banco de Dados

Para ver os dados no SQLite durante desenvolvimento:

```bash
# Android
adb pull /data/data/host.exp.exponent/databases/almoxarifado.db .
sqlite3 almoxarifado.db

# iOS - usar ferramentas Xcode
```

## 🎨 Design System

### Cores

- **Primary Blue**: `#2563EB`
- **Success Green**: `#10B981`
- **Warning Yellow**: `#F59E0B`
- **Error Red**: `#EF4444`
- **Gray Background**: `#F3F4F6`
- **White**: `#FFFFFF`

### Ícones (Emoji)

- 📦 Item
- 👤 Usuário
- 🏗️ Obra
- ✅ Aceito/Disponível
- ❌ Rejeitado
- ⏳ Pendente
- 🔄 Transferência
- 🔧 Manutenção
- 📷 Scanner
- 📊 Estatísticas

## 🔐 Permissões Necessárias

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### iOS (ios/[YourApp]/Info.plist)

```xml
<key>NSCameraUsageDescription</key>
<string>Precisamos da câmera para escanear QR Codes dos itens</string>
```

## 🚧 Próximos Passos

### Para Produção

1. **Substituir Mock Data por API real**
   - Trocar `mockData.js` por chamadas ao backend
   - Implementar autenticação JWT

2. **Melhorar Sincronização**
   - Adicionar retry exponencial
   - Implementar merge manual para conflitos complexos
   - Background sync (quando app estiver fechado)

3. **Adicionar Recursos**
   - Foto de itens na transferência
   - Assinatura digital
   - Notificações push
   - Modo escuro

4. **Performance**
   - Paginação na lista de itens
   - Cache de imagens
   - Lazy loading

5. **Build & Deploy**
   - Configurar EAS Build (Expo)
   - Publicar na Google Play
   - Publicar na App Store

## 📝 Scripts Úteis

```bash
# Limpar cache
npm start -- --clear

# Verificar erros
npm run lint

# Gerar build Android
eas build --platform android

# Gerar build iOS
eas build --platform ios
```

## 🐛 Troubleshooting

### Erro de permissão da câmera
- Vá em Configurações > Apps > Expo Go > Permissões
- Ative a câmera

### App não sincroniza
- Verifique se o backend está rodando
- Verifique a URL da API em `src/services/syncService.js`
- Veja logs com `console.log`

### SQLite não funciona
- Instale novamente: `expo install expo-sqlite`
- Limpe cache: `npm start -- --clear`

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Claude Code - Sistema de Almoxarifado Mobile
