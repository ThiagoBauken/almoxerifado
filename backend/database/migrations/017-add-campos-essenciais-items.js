const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Adicionar todos os campos essenciais que faltam
    await client.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS marca_modelo VARCHAR(255),
      ADD COLUMN IF NOT EXISTS metragem DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS unidade VARCHAR(20) DEFAULT 'UN',
      ADD COLUMN IF NOT EXISTS estoque_minimo INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS quantidade_disponivel INTEGER,
      ADD COLUMN IF NOT EXISTS valor_unitario DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS data_saida DATE,
      ADD COLUMN IF NOT EXISTS data_retorno DATE,
      ADD COLUMN IF NOT EXISTS data_aquisicao DATE,
      ADD COLUMN IF NOT EXISTS observacao TEXT;
    `);

    // Sincronizar quantidade_disponivel com quantidade para itens existentes
    await client.query(`
      UPDATE items
      SET quantidade_disponivel = quantidade
      WHERE quantidade_disponivel IS NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 017: Campos essenciais adicionados aos itens');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 017:', error);
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
      DROP COLUMN IF EXISTS marca_modelo,
      DROP COLUMN IF EXISTS metragem,
      DROP COLUMN IF EXISTS unidade,
      DROP COLUMN IF EXISTS estoque_minimo,
      DROP COLUMN IF EXISTS quantidade_disponivel,
      DROP COLUMN IF EXISTS valor_unitario,
      DROP COLUMN IF EXISTS data_saida,
      DROP COLUMN IF EXISTS data_retorno,
      DROP COLUMN IF EXISTS data_aquisicao,
      DROP COLUMN IF EXISTS observacao;
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
