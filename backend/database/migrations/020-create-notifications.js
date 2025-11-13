const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Criando tabela de notificações...');

    // Criar tabela de notificações
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        mensagem TEXT,
        reference_type VARCHAR(50),
        reference_id INTEGER,
        link TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP
      );
    `);

    // Criar índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_notifications_unread_user ON notifications(user_id, read) WHERE read = FALSE;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 020: Notificações criada com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 020:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DROP TABLE IF EXISTS notifications CASCADE;');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
