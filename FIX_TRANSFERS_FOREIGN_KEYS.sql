-- Corrigir foreign keys da tabela transfers
-- Para permitir deleção de usuários mantendo histórico de transferências

-- Remover constraints antigas
ALTER TABLE transfers
DROP CONSTRAINT IF EXISTS transfers_de_usuario_id_fkey,
DROP CONSTRAINT IF EXISTS transfers_para_usuario_id_fkey;

-- Adicionar constraints com ON DELETE SET NULL
-- Quando um usuário for deletado, as transferências permanecem mas sem referência ao usuário
ALTER TABLE transfers
ADD CONSTRAINT transfers_de_usuario_id_fkey
  FOREIGN KEY (de_usuario_id)
  REFERENCES users(id)
  ON DELETE SET NULL,
ADD CONSTRAINT transfers_para_usuario_id_fkey
  FOREIGN KEY (para_usuario_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Verificar as constraints
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  confupdtype AS on_update,
  confdeltype AS on_delete
FROM pg_constraint
WHERE conrelid = 'transfers'::regclass
  AND conname LIKE '%usuario%';
