-- ============================================================
-- SISTEMA DE LOCALIZAÇÃO FÍSICA - COMANDO COMPLETO
-- Cole este arquivo inteiro no terminal psql
-- ============================================================

-- Conectar ao banco (se necessário)
-- \c almoxarifado

-- ============================================================
-- PASSO 1: CRIAR TABELA DE LOCAIS DE ARMAZENAMENTO
-- ============================================================

CREATE TABLE IF NOT EXISTS locais_armazenamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descricao TEXT,
  tipo VARCHAR(50) CHECK (tipo IN ('caixa', 'prateleira', 'armario', 'gaveta', 'sala', 'outro')),
  capacidade INTEGER,
  setor VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PASSO 2: ADICIONAR CAMPOS NA TABELA ITEMS
-- ============================================================

ALTER TABLE items
ADD COLUMN IF NOT EXISTS local_armazenamento_id UUID REFERENCES locais_armazenamento(id),
ADD COLUMN IF NOT EXISTS local_armazenamento_descricao TEXT;

-- ============================================================
-- PASSO 3: CRIAR ÍNDICE PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_items_local_armazenamento
ON items(local_armazenamento_id);

-- ============================================================
-- PASSO 4: INSERIR LOCAIS DE EXEMPLO
-- ============================================================

-- 4.1 CAIXAS (5)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('CX-A1', 'Caixa A1 - EPIs', 'caixa', 50, 'Segurança', 'Equipamentos de proteção individual'),
('CX-A2', 'Caixa A2 - Uniformes', 'caixa', 40, 'Vestuário', 'Uniformes e roupas de trabalho'),
('CX-B1', 'Caixa B1 - Parafusos', 'caixa', 100, 'Ferragens', 'Parafusos, porcas e arruelas'),
('CX-B2', 'Caixa B2 - Materiais Elétricos Pequenos', 'caixa', 60, 'Elétrica', 'Conectores, fios pequenos, fita isolante'),
('CX-C1', 'Caixa C1 - Itens de Limpeza', 'caixa', 30, 'Limpeza', 'Produtos e ferramentas de limpeza');

-- 4.2 PRATELEIRAS (5)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor) VALUES
('PR-01', 'Prateleira 1 - Ferramentas Pesadas', 'prateleira', 15, 'Ferramentas'),
('PR-02', 'Prateleira 2 - Ferramentas Elétricas', 'prateleira', 20, 'Ferramentas'),
('PR-03', 'Prateleira 3 - Ferramentas Manuais', 'prateleira', 30, 'Ferramentas'),
('PR-04', 'Prateleira 4 - Medição', 'prateleira', 25, 'Ferramentas'),
('PR-05', 'Prateleira 5 - Consumíveis', 'prateleira', 50, 'Diversos');

-- 4.3 ARMÁRIOS (3)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('ARM-01', 'Armário 1 - Materiais Valiosos', 'armario', 20, 'Segurança', 'Equipamentos de alto valor - mantém trancado'),
('ARM-02', 'Armário 2 - Químicos', 'armario', 15, 'Química', 'Produtos químicos - área ventilada'),
('ARM-03', 'Armário 3 - Documentos', 'armario', 10, 'Administrativo', 'Manuais e documentação técnica');

-- 4.4 GAVETAS (3)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor) VALUES
('GAV-1A', 'Gaveta 1A - Bits e Brocas', 'gaveta', 50, 'Ferramentas'),
('GAV-1B', 'Gaveta 1B - Chaves', 'gaveta', 40, 'Ferramentas'),
('GAV-2A', 'Gaveta 2A - Componentes Eletrônicos', 'gaveta', 80, 'Elétrica');

-- 4.5 SALAS (2)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('SALA-1', 'Sala de Equipamentos Grandes', 'sala', 30, 'Equipamentos', 'Equipamentos de grande porte'),
('SALA-2', 'Sala de Materiais em Quarentena', 'sala', 50, 'Diversos', 'Itens aguardando inspeção ou devolução');

-- ============================================================
-- PASSO 5: VERIFICAÇÃO
-- ============================================================

-- Contar locais (deve retornar 18)
SELECT COUNT(*) as total_locais FROM locais_armazenamento;

-- Ver todos os locais criados
SELECT codigo, descricao, tipo, capacidade, setor
FROM locais_armazenamento
ORDER BY codigo;

-- Ver por tipo
SELECT tipo, COUNT(*) as quantidade, SUM(capacidade) as capacidade_total
FROM locais_armazenamento
GROUP BY tipo
ORDER BY tipo;

-- Verificar campos adicionados em items
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'items'
AND column_name LIKE 'local_armazenamento%';

-- ============================================================
-- RESULTADO ESPERADO:
-- ============================================================
--
-- Total de locais: 18
-- - 5 caixas (CX-A1, CX-A2, CX-B1, CX-B2, CX-C1)
-- - 5 prateleiras (PR-01 a PR-05)
-- - 3 armários (ARM-01 a ARM-03)
-- - 3 gavetas (GAV-1A, GAV-1B, GAV-2A)
-- - 2 salas (SALA-1, SALA-2)
--
-- Campos adicionados em items:
-- - local_armazenamento_id (UUID)
-- - local_armazenamento_descricao (TEXT)
--
-- Índice criado:
-- - idx_items_local_armazenamento
--
-- ============================================================
-- FIM - INSTALAÇÃO COMPLETA! ✅
-- ============================================================
