const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    console.log('Corrigindo foreign key transfers_item_id_fkey...');

    // Remover constraint antiga
    await client.query(`
      ALTER TABLE transfers
      DROP CONSTRAINT IF EXISTS transfers_item_id_fkey;
    `);

    // Adicionar constraint com ON DELETE SET NULL
    // Quando um item é deletado, as transferências relacionadas terão item_id = NULL
    // Isso preserva o histórico de transferências mesmo após exclusão do item
    await client.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_item_id_fkey
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON DELETE SET NULL;
    `);

    console.log('✅ Foreign key transfers_item_id_fkey corrigida com sucesso!');
  } catch (error) {
    console.error('Erro ao corrigir foreign key:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    // Reverter para constraint sem ON DELETE
    await client.query(`
      ALTER TABLE transfers
      DROP CONSTRAINT IF EXISTS transfers_item_id_fkey;
    `);

    await client.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_item_id_fkey
        FOREIGN KEY (item_id)
        REFERENCES items(id);
    `);
  } finally {
    client.release();
  }
}

module.exports = { up, down };

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration 022 executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar migration 022:', error);
      process.exit(1);
    });
}
