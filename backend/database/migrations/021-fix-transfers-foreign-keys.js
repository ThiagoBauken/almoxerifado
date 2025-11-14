const pool = require('../pool');

async function up() {
  const client = await pool.connect();

  try {
    console.log('Alterando foreign keys de transfers para SET NULL...');

    // Remover constraints antigas
    await client.query(`
      ALTER TABLE transfers
      DROP CONSTRAINT IF EXISTS transfers_de_usuario_id_fkey,
      DROP CONSTRAINT IF EXISTS transfers_para_usuario_id_fkey;
    `);

    // Adicionar constraints com ON DELETE SET NULL
    await client.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_de_usuario_id_fkey
        FOREIGN KEY (de_usuario_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
      ADD CONSTRAINT transfers_para_usuario_id_fkey
        FOREIGN KEY (para_usuario_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
    `);

    console.log('✅ Foreign keys atualizadas com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar foreign keys:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    // Reverter para as constraints originais (sem ON DELETE)
    await client.query(`
      ALTER TABLE transfers
      DROP CONSTRAINT IF EXISTS transfers_de_usuario_id_fkey,
      DROP CONSTRAINT IF EXISTS transfers_para_usuario_id_fkey;
    `);

    await client.query(`
      ALTER TABLE transfers
      ADD CONSTRAINT transfers_de_usuario_id_fkey
        FOREIGN KEY (de_usuario_id)
        REFERENCES users(id),
      ADD CONSTRAINT transfers_para_usuario_id_fkey
        FOREIGN KEY (para_usuario_id)
        REFERENCES users(id);
    `);
  } finally {
    client.release();
  }
}

module.exports = { up, down };

if (require.main === module) {
  up()
    .then(() => {
      console.log('Migration 021 executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar migration 021:', error);
      process.exit(1);
    });
}
