require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config');

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Limpar dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await pool.query('TRUNCATE TABLE transfers, items, categories, obras, users RESTART IDENTITY CASCADE');
    console.log('✅ Dados limpos\n');

    // 1. USUÁRIOS
    console.log('👥 Criando usuários...');
    const senhaHash = await bcrypt.hash('123456', 10);

    const users = [
      { nome: 'Thiago Silva', email: 'thiago@obra.com', perfil: 'funcionario' },
      { nome: 'Fabricio Santos', email: 'fabricio@obra.com', perfil: 'funcionario' },
      { nome: 'Carlos Almoxarife', email: 'carlos@almoxarifado.com', perfil: 'almoxarife' },
      { nome: 'Maria Gestora', email: 'maria@gestao.com', perfil: 'gestor' },
      { nome: 'João Pereira', email: 'joao@obra.com', perfil: 'funcionario' },
      { nome: 'Ana Costa', email: 'ana@obra.com', perfil: 'funcionario' },
      { nome: 'Pedro Admin', email: 'pedro@admin.com', perfil: 'admin' },
    ];

    const userIds = {};
    for (const user of users) {
      const result = await pool.query(
        'INSERT INTO users (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id',
        [user.nome, user.email, senhaHash, user.perfil]
      );
      userIds[user.nome] = result.rows[0].id;
      console.log(`  ✓ ${user.nome} (${user.perfil})`);
    }
    console.log('✅ Usuários criados\n');

    // 2. OBRAS
    console.log('🏗️  Criando obras...');
    const obras = [
      { nome: 'Obra Shopping Center Norte', endereco: 'Av. Principal, 1000 - São Paulo, SP', status: 'ativa' },
      { nome: 'Obra Residencial Jardins', endereco: 'Rua das Flores, 500 - São Paulo, SP', status: 'ativa' },
      { nome: 'Obra Reforma Hotel Central', endereco: 'Av. Central, 2500 - São Paulo, SP', status: 'pausada' },
      { nome: 'Obra Edifício Comercial Sul', endereco: 'Rua Sul, 800 - São Paulo, SP', status: 'ativa' },
    ];

    const obraIds = {};
    for (const obra of obras) {
      const result = await pool.query(
        'INSERT INTO obras (nome, endereco, status, responsavel_id, data_inicio) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [obra.nome, obra.endereco, obra.status, userIds['Maria Gestora'], '2024-01-15']
      );
      obraIds[obra.nome] = result.rows[0].id;
      console.log(`  ✓ ${obra.nome}`);
    }
    console.log('✅ Obras criadas\n');

    // 3. CATEGORIAS
    console.log('📦 Criando categorias...');
    const categories = [
      { nome: 'EPI - Equipamentos de Proteção', icone: '🦺' },
      { nome: 'Ferramentas Elétricas', icone: '⚡' },
      { nome: 'Ferramentas Manuais', icone: '🔨' },
      { nome: 'Equipamentos de Medição', icone: '📏' },
      { nome: 'Equipamentos de Segurança', icone: '🔒' },
      { nome: 'Equipamentos de Altura', icone: '🪜' },
      { nome: 'Iluminação', icone: '💡' },
      { nome: 'Transporte', icone: '🚚' },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const result = await pool.query(
        'INSERT INTO categories (nome, icone) VALUES ($1, $2) RETURNING id',
        [cat.nome, cat.icone]
      );
      categoryIds[cat.nome] = result.rows[0].id;
      console.log(`  ✓ ${cat.nome} ${cat.icone}`);
    }
    console.log('✅ Categorias criadas\n');

    // 4. ITENS
    console.log('📋 Criando 50 itens...');
    const items = [
      // EPIs
      { lacre: 'LAC-001', nome: 'Capacete de Segurança Branco', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
      { lacre: 'LAC-002', nome: 'Capacete de Segurança Amarelo', categoria: 'EPI - Equipamentos de Proteção', estado: 'com_funcionario', funcionario: 'Thiago Silva', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-003', nome: 'Óculos de Proteção Incolor', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
      { lacre: 'LAC-004', nome: 'Luva de Segurança Tamanho G', categoria: 'EPI - Equipamentos de Proteção', estado: 'em_obra', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-005', nome: 'Botas de Segurança N°42', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },

      // Ferramentas Elétricas
      { lacre: 'LAC-006', nome: 'Furadeira de Impacto 800W', categoria: 'Ferramentas Elétricas', estado: 'com_funcionario', funcionario: 'Fabricio Santos', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-007', nome: 'Esmerilhadeira Angular 9"', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-008', nome: 'Parafusadeira Elétrica 12V', categoria: 'Ferramentas Elétricas', estado: 'em_manutencao' },
      { lacre: 'LAC-009', nome: 'Serra Circular 7.1/4"', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-010', nome: 'Lixadeira Orbital', categoria: 'Ferramentas Elétricas', estado: 'com_funcionario', funcionario: 'Thiago Silva', obra: 'Obra Shopping Center Norte' },

      // Ferramentas Manuais
      { lacre: 'LAC-011', nome: 'Martelo de Unha 500g', categoria: 'Ferramentas Manuais', estado: 'disponivel_estoque' },
      { lacre: 'LAC-012', nome: 'Alicate Universal 8"', categoria: 'Ferramentas Manuais', estado: 'disponivel_estoque' },
      { lacre: 'LAC-013', nome: 'Chave de Fenda 1/4"', categoria: 'Ferramentas Manuais', estado: 'em_obra', obra: 'Obra Residencial Jardins' },
      { lacre: 'LAC-014', nome: 'Serrote 20"', categoria: 'Ferramentas Manuais', estado: 'disponivel_estoque' },
      { lacre: 'LAC-015', nome: 'Nível de Mão 30cm', categoria: 'Ferramentas Manuais', estado: 'com_funcionario', funcionario: 'João Pereira', obra: 'Obra Residencial Jardins' },

      // Equipamentos de Medição
      { lacre: 'LAC-016', nome: 'Trena Laser 40m', categoria: 'Equipamentos de Medição', estado: 'em_obra', obra: 'Obra Residencial Jardins' },
      { lacre: 'LAC-017', nome: 'Nível a Laser Rotativo', categoria: 'Equipamentos de Medição', estado: 'disponivel_estoque' },
      { lacre: 'LAC-018', nome: 'Trena 5m', categoria: 'Equipamentos de Medição', estado: 'disponivel_estoque' },
      { lacre: 'LAC-019', nome: 'Esquadro 30cm', categoria: 'Equipamentos de Medição', estado: 'disponivel_estoque' },
      { lacre: 'LAC-020', nome: 'Transferidor Digital', categoria: 'Equipamentos de Medição', estado: 'com_funcionario', funcionario: 'Ana Costa', obra: 'Obra Edifício Comercial Sul' },

      // Equipamentos de Altura
      { lacre: 'LAC-021', nome: 'Cinto de Segurança Tipo Paraquedista', categoria: 'Equipamentos de Altura', estado: 'com_funcionario', funcionario: 'Fabricio Santos', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-022', nome: 'Mosquetão Aço 25kN', categoria: 'Equipamentos de Altura', estado: 'disponivel_estoque' },
      { lacre: 'LAC-023', nome: 'Trava Quedas 20m', categoria: 'Equipamentos de Altura', estado: 'disponivel_estoque' },
      { lacre: 'LAC-024', nome: 'Corda de Segurança 50m', categoria: 'Equipamentos de Altura', estado: 'em_obra', obra: 'Obra Edifício Comercial Sul' },
      { lacre: 'LAC-025', nome: 'Escada Extensível 7m', categoria: 'Equipamentos de Altura', estado: 'disponivel_estoque' },

      // Mais itens variados
      { lacre: 'LAC-026', nome: 'Lanterna LED Profissional', categoria: 'Iluminação', estado: 'disponivel_estoque' },
      { lacre: 'LAC-027', nome: 'Refletor LED 100W', categoria: 'Iluminação', estado: 'em_obra', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-028', nome: 'Carrinho de Mão', categoria: 'Transporte', estado: 'disponivel_estoque' },
      { lacre: 'LAC-029', nome: 'Luva de Raspa', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
      { lacre: 'LAC-030', nome: 'Protetor Auricular', categoria: 'EPI - Equipamentos de Proteção', estado: 'com_funcionario', funcionario: 'João Pereira', obra: 'Obra Residencial Jardins' },

      // Mais 20 itens
      { lacre: 'LAC-031', nome: 'Máscara PFF2', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
      { lacre: 'LAC-032', nome: 'Cone de Sinalização 75cm', categoria: 'Equipamentos de Segurança', estado: 'em_obra', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-033', nome: 'Fita Zebrada 200m', categoria: 'Equipamentos de Segurança', estado: 'disponivel_estoque' },
      { lacre: 'LAC-034', nome: 'Extintor PQS 6kg', categoria: 'Equipamentos de Segurança', estado: 'em_obra', obra: 'Obra Residencial Jardins' },
      { lacre: 'LAC-035', nome: 'Furadeira Manual', categoria: 'Ferramentas Manuais', estado: 'disponivel_estoque' },
      { lacre: 'LAC-036', nome: 'Jogo de Chaves Allen', categoria: 'Ferramentas Manuais', estado: 'com_funcionario', funcionario: 'Ana Costa', obra: 'Obra Edifício Comercial Sul' },
      { lacre: 'LAC-037', nome: 'Soprador Térmico', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-038', nome: 'Aspirador de Pó Industrial', categoria: 'Ferramentas Elétricas', estado: 'em_obra', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-039', nome: 'Martelete Perfurador', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-040', nome: 'Compressor de Ar', categoria: 'Ferramentas Elétricas', estado: 'em_manutencao' },
      { lacre: 'LAC-041', nome: 'Plaina Elétrica', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-042', nome: 'Serra Mármore', categoria: 'Ferramentas Elétricas', estado: 'com_funcionario', funcionario: 'Fabricio Santos', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-043', nome: 'Policorte', categoria: 'Ferramentas Elétricas', estado: 'disponivel_estoque' },
      { lacre: 'LAC-044', nome: 'Betoneira 150L', categoria: 'Transporte', estado: 'em_obra', obra: 'Obra Edifício Comercial Sul' },
      { lacre: 'LAC-045', nome: 'Andaime Fachadeiro 2m', categoria: 'Equipamentos de Altura', estado: 'em_obra', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-046', nome: 'Prumo de Centro', categoria: 'Equipamentos de Medição', estado: 'disponivel_estoque' },
      { lacre: 'LAC-047', nome: 'Mangueira de Nível 15m', categoria: 'Equipamentos de Medição', estado: 'disponivel_estoque' },
      { lacre: 'LAC-048', nome: 'Talabarte Y', categoria: 'Equipamentos de Altura', estado: 'com_funcionario', funcionario: 'Thiago Silva', obra: 'Obra Shopping Center Norte' },
      { lacre: 'LAC-049', nome: 'Capacete Vermelho', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
      { lacre: 'LAC-050', nome: 'Colete Refletivo', categoria: 'EPI - Equipamentos de Proteção', estado: 'disponivel_estoque' },
    ];

    for (const item of items) {
      const funcionarioId = item.funcionario ? userIds[item.funcionario] : null;
      const obraId = item.obra ? obraIds[item.obra] : null;

      await pool.query(
        `INSERT INTO items (lacre, nome, categoria_id, estado, funcionario_id, obra_id, localizacao_tipo, qr_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          item.lacre,
          item.nome,
          categoryIds[item.categoria],
          item.estado,
          funcionarioId,
          obraId,
          item.estado === 'com_funcionario' ? 'funcionario' : item.estado === 'em_obra' ? 'obra' : 'estoque',
          item.lacre
        ]
      );
      console.log(`  ✓ ${item.lacre} - ${item.nome}`);
    }
    console.log('✅ 50 itens criados\n');

    // 5. TRANSFERÊNCIAS (Histórico)
    console.log('🔄 Criando transferências de exemplo...');

    const transfersData = [
      {
        item_lacre: 'LAC-002',
        de: 'Carlos Almoxarife',
        para: 'Thiago Silva',
        status: 'concluida',
        dias_atras: 5
      },
      {
        item_lacre: 'LAC-006',
        de: 'Carlos Almoxarife',
        para: 'Fabricio Santos',
        status: 'concluida',
        dias_atras: 4
      },
      {
        item_lacre: 'LAC-010',
        de: 'Carlos Almoxarife',
        para: 'Thiago Silva',
        status: 'concluida',
        dias_atras: 3
      },
      {
        item_lacre: 'LAC-021',
        de: 'Carlos Almoxarife',
        para: 'Fabricio Santos',
        status: 'concluida',
        dias_atras: 2
      },
    ];

    for (const transfer of transfersData) {
      const itemResult = await pool.query('SELECT id FROM items WHERE lacre = $1', [transfer.item_lacre]);
      const itemId = itemResult.rows[0]?.id;

      if (itemId) {
        const dataEnvio = new Date();
        dataEnvio.setDate(dataEnvio.getDate() - transfer.dias_atras);
        const dataAceitacao = new Date(dataEnvio);
        dataAceitacao.setMinutes(dataAceitacao.getMinutes() + 15);

        await pool.query(
          `INSERT INTO transfers (item_id, tipo, de_usuario_id, para_usuario_id, de_localizacao, para_localizacao, status, data_envio, data_aceitacao, assinatura_remetente, assinatura_destinatario)
           VALUES ($1, 'transferencia', $2, $3, 'Estoque Principal', $4, $5, $6, $7, $8, $9)`,
          [
            itemId,
            userIds[transfer.de],
            userIds[transfer.para],
            `Obra - ${transfer.para}`,
            transfer.status,
            dataEnvio,
            transfer.status === 'concluida' ? dataAceitacao : null,
            transfer.de,
            transfer.status === 'concluida' ? transfer.para : null
          ]
        );
        console.log(`  ✓ ${transfer.item_lacre}: ${transfer.de} → ${transfer.para} (${transfer.status})`);
      }
    }
    console.log('✅ Transferências criadas\n');

    console.log('🎉 Seed concluído com sucesso!\n');
    console.log('📊 Resumo:');
    console.log(`   - ${users.length} usuários`);
    console.log(`   - ${obras.length} obras`);
    console.log(`   - ${categories.length} categorias`);
    console.log(`   - ${items.length} itens`);
    console.log(`   - ${transfersData.length} transferências`);
    console.log('\n✅ Banco de dados populado!\n');
    console.log('🔑 Login de teste:');
    console.log('   Email: thiago@obra.com');
    console.log('   Senha: 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
