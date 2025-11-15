/**
 * Migration: Adiciona campo is_superadmin à tabela users
 * Data: 2025-01-15
 * Descrição: Adiciona campo booleano para identificar super administradores
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Adiciona coluna is_superadmin à tabela users
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;
    `);

    // Cria índice para melhor performance em consultas de superadmin
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_is_superadmin
      ON users(is_superadmin) WHERE is_superadmin = true;
    `);

    console.log('✅ Campo is_superadmin adicionado com sucesso!');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Remove índice
    await client.query(`
      DROP INDEX IF EXISTS idx_users_is_superadmin;
    `);

    // Remove coluna is_superadmin
    await client.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS is_superadmin;
    `);

    console.log('✅ Campo is_superadmin removido com sucesso!');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };

// Executa se chamado diretamente
if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration executada com sucesso!');
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro ao executar migration:', err);
      process.exit(1);
    });
}
