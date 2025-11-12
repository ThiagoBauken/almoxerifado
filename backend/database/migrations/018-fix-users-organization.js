const pool = require('../config');

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🔄 Verificando usuários sem organização...');

    // Verificar se existem usuários sem organization_id
    const usersWithoutOrg = await client.query(`
      SELECT COUNT(*) as count FROM users WHERE organization_id IS NULL
    `);

    const count = parseInt(usersWithoutOrg.rows[0].count);
    console.log(`📊 Encontrados ${count} usuários sem organização`);

    if (count > 0) {
      // Criar organização padrão se não existir
      const defaultOrgResult = await client.query(`
        INSERT INTO organizations (nome, slug, plano, max_usuarios, max_itens)
        VALUES ('Organização Padrão', 'default', 'free', 999, 999)
        ON CONFLICT (slug) DO UPDATE SET slug = EXCLUDED.slug
        RETURNING id
      `);

      const defaultOrgId = defaultOrgResult.rows[0].id;
      console.log(`✅ Organização padrão criada/verificada (ID: ${defaultOrgId})`);

      // Atualizar todos os usuários sem organization_id
      const updateResult = await client.query(`
        UPDATE users
        SET organization_id = $1
        WHERE organization_id IS NULL
        RETURNING id, nome, email
      `, [defaultOrgId]);

      console.log(`✅ ${updateResult.rowCount} usuários atualizados com organização padrão`);

      // Atualizar items, categories, obras e locais_armazenamento sem organization_id
      const tables = ['items', 'categories', 'obras', 'locais_armazenamento'];

      for (const table of tables) {
        // Verificar se a tabela existe
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = $1
          )
        `, [table]);

        if (tableExists.rows[0].exists) {
          // Verificar se a coluna organization_id existe
          const columnExists = await client.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.columns
              WHERE table_name = $1 AND column_name = 'organization_id'
            )
          `, [table]);

          if (columnExists.rows[0].exists) {
            const result = await client.query(`
              UPDATE ${table}
              SET organization_id = $1
              WHERE organization_id IS NULL
            `, [defaultOrgId]);

            console.log(`✅ ${result.rowCount} registros atualizados em ${table}`);
          }
        }
      }
    } else {
      console.log('✅ Todos os usuários já possuem organização');
    }

    await client.query('COMMIT');
    console.log('✅ Migration 018: Fix users organization concluída com sucesso');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na migration 018:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function down() {
  // Não há necessidade de rollback - os dados já estão corretos
  console.log('⚠️  Migration 018 down: Nenhuma ação necessária');
}

module.exports = { up, down };
