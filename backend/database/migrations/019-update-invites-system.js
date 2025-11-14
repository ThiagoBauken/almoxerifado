const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Atualizando sistema de convites...');

    // Tornar email não obrigatório (permitir NULL)
    await client.query(`
      ALTER TABLE invites
      ALTER COLUMN email DROP NOT NULL;
    `);

    // Adicionar campo max_uses (número máximo de usos do convite)
    await client.query(`
      ALTER TABLE invites
      ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 1;
    `);

    // Adicionar campo current_uses (número atual de usos)
    await client.query(`
      ALTER TABLE invites
      ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0;
    `);

    // Atualizar convites existentes para ter max_uses = 1
    await client.query(`
      UPDATE invites
      SET max_uses = 1, current_uses = 0
      WHERE max_uses IS NULL;
    `);

    // Adicionar índice para melhor performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_invites_token_active
      ON invites(token)
      WHERE accepted_at IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 019: Sistema de convites atualizado com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 019:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Remover colunas adicionadas
    await client.query(`
      ALTER TABLE invites
      DROP COLUMN IF EXISTS max_uses,
      DROP COLUMN IF EXISTS current_uses;
    `);

    // Tornar email obrigatório novamente
    await client.query(`
      ALTER TABLE invites
      ALTER COLUMN email SET NOT NULL;
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
