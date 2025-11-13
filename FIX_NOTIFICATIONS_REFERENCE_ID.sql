-- Corrigir tipo do campo reference_id na tabela notifications
-- De INTEGER para TEXT para suportar UUIDs e IDs numéricos

-- Alterar o tipo da coluna
ALTER TABLE notifications
ALTER COLUMN reference_id TYPE TEXT;

-- Verificar a alteração
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
AND column_name = 'reference_id';
