const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Adicionando constraint para localizacao_tipo...');

    // Primeiro, atualizar valores inválidos para NULL
    await client.query(`
      UPDATE items
      SET localizacao_tipo = NULL
      WHERE localizacao_tipo NOT IN ('almoxarifado', 'estoque', 'funcionario', 'obra', 'em_transito');
    `);

    // Adicionar constraint CHECK
    await client.query(`
      ALTER TABLE items
      ADD CONSTRAINT check_localizacao_tipo
      CHECK (localizacao_tipo IS NULL OR localizacao_tipo IN ('almoxarifado', 'estoque', 'funcionario', 'obra', 'em_transito'));
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 025: Constraint de localizacao_tipo adicionado com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 025:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE items
      DROP CONSTRAINT IF EXISTS check_localizacao_tipo;
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
