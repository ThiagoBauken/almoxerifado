-- ============================================
-- SQL PARA CRIAR TABELAS FALTANTES
-- Execute este script no PostgreSQL do EasyPanel
-- ============================================

-- 1. CRIAR TABELA NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT,
  reference_type VARCHAR(50),
  reference_id INTEGER,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread_user ON notifications(user_id, read) WHERE read = FALSE;

-- 2. VERIFICAR/CORRIGIR TABELA MOVIMENTACOES
DO $$
BEGIN
  -- Verificar se a tabela existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movimentacoes') THEN
    -- Criar a tabela se não existir
    CREATE TABLE movimentacoes (
      id SERIAL PRIMARY KEY,
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
      usuario_id UUID NOT NULL REFERENCES users(id),
      tipo VARCHAR(50) NOT NULL,
      quantidade INTEGER NOT NULL,
      local_from_id INTEGER REFERENCES locais_armazenamento(id),
      local_to_id INTEGER REFERENCES locais_armazenamento(id),
      observacao TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Criar índices
    CREATE INDEX idx_movimentacoes_item ON movimentacoes(item_id);
    CREATE INDEX idx_movimentacoes_usuario ON movimentacoes(usuario_id);
    CREATE INDEX idx_movimentacoes_created ON movimentacoes(created_at);

    RAISE NOTICE 'Tabela movimentacoes criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela movimentacoes já existe';
  END IF;
END $$;

-- 3. VERIFICAR/CORRIGIR TABELA INVITES
DO $$
BEGIN
  -- Verificar se a coluna invited_by tem o tipo correto
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invites'
    AND column_name = 'invited_by'
    AND data_type = 'integer'
  ) THEN
    -- Precisa alterar de integer para uuid
    ALTER TABLE invites ALTER COLUMN invited_by TYPE UUID USING invited_by::text::uuid;
    RAISE NOTICE 'Coluna invites.invited_by alterada para UUID';
  END IF;

  -- Verificar se max_uses e current_uses existem
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'invites' AND column_name = 'max_uses'
  ) THEN
    ALTER TABLE invites ADD COLUMN max_uses INTEGER DEFAULT 1;
    RAISE NOTICE 'Coluna max_uses adicionada';
  END IF;

  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_name = 'invites' AND column_name = 'current_uses'
  ) THEN
    ALTER TABLE invites ADD COLUMN current_uses INTEGER DEFAULT 0;
    RAISE NOTICE 'Coluna current_uses adicionada';
  END IF;

  -- Tornar email nullable
  ALTER TABLE invites ALTER COLUMN email DROP NOT NULL;
  RAISE NOTICE 'Coluna email agora permite NULL';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao alterar invites: %', SQLERRM;
END $$;

-- 4. REMOVER CHECK CONSTRAINTS PROBLEMÁTICAS
DO $$
BEGIN
  -- Remover constraint de items.estado se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'items_estado_check'
  ) THEN
    ALTER TABLE items DROP CONSTRAINT items_estado_check;
    RAISE NOTICE 'Constraint items_estado_check removida';
  END IF;

  -- Remover constraint de locais_armazenamento.tipo se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'locais_armazenamento_tipo_check'
  ) THEN
    ALTER TABLE locais_armazenamento DROP CONSTRAINT locais_armazenamento_tipo_check;
    RAISE NOTICE 'Constraint locais_armazenamento_tipo_check removida';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao remover constraints: %', SQLERRM;
END $$;

-- 5. VERIFICAR ESTRUTURA FINAL
SELECT
  'notifications' as tabela,
  COUNT(*) as colunas
FROM information_schema.columns
WHERE table_name = 'notifications'
UNION ALL
SELECT
  'movimentacoes' as tabela,
  COUNT(*) as colunas
FROM information_schema.columns
WHERE table_name = 'movimentacoes';

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '✅ Script executado com sucesso!';
  RAISE NOTICE '✅ Tabela notifications criada';
  RAISE NOTICE '✅ Tabela movimentacoes verificada';
  RAISE NOTICE '✅ Tabela invites corrigida';
  RAISE NOTICE '✅ Constraints removidas';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Agora faça RESTART do serviço no EasyPanel';
END $$;
