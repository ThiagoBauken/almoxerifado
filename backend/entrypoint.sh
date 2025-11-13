#!/bin/sh
set -e

echo "🚀 Iniciando aplicação Almoxarifado..."

# Construir DATABASE_URL a partir das variáveis separadas
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
echo "   Conectando em: ${DB_HOST}:${DB_PORT}/${DB_NAME}"
until node -e "const {Pool} = require('pg'); const pool = new Pool({host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD}); pool.query('SELECT 1').then(() => {console.log('DB OK'); pool.end(); process.exit(0)}).catch((e) => {console.error('DB Error:', e.message); pool.end(); process.exit(1)})" 2>/dev/null; do
  echo "⏳ Banco de dados não está pronto - aguardando..."
  sleep 2
done

echo "✅ Banco de dados conectado!"

# Executar migrations
echo "📦 Executando migrations..."
node database/run-all-migrations.js || {
  echo "⚠️  Migrations falharam, mas continuando..."
}

echo "✅ Migrations concluídas!"

# Iniciar servidor
echo "🚀 Iniciando servidor..."
exec npm start
