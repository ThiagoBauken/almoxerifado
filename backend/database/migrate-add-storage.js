require('dotenv').config();
const pool = require('./config');

async function addStorageLocation() {
  console.log('🔄 Adicionando locais físicos de armazenamento...\n');

  try {
    // 1. Criar tabela de locais de armazenamento
    console.log('📦 Criando tabela locais_armazenamento...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locais_armazenamento (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        codigo VARCHAR(50) UNIQUE NOT NULL,
        descricao TEXT,
        tipo VARCHAR(50) CHECK (tipo IN ('caixa', 'prateleira', 'armario', 'gaveta', 'sala', 'outro')),
        capacidade INTEGER,
        setor VARCHAR(100),
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabela locais_armazenamento criada\n');

    // 2. Adicionar campo local_armazenamento_id na tabela items
    console.log('📋 Adicionando campo local_armazenamento_id em items...');
    await pool.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS local_armazenamento_id UUID REFERENCES locais_armazenamento(id),
      ADD COLUMN IF NOT EXISTS local_armazenamento_descricao TEXT;
    `);
    console.log('✅ Campo adicionado\n');

    // 3. Criar índice para performance
    console.log('🔍 Criando índice...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_items_local_armazenamento ON items(local_armazenamento_id);
    `);
    console.log('✅ Índice criado\n');

    console.log('✅ Migration concluída com sucesso!');
    console.log('\n📝 Próximo passo: Execute `npm run seed-storage` para popular com locais de exemplo\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migration:', error);
    process.exit(1);
  }
}

addStorageLocation();
