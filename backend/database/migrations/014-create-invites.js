const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Criar tabela de convites
    await client.query(`
      CREATE TABLE IF NOT EXISTS invites (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        perfil VARCHAR(50) NOT NULL DEFAULT 'funcionario',
        token VARCHAR(255) UNIQUE NOT NULL,
        invited_by INTEGER REFERENCES users(id),
        expires_at TIMESTAMP NOT NULL,
        accepted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, email)
      );
    `);

    // Criar índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
      CREATE INDEX IF NOT EXISTS idx_invites_organization ON invites(organization_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 014: Invites criada com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 014:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS invites CASCADE;');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
