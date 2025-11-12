require('dotenv').config();
const pool = require('./config');

async function seedStorage() {
  console.log('📦 Populando locais de armazenamento...\n');

  try {
    // Locais físicos de armazenamento
    const locais = [
      // Caixas
      { codigo: 'CX-A1', descricao: 'Caixa A1 - EPIs', tipo: 'caixa', capacidade: 50, setor: 'Segurança' },
      { codigo: 'CX-A2', descricao: 'Caixa A2 - EPIs Reserva', tipo: 'caixa', capacidade: 50, setor: 'Segurança' },
      { codigo: 'CX-B1', descricao: 'Caixa B1 - Ferramentas Pequenas', tipo: 'caixa', capacidade: 30, setor: 'Ferramentas' },
      { codigo: 'CX-B2', descricao: 'Caixa B2 - Ferramentas Elétricas', tipo: 'caixa', capacidade: 20, setor: 'Ferramentas' },
      { codigo: 'CX-C1', descricao: 'Caixa C1 - Equipamentos de Medição', tipo: 'caixa', capacidade: 25, setor: 'Medição' },

      // Prateleiras
      { codigo: 'PR-01', descricao: 'Prateleira 1 - Ferramentas Pesadas', tipo: 'prateleira', capacidade: 15, setor: 'Ferramentas' },
      { codigo: 'PR-02', descricao: 'Prateleira 2 - Equipamentos Elétricos', tipo: 'prateleira', capacidade: 20, setor: 'Elétrica' },
      { codigo: 'PR-03', descricao: 'Prateleira 3 - Equipamentos de Altura', tipo: 'prateleira', capacidade: 10, setor: 'Altura' },
      { codigo: 'PR-04', descricao: 'Prateleira 4 - Material de Segurança', tipo: 'prateleira', capacidade: 30, setor: 'Segurança' },
      { codigo: 'PR-05', descricao: 'Prateleira 5 - Iluminação', tipo: 'prateleira', capacidade: 25, setor: 'Iluminação' },

      // Armários
      { codigo: 'ARM-01', descricao: 'Armário 1 - Ferramentas de Precisão', tipo: 'armario', capacidade: 40, setor: 'Ferramentas' },
      { codigo: 'ARM-02', descricao: 'Armário 2 - Equipamentos Caros', tipo: 'armario', capacidade: 30, setor: 'Alto Valor' },
      { codigo: 'ARM-03', descricao: 'Armário 3 - Equipamentos em Manutenção', tipo: 'armario', capacidade: 20, setor: 'Manutenção' },

      // Gavetas
      { codigo: 'GAV-1A', descricao: 'Gaveta 1A - Ferramentas Manuais Pequenas', tipo: 'gaveta', capacidade: 50, setor: 'Ferramentas' },
      { codigo: 'GAV-1B', descricao: 'Gaveta 1B - Parafusos e Acessórios', tipo: 'gaveta', capacidade: 100, setor: 'Acessórios' },
      { codigo: 'GAV-2A', descricao: 'Gaveta 2A - Equipamentos de Medição Pequenos', tipo: 'gaveta', capacidade: 30, setor: 'Medição' },

      // Salas
      { codigo: 'SALA-1', descricao: 'Sala 1 - Equipamentos Grandes', tipo: 'sala', capacidade: 10, setor: 'Equipamentos Pesados' },
      { codigo: 'SALA-2', descricao: 'Sala 2 - Estoque Geral', tipo: 'sala', capacidade: 100, setor: 'Geral' },
    ];

    const localIds = {};

    for (const local of locais) {
      const result = await pool.query(
        `INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [local.codigo, local.descricao, local.tipo, local.capacidade, local.setor]
      );
      localIds[local.codigo] = result.rows[0].id;
      console.log(`  ✓ ${local.codigo} - ${local.descricao}`);
    }

    console.log(`\n✅ ${locais.length} locais de armazenamento criados!\n`);

    // Atualizar itens existentes com locais de armazenamento
    console.log('📋 Atribuindo locais aos itens existentes...\n');

    const updates = [
      // EPIs → Caixa A1
      { lacre: 'LAC-001', local: 'CX-A1' },
      { lacre: 'LAC-002', local: 'CX-A1' },
      { lacre: 'LAC-003', local: 'CX-A1' },
      { lacre: 'LAC-004', local: 'CX-A1' },
      { lacre: 'LAC-005', local: 'CX-A1' },
      { lacre: 'LAC-029', local: 'CX-A2' },
      { lacre: 'LAC-031', local: 'CX-A2' },
      { lacre: 'LAC-049', local: 'CX-A2' },
      { lacre: 'LAC-050', local: 'CX-A2' },

      // Ferramentas Elétricas → Prateleira 1 e 2
      { lacre: 'LAC-006', local: 'PR-01' },
      { lacre: 'LAC-007', local: 'PR-01' },
      { lacre: 'LAC-008', local: 'PR-01' },
      { lacre: 'LAC-009', local: 'PR-02' },
      { lacre: 'LAC-010', local: 'PR-02' },
      { lacre: 'LAC-037', local: 'PR-02' },
      { lacre: 'LAC-038', local: 'PR-02' },
      { lacre: 'LAC-039', local: 'PR-01' },
      { lacre: 'LAC-041', local: 'PR-01' },
      { lacre: 'LAC-042', local: 'PR-01' },
      { lacre: 'LAC-043', local: 'PR-01' },

      // Ferramentas Manuais → Gaveta 1A
      { lacre: 'LAC-011', local: 'GAV-1A' },
      { lacre: 'LAC-012', local: 'GAV-1A' },
      { lacre: 'LAC-013', local: 'GAV-1A' },
      { lacre: 'LAC-014', local: 'GAV-1A' },
      { lacre: 'LAC-015', local: 'GAV-1A' },
      { lacre: 'LAC-035', local: 'GAV-1A' },
      { lacre: 'LAC-036', local: 'GAV-1A' },

      // Medição → Armário 1
      { lacre: 'LAC-016', local: 'ARM-01' },
      { lacre: 'LAC-017', local: 'ARM-01' },
      { lacre: 'LAC-018', local: 'GAV-2A' },
      { lacre: 'LAC-019', local: 'GAV-2A' },
      { lacre: 'LAC-020', local: 'ARM-01' },
      { lacre: 'LAC-046', local: 'GAV-2A' },
      { lacre: 'LAC-047', local: 'GAV-2A' },

      // Altura → Prateleira 3
      { lacre: 'LAC-021', local: 'PR-03' },
      { lacre: 'LAC-022', local: 'PR-03' },
      { lacre: 'LAC-023', local: 'PR-03' },
      { lacre: 'LAC-024', local: 'PR-03' },
      { lacre: 'LAC-025', local: 'PR-03' },
      { lacre: 'LAC-045', local: 'PR-03' },
      { lacre: 'LAC-048', local: 'PR-03' },

      // Iluminação → Prateleira 5
      { lacre: 'LAC-026', local: 'PR-05' },
      { lacre: 'LAC-027', local: 'PR-05' },

      // Grandes → Sala 1
      { lacre: 'LAC-028', local: 'SALA-1' },
      { lacre: 'LAC-040', local: 'SALA-1' },
      { lacre: 'LAC-044', local: 'SALA-1' },

      // Segurança → Prateleira 4
      { lacre: 'LAC-032', local: 'PR-04' },
      { lacre: 'LAC-033', local: 'PR-04' },
      { lacre: 'LAC-034', local: 'PR-04' },
    ];

    for (const update of updates) {
      await pool.query(
        `UPDATE items
         SET local_armazenamento_id = $1,
             local_armazenamento_descricao = (SELECT descricao FROM locais_armazenamento WHERE id = $1)
         WHERE lacre = $2`,
        [localIds[update.local], update.lacre]
      );
      console.log(`  ✓ ${update.lacre} → ${update.local}`);
    }

    console.log(`\n✅ ${updates.length} itens atribuídos aos locais!\n`);
    console.log('🎉 Seed de locais de armazenamento concluído!\n');

    console.log('📊 Resumo:');
    console.log(`   - ${locais.length} locais criados`);
    console.log(`   - ${updates.length} itens com local atribuído`);
    console.log('\n✅ Agora cada item tem seu local físico no almoxarifado!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seedStorage();
