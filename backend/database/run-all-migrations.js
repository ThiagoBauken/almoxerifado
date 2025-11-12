require('dotenv').config();
const pool = require('./config');
const fs = require('fs');
const path = require('path');

async function runAllMigrations() {
  console.log('🔄 Executando TODAS as migrations do banco de dados...\n');

  try {
    // Migration 013: Organizations
    console.log('📦 Migration 013: Criando tabela de organizações...');
    const migration013 = require('./migrations/013-create-organizations');
    await migration013.up();

    // Migration 014: Invites
    console.log('📦 Migration 014: Criando tabela de convites...');
    const migration014 = require('./migrations/014-create-invites');
    await migration014.up();

    // Migration 015: QR Code
    console.log('📦 Migration 015: Adicionando QR Code aos itens...');
    const migration015 = require('./migrations/015-add-qrcode-to-items');
    await migration015.up();

    // Migration 016: Movimentações
    console.log('📦 Migration 016: Criando tabela de movimentações...');
    const migration016 = require('./migrations/016-create-movimentacoes');
    await migration016.up();

    // Migration 017: Campos essenciais
    console.log('📦 Migration 017: Adicionando campos essenciais aos itens...');
    const migration017 = require('./migrations/017-add-campos-essenciais-items');
    await migration017.up();

    // Migration 018: Fix users organization
    console.log('📦 Migration 018: Corrigindo usuários sem organização...');
    const migration018 = require('./migrations/018-fix-users-organization');
    await migration018.up();

    // Criar tabela locais_armazenamento se não existir
    console.log('📦 Criando tabela locais_armazenamento...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locais_armazenamento (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        descricao VARCHAR(255) NOT NULL,
        tipo VARCHAR(50) DEFAULT 'deposito',
        capacidade INTEGER,
        setor VARCHAR(100),
        observacoes TEXT,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('\n✅ TODAS as migrations foram executadas com sucesso!');
    console.log('✅ Banco de dados está completo e pronto para uso!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

runAllMigrations();
