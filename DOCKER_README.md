# 🐳 Docker - Rodar Tudo com Um Comando

Este guia mostra como rodar o sistema COMPLETO usando Docker Compose.

## 📦 O que está incluído

- **PostgreSQL 14** (banco de dados)
- **Backend API** (Node.js + Express)
- **Web Dashboard** (React + Nginx)

## 🚀 Quick Start

### 1. Instalar Docker

**Windows:**
- Baixe [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Instale e reinicie o PC

**Mac:**
```bash
brew install --cask docker
```

**Linux (Ubuntu):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. Rodar TUDO de Uma Vez

```bash
# Na raiz do projeto
docker-compose up -d
```

Pronto! 🎉

**Serviços disponíveis:**
- Backend API: http://localhost:3000
- Web Dashboard: http://localhost:5173
- PostgreSQL: localhost:5432

### 3. Popular Banco com Dados de Teste

```bash
docker-compose exec backend npm run seed
```

### 4. Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas web
docker-compose logs -f web
```

### 5. Parar Tudo

```bash
docker-compose down
```

### 6. Parar e Limpar TUDO (incluindo dados)

```bash
docker-compose down -v
```

## 📋 Comandos Úteis

### Ver status dos containers

```bash
docker-compose ps
```

### Reiniciar um serviço específico

```bash
docker-compose restart backend
```

### Acessar shell do container

```bash
# Backend
docker-compose exec backend sh

# PostgreSQL
docker-compose exec postgres psql -U postgres -d almoxarifado
```

### Ver logs em tempo real

```bash
docker-compose logs -f --tail=100
```

### Rebuild (após mudanças no código)

```bash
docker-compose up -d --build
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite `docker-compose.yml` para alterar configurações:

```yaml
backend:
  environment:
    JWT_SECRET: mude_isso_em_producao
    CORS_ORIGIN: http://seu-dominio.com
```

### Portas

Altere as portas se necessário:

```yaml
ports:
  - "3001:3000"  # Backend em 3001 ao invés de 3000
  - "8080:80"    # Web em 8080 ao invés de 5173
```

## 🗄️ Banco de Dados

### Acessar PostgreSQL

```bash
docker-compose exec postgres psql -U postgres -d almoxarifado
```

### Backup do Banco

```bash
docker-compose exec postgres pg_dump -U postgres almoxarifado > backup.sql
```

### Restaurar Backup

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d almoxarifado
```

### Resetar Banco (CUIDADO!)

```bash
docker-compose down -v  # Para e apaga dados
docker-compose up -d    # Recria tudo
docker-compose exec backend npm run migrate  # Recria tabelas
docker-compose exec backend npm run seed     # Popula com dados
```

## 📊 Monitoramento

### Ver uso de recursos

```bash
docker stats
```

### Ver volumes

```bash
docker volume ls
```

### Ver redes

```bash
docker network ls
```

## 🔥 Desenvolvimento vs Produção

### Desenvolvimento (atual)

```yaml
# docker-compose.yml
environment:
  NODE_ENV: development
volumes:
  - ./backend:/app  # Hot reload
```

### Produção

```yaml
# docker-compose.prod.yml
environment:
  NODE_ENV: production
# Sem volumes (código dentro da imagem)
```

Rodar em produção:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🚨 Troubleshooting

### Erro: "port is already allocated"

Outra aplicação está usando a porta.

**Solução 1: Parar aplicação que está usando**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solução 2: Mudar porta no docker-compose.yml**
```yaml
ports:
  - "3001:3000"
```

### Erro: "no space left on device"

Docker sem espaço.

**Solução:**
```bash
docker system prune -a --volumes
```

### Container não inicia

Ver logs:
```bash
docker-compose logs backend
```

### Backend não conecta ao PostgreSQL

Espere alguns segundos (healthcheck do postgres demora).

Ou force restart:
```bash
docker-compose restart backend
```

### Web não carrega

1. Verificar se backend está rodando:
```bash
curl http://localhost:3000/health
```

2. Verificar logs do Nginx:
```bash
docker-compose logs web
```

## 🎯 Arquitetura

```
┌─────────────────────────────────────────┐
│         Docker Network                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐                       │
│  │  PostgreSQL  │ :5432                 │
│  └──────┬───────┘                       │
│         │                               │
│  ┌──────▼───────┐                       │
│  │   Backend    │ :3000                 │
│  │ (Node.js)    │                       │
│  └──────┬───────┘                       │
│         │                               │
│  ┌──────▼───────┐                       │
│  │     Web      │ :80 → :5173           │
│  │  (React)     │                       │
│  └──────────────┘                       │
│                                         │
└─────────────────────────────────────────┘
```

## 📦 Tamanho das Imagens

- PostgreSQL: ~80MB
- Backend: ~150MB
- Web: ~25MB (apenas Nginx + build)

**Total: ~255MB**

## 🔐 Segurança

### Produção: NÃO usar docker-compose.yml direto!

Crie `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}  # De arquivo .env
  backend:
    environment:
      JWT_SECRET: ${JWT_SECRET}
      DB_PASSWORD: ${DB_PASSWORD}
```

E crie `.env`:
```
DB_PASSWORD=senha_super_segura_aleatoria
JWT_SECRET=outro_secret_super_seguro
```

Rodar:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env up -d
```

## 🌐 Deploy em Cloud

### AWS (ECS)

1. Build e push para ECR
2. Criar task definitions
3. Criar service
4. Usar RDS para PostgreSQL

### Google Cloud (Cloud Run)

```bash
gcloud builds submit --tag gcr.io/PROJECT/backend
gcloud run deploy backend --image gcr.io/PROJECT/backend
```

### DigitalOcean (App Platform)

1. Conectar GitHub
2. Auto-deploy do docker-compose.yml
3. Usar Managed PostgreSQL

### Railway / Render

Upload do projeto → Auto-deploy via Docker

## ✅ Checklist de Deploy

- [ ] Mudar JWT_SECRET
- [ ] Mudar DB_PASSWORD
- [ ] Configurar CORS correto
- [ ] Testar conexões
- [ ] Configurar backups automáticos
- [ ] Configurar SSL/HTTPS
- [ ] Monitoramento (logs, métricas)
- [ ] Documentar URLs de produção

## 🎉 Conclusão

Com Docker Compose, você tem:
- ✅ Ambiente isolado
- ✅ Fácil de replicar
- ✅ Um comando para rodar tudo
- ✅ Portável (funciona em qualquer OS)
- ✅ Pronto para produção

**Rodar:**
```bash
docker-compose up -d
docker-compose exec backend npm run seed
```

**Acessar:**
- Web: http://localhost:5173
- API: http://localhost:3000/health

**Parar:**
```bash
docker-compose down
```

---

📚 **Mais info:**
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
