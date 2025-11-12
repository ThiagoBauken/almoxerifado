#!/bin/sh
set -e

echo "🚀 Iniciando aplicação Almoxarifado..."

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando banco de dados..."
until node -e "const {Pool} = require('pg'); const pool = new Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT 1').then(() => {console.log('DB OK'); pool.end(); process.exit(0)}).catch((e) => {console.error('DB Error:', e.message); pool.end(); process.exit(1)})" 2>/dev/null; do
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
