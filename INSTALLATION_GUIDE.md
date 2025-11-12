# 📦 StockMaster - Guia de Instalação Completo

## 🎯 Visão Geral

StockMaster é um sistema completo de gerenciamento de almoxarifado com:
- ✅ **Backend API** - Node.js + Express + PostgreSQL
- ✅ **App Mobile** - Flutter (Android APK) com modo offline
- ✅ **Painel Web** - React + TailwindCSS (opcional)

---

## 🚀 Instalação do Backend

### 1. Pré-requisitos
```bash
# Instalar Node.js (v18+)
# Instalar PostgreSQL (v14+)
```

### 2. Configurar Banco de Dados
```bash
# Criar banco de dados PostgreSQL
createdb stockmaster_db

# Ou via psql:
psql -U postgres
CREATE DATABASE stockmaster_db;
\q
```

### 3. Instalar Backend
```bash
cd backend-api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=stockmaster_db
# DB_USER=postgres
# DB_PASSWORD=sua_senha
# JWT_SECRET=sua_chave_secreta_super_segura
```

### 4. Popular Banco de Dados
```bash
# Executar seed (criar tabelas e dados iniciais)
npm run seed
```

### 5. Iniciar Servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start

# Servidor estará rodando em: http://localhost:3000
```

### ✅ Credenciais Padrão
Após o seed, você terá estes usuários:

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@stockmaster.com | admin123 |
| Gerente | gerente@stockmaster.com | gerente123 |
| Operador | operador@stockmaster.com | operador123 |
| Usuário | usuario@stockmaster.com | usuario123 |

---

## 📱 Instalação do App Mobile (Flutter)

### 1. Pré-requisitos
```bash
# Instalar Flutter SDK
# https://docs.flutter.dev/get-started/install

# Verificar instalação
flutter doctor
```

### 2. Configurar Projeto
```bash
cd mobile-app

# Instalar dependências
flutter pub get

# Gerar código (Hive adapters)
flutter pub run build_runner build --delete-conflicting-outputs
```

### 3. Configurar URL da API
Editar `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://SEU_IP:3000/api';
// Exemplo: 'http://192.168.1.100:3000/api'
```

### 4. Compilar APK
```bash
# Compilar APK de release
flutter build apk --release

# APK estará em: build/app/outputs/flutter-apk/app-release.apk
```

### 5. Instalar em Dispositivo Android
```bash
# Via USB (com depuração USB ativada)
flutter install

# Ou copiar o APK e instalar manualmente
```

---

## 🌐 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/auth/me` - Dados do usuário
- `PUT /api/auth/profile` - Atualizar perfil

### Itens
- `GET /api/items` - Listar itens
- `GET /api/items/:id` - Buscar item por ID
- `GET /api/items/code/:code` - Buscar por código QR
- `POST /api/items` - Criar item
- `PUT /api/items/:id` - Atualizar item
- `DELETE /api/items/:id` - Deletar item

### Solicitações
- `GET /api/requests` - Listar solicitações
- `GET /api/requests/:id` - Buscar solicitação
- `POST /api/requests` - Criar solicitação
- `PUT /api/requests/:id/approve` - Aprovar
- `PUT /api/requests/:id/reject` - Rejeitar
- `PUT /api/requests/:id/complete` - Completar
- `PUT /api/requests/:id/cancel` - Cancelar

---

## 📊 Estrutura do Sistema

### Backend (Node.js + PostgreSQL)
```
backend-api/
├── src/
│   ├── config/        # Configurações
│   ├── controllers/   # Lógica de negócio
│   ├── models/        # Models do banco
│   ├── routes/        # Rotas da API
│   ├── middleware/    # Autenticação, etc
│   └── server.js      # Servidor principal
├── database/
│   └── seed.js        # Popular banco
└── package.json
```

### Mobile (Flutter)
```
mobile-app/
├── lib/
│   ├── models/        # Modelos de dados
│   ├── screens/       # Telas do app
│   ├── services/      # API e Sync
│   ├── widgets/       # Componentes
│   └── main.dart      # App principal
├── android/           # Config Android
└── pubspec.yaml       # Dependências
```

---

## 🔧 Funcionalidades Principais

### 1. Sistema de Localização
- Container → Prateleira → Fileira → Caixa
- Código único gerado automaticamente
- Exemplo: `HEI-P1-FA-C5`

### 2. QR Code
- Gerado automaticamente para cada item
- Scanner integrado no app
- Identificação rápida de equipamentos

### 3. Solicitações de Retirada
- Usuário solicita → Gerente aprova → Operador entrega
- Sistema de prioridades (baixa, normal, alta, urgente)
- Histórico completo

### 4. Modo Offline
- App funciona 100% offline
- Sincronização automática quando há internet
- Fila de pendências

### 5. Controle de Estoque
- Estoque mínimo com alertas
- Rastreamento de movimentações
- Dashboard com estatísticas

---

## 🎨 Personalização

### Adicionar Novos Containers/Localizações
```sql
INSERT INTO locations (id, container, shelf, row, box, capacity) 
VALUES (
  'uuid-aqui',
  'NOME DO CONTAINER',
  '1',
  'A',
  '1',
  100
);
```

### Adicionar Novas Categorias
```sql
INSERT INTO categories (id, name, type, color) 
VALUES (
  'uuid-aqui',
  'Nova Categoria',
  'equipment', -- ou 'tool', 'consumable'
  '#3B82F6'
);
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar variáveis de ambiente
cat .env

# Verificar logs
npm run dev
```

### App não conecta
```bash
# Verificar IP correto no api_service.dart
# Verificar firewall permitindo porta 3000
# Testar no navegador: http://SEU_IP:3000/api/health
```

### Erro de sincronização
```bash
# Limpar cache do app
# Reinstalar app
# Verificar conexão com API
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do backend
2. Verifique os logs do app Flutter
3. Consulte a documentação da API

---

## 🎉 Pronto!

Seu sistema StockMaster está configurado e rodando! 

**Próximos passos:**
1. Fazer login com as credenciais padrão
2. Adicionar seus itens e localizações
3. Testar o scanner QR Code
4. Criar solicitações de teste
5. Personalizar conforme sua necessidade

