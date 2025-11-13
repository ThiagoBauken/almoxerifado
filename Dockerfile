# Dockerfile para Backend + Frontend
# Stage 1: Build do Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

# Copiar package files do frontend
COPY web/package*.json ./

# Instalar dependências
RUN npm install

# Copiar código do frontend
COPY web/ ./

# Build do frontend
RUN npm run build

# Stage 2: Backend + Frontend estático
FROM node:18-alpine

WORKDIR /app

# Copiar package files do backend
COPY backend/package*.json ./

# Copiar código do backend (exceto node_modules)
COPY backend/ ./

# Instalar ferramentas de build necessárias para compilar bcrypt
RUN apk add --no-cache python3 make g++

# Instalar dependências do backend (força rebuild de nativos)
RUN npm ci --production && npm rebuild bcrypt --build-from-source

# Copiar build do frontend para pasta public
COPY --from=frontend-builder /frontend/dist ./public

# Tornar entrypoint executável
RUN chmod +x entrypoint.sh

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar entrypoint que roda migrations antes de iniciar
ENTRYPOINT ["sh", "entrypoint.sh"]
