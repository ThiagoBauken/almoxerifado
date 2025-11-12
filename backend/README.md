# 🚀 Almoxarifado Backend API

Backend Node.js + Express + PostgreSQL para o sistema de almoxarifado.

## 📋 Funcionalidades

- ✅ **Autenticação JWT** (login, registro, verificação de token)
- ✅ **CRUD completo de Itens** (criar, ler, atualizar, deletar)
- ✅ **Sistema de Transferências** com confirmação bilateral
- ✅ **Transferências em lote** (múltiplos itens)
- ✅ **Histórico completo** de movimentações
- ✅ **Sincronização incremental** (enviar apenas mudanças)
- ✅ **Estatísticas** (dashboard)
- ✅ **Gestão de Usuários, Obras, Categorias**

## 🛠 Tecnologias

- Node.js 18+
- Express 4
- PostgreSQL 14+
- JWT para autenticação
- Bcrypt para hash de senhas
- Helmet para segurança
- CORS configurável

## 📁 Estrutura

```
backend/
├── server.js                 # Servidor principal
├── .env.example              # Variáveis de ambiente (exemplo)
├── package.json              # Dependências
├── database/
│   ├── config.js             # Configuração do PostgreSQL
│   ├── migrate.js            # Script de migrations
│   └── seed.js               # Script de seed (dados iniciais)
└── routes/
    ├── auth.js               # Autenticação (login, register)
    ├── items.js              # CRUD de itens
    ├── transfers.js          # Transferências
    ├── users.js              # Usuários
    ├── categories.js         # Categorias
    ├── obras.js              # Obras
    └── sync.js               # Sincronização
```

## 🔧 Como Rodar

### 1. Instalar PostgreSQL

**Windows:**
```bash
# Baixe e instale: https://www.postgresql.org/download/windows/
```

**Mac:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE almoxarifado;

# Sair
\q
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env

# Editar .env com suas configurações
nano .env
```

**.env:**
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=almoxarifado
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

JWT_SECRET=seu_secret_super_seguro_mude_em_producao
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:19006,http://localhost:19000
```

### 4. Instalar Dependências

```bash
cd backend
npm install
```

### 5. Rodar Migrations

```bash
npm run migrate
```

### 6. (Opcional) Popular com Dados de Teste

```bash
npm run seed
```

### 7. Iniciar Servidor

```bash
# Desenvolvimento (com nodemon)
npm run dev

# Produção
npm start
```

Servidor rodando em: http://localhost:3000

## 📡 Endpoints da API

### Autenticação

#### POST /api/auth/login
Login no sistema

**Request:**
```json
{
  "email": "thiago@obra.com",
  "senha": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid",
      "nome": "Thiago Silva",
      "email": "thiago@obra.com",
      "perfil": "funcionario"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/register
Criar novo usuário

**Request:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "123456",
  "perfil": "funcionario",
  "obra_id": "uuid-opcional"
}
```

#### GET /api/auth/verify
Verificar token (requer autenticação)

**Headers:**
```
Authorization: Bearer {token}
```

### Itens

#### GET /api/items
Listar itens

**Query Params:**
- `estado` - Filtrar por estado
- `categoria_id` - Filtrar por categoria
- `funcionario_id` - Filtrar por funcionário
- `search` - Buscar por nome ou lacre
- `limit` - Limite de resultados (default: 100)
- `offset` - Offset para paginação
- `since` - Timestamp para sincronização incremental

#### GET /api/items/:id
Buscar item por ID

#### POST /api/items
Criar novo item

**Request:**
```json
{
  "lacre": "LAC-001",
  "nome": "Capacete de Segurança",
  "categoria_id": "uuid",
  "estado": "disponivel_estoque",
  "foto": "url",
  "valor_unitario": 50.00
}
```

#### PUT /api/items/:id
Atualizar item

#### DELETE /api/items/:id
Deletar item

#### GET /api/items/stats/overview
Estatísticas gerais

### Transferências

#### GET /api/transfers
Listar transferências

**Query Params:**
- `status` - Filtrar por status (pendente, concluida, cancelada)
- `usuario_id` - Filtrar por usuário (remetente ou destinatário)
- `since` - Sincronização incremental

#### POST /api/transfers
Criar transferência única

**Request:**
```json
{
  "item_id": "uuid",
  "tipo": "transferencia",
  "de_usuario_id": "uuid",
  "para_usuario_id": "uuid",
  "de_localizacao": "Estoque Principal",
  "para_localizacao": "Obra 1 - João Silva",
  "assinatura_remetente": "Carlos Almoxarife",
  "observacoes": "Item em bom estado"
}
```

#### POST /api/transfers/batch
Criar múltiplas transferências

**Request:**
```json
{
  "item_ids": ["uuid1", "uuid2", "uuid3"],
  "de_usuario_id": "uuid",
  "para_usuario_id": "uuid",
  "observacoes": "Transferência em lote"
}
```

#### PUT /api/transfers/:id/respond
Aceitar ou rejeitar transferência

**Request:**
```json
{
  "accepted": true,
  "assinatura_destinatario": "Thiago Silva",
  "observacoes": "Itens recebidos OK"
}
```

#### GET /api/transfers/item/:item_id/history
Histórico de transferências de um item

### Usuários, Obras, Categorias

#### GET /api/users
Listar usuários

#### GET /api/obras
Listar obras

#### GET /api/categories
Listar categorias

### Sincronização

#### POST /api/sync/full
Sincronização completa

**Request:**
```json
{
  "lastSync": "2025-01-10T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "transfers": [...],
    "users": [...],
    "categories": [...],
    "obras": [...],
    "syncTimestamp": "2025-01-10T12:00:00.000Z"
  }
}
```

## 🔒 Autenticação

Todas as rotas (exceto `/api/auth/login` e `/api/auth/register`) requerem token JWT.

**Header:**
```
Authorization: Bearer {seu_token_aqui}
```

## 📊 Estados dos Itens

- `disponivel_estoque` - Disponível no estoque
- `pendente_aceitacao` - Aguardando aceitação
- `com_funcionario` - Com funcionário
- `em_obra` - Em uma obra
- `em_manutencao` - Em manutenção
- `em_transito` - Em trânsito
- `inativo` - Inativo
- `extraviado` - Extraviado
- `danificado` - Danificado

## 🔄 Fluxo de Transferência

1. **Remetente cria transferência** (`POST /api/transfers`)
   - Item muda para `pendente_aceitacao`

2. **Destinatário aceita/rejeita** (`PUT /api/transfers/:id/respond`)
   - Se aceito: Item vai para destinatário (`com_funcionario`)
   - Se rejeitado: Item volta para remetente

## 🐛 Troubleshooting

### Erro: "ECONNREFUSED" ao conectar PostgreSQL
- Verifique se PostgreSQL está rodando: `sudo systemctl status postgresql`
- Verifique credenciais no `.env`

### Erro: "relation does not exist"
- Execute as migrations: `npm run migrate`

### Erro: "JWT malformed"
- Token inválido ou expirado
- Faça login novamente

## 🚀 Deploy em Produção

### Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create almoxarifado-api

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Configurar variáveis de ambiente
heroku config:set JWT_SECRET=seu_secret_seguro
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Rodar migrations
heroku run npm run migrate
```

### Railway / Render

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático a cada push

## 📄 Licença

MIT

## 👨‍💻 Desenvolvido por

Claude Code - Backend API de Almoxarifado
