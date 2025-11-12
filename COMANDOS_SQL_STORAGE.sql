-- ============================================================
-- COMANDOS SQL - Sistema de Localização Física
-- Cole estes comandos diretamente no terminal psql
-- ============================================================

-- Conectar ao banco (se necessário)
-- \c almoxarifado

-- ============================================================
-- 1. CRIAR TABELA DE LOCAIS DE ARMAZENAMENTO
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
-- 2. ADICIONAR CAMPOS NA TABELA ITEMS
-- ============================================================

ALTER TABLE items
ADD COLUMN IF NOT EXISTS local_armazenamento_id UUID REFERENCES locais_armazenamento(id),
ADD COLUMN IF NOT EXISTS local_armazenamento_descricao TEXT;

-- ============================================================
-- 3. CRIAR ÍNDICE PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_items_local_armazenamento ON items(local_armazenamento_id);

-- ============================================================
-- 4. INSERIR 18 LOCAIS DE EXEMPLO
-- ============================================================

-- CAIXAS (5)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('CX-A1', 'Caixa A1 - EPIs', 'caixa', 50, 'Segurança', 'Equipamentos de proteção individual'),
('CX-A2', 'Caixa A2 - Uniformes', 'caixa', 40, 'Vestuário', 'Uniformes e roupas de trabalho'),
('CX-B1', 'Caixa B1 - Parafusos', 'caixa', 100, 'Ferragens', 'Parafusos, porcas e arruelas'),
('CX-B2', 'Caixa B2 - Materiais Elétricos Pequenos', 'caixa', 60, 'Elétrica', 'Conectores, fios pequenos, fita isolante'),
('CX-C1', 'Caixa C1 - Itens de Limpeza', 'caixa', 30, 'Limpeza', 'Produtos e ferramentas de limpeza');

-- PRATELEIRAS (5)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor) VALUES
('PR-01', 'Prateleira 1 - Ferramentas Pesadas', 'prateleira', 15, 'Ferramentas'),
('PR-02', 'Prateleira 2 - Ferramentas Elétricas', 'prateleira', 20, 'Ferramentas'),
('PR-03', 'Prateleira 3 - Ferramentas Manuais', 'prateleira', 30, 'Ferramentas'),
('PR-04', 'Prateleira 4 - Medição', 'prateleira', 25, 'Ferramentas'),
('PR-05', 'Prateleira 5 - Consumíveis', 'prateleira', 50, 'Diversos');

-- ARMÁRIOS (3)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('ARM-01', 'Armário 1 - Materiais Valiosos', 'armario', 20, 'Segurança', 'Equipamentos de alto valor - mantém trancado'),
('ARM-02', 'Armário 2 - Químicos', 'armario', 15, 'Química', 'Produtos químicos - área ventilada'),
('ARM-03', 'Armário 3 - Documentos', 'armario', 10, 'Administrativo', 'Manuais e documentação técnica');

-- GAVETAS (3)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor) VALUES
('GAV-1A', 'Gaveta 1A - Bits e Brocas', 'gaveta', 50, 'Ferramentas'),
('GAV-1B', 'Gaveta 1B - Chaves', 'gaveta', 40, 'Ferramentas'),
('GAV-2A', 'Gaveta 2A - Componentes Eletrônicos', 'gaveta', 80, 'Elétrica');

-- SALAS (2)
INSERT INTO locais_armazenamento (codigo, descricao, tipo, capacidade, setor, observacoes) VALUES
('SALA-1', 'Sala de Equipamentos Grandes', 'sala', 30, 'Equipamentos', 'Equipamentos de grande porte'),
('SALA-2', 'Sala de Materiais em Quarentena', 'sala', 50, 'Diversos', 'Itens aguardando inspeção ou devolução');

-- ============================================================
-- 5. VERIFICAR INSTALAÇÃO
-- ============================================================

-- Ver todos os locais
SELECT * FROM locais_armazenamento ORDER BY codigo;

-- Contar locais por tipo
SELECT tipo, COUNT(*) as quantidade FROM locais_armazenamento GROUP BY tipo;

-- Ver capacidade total
SELECT SUM(capacidade) as capacidade_total FROM locais_armazenamento;

-- ============================================================
-- FIM
-- ============================================================
