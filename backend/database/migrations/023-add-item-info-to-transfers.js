const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Adicionando campos de informação do item à tabela transfers...');

    // Adicionar campos para armazenar informações do item
    // Isso permite preservar histórico mesmo quando o item é excluído
    await client.query(`
      ALTER TABLE transfers
      ADD COLUMN IF NOT EXISTS item_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS item_lacre VARCHAR(100);
    `);

    // Preencher dados existentes com informações dos itens atuais
    await client.query(`
      UPDATE transfers t
      SET item_nome = i.nome,
          item_lacre = i.lacre
      FROM items i
      WHERE t.item_id = i.id
      AND t.item_nome IS NULL;
    `);

    // Criar índice para melhorar performance de busca por item excluído
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transfers_item_lacre
      ON transfers(item_lacre);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 023: Campos de informação do item adicionados com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 023:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Remover índice
    await client.query(`
      DROP INDEX IF EXISTS idx_transfers_item_lacre;
    `);

    // Remover colunas
    await client.query(`
      ALTER TABLE transfers
      DROP COLUMN IF EXISTS item_nome,
      DROP COLUMN IF EXISTS item_lacre;
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

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration 023 executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar migration 023:', error);
      process.exit(1);
    });
}
