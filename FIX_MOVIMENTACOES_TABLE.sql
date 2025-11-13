-- ============================================
-- FIX: Dropar tabela movimentacoes com tipos errados
-- Execute este script no PostgreSQL do EasyPanel
-- ============================================

-- Dropar a tabela movimentacoes que foi criada com tipos errados
DROP TABLE IF EXISTS movimentacoes CASCADE;

-- Mensagem
DO $$
BEGIN
  RAISE NOTICE '✅ Tabela movimentacoes dropada com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Agora faça REBUILD do serviço no EasyPanel';
  RAISE NOTICE '   A migration 016 vai recriar a tabela com os tipos corretos (UUID)';
END $$;
