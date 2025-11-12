const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Adicionar campos de QR Code e rastreamento
    await client.query(`
      ALTER TABLE items
      ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
    `);

    // Criar índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_items_qrcode ON items(qr_code);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 015: QR Code adicionado aos itens');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 015:', error);
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
      DROP COLUMN IF EXISTS qr_code,
      DROP COLUMN IF EXISTS qr_code_url;
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
