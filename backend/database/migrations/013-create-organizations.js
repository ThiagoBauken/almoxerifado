const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Criar tabela de organizações
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        logo TEXT,
        plano VARCHAR(50) DEFAULT 'free',
        max_usuarios INTEGER DEFAULT 5,
        max_itens INTEGER DEFAULT 100,
        configuracoes JSONB DEFAULT '{}',
        ativo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Adicionar organization_id em users
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    // Adicionar organization_id em outras tabelas
    const tables = ['items', 'categories', 'obras', 'locais_armazenamento'];

    for (const table of tables) {
      await client.query(`
        ALTER TABLE ${table}
        ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE;
      `);
    }

    // Criar índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
      CREATE INDEX IF NOT EXISTS idx_items_organization ON items(organization_id);
      CREATE INDEX IF NOT EXISTS idx_categories_organization ON categories(organization_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Migration 013: Organizations criada com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 013:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS organizations CASCADE;');

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { up, down };
