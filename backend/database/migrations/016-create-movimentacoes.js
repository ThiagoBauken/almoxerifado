const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Criar tabela de movimentações
    await client.query(`
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id SERIAL PRIMARY KEY,
        item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        usuario_id UUID NOT NULL REFERENCES users(id),
        tipo VARCHAR(50) NOT NULL,
        quantidade INTEGER NOT NULL,
        local_from_id UUID REFERENCES locais_armazenamento(id),
        local_to_id UUID REFERENCES locais_armazenamento(id),
        observacao TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_item ON movimentacoes(item_id);
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_usuario ON movimentacoes(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_movimentacoes_created ON movimentacoes(created_at);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 016: Movimentações criada com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 016:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS movimentacoes CASCADE;');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
