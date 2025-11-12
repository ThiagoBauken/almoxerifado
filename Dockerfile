# Dockerfile para Backend API
FROM node:18-alpine

WORKDIR /app

# Copiar package files do backend
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código do backend
COPY backend/ ./

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Rodar migrations e iniciar
CMD ["sh", "-c", "npm run migrate && npm run migrate:storage && npm start"]
