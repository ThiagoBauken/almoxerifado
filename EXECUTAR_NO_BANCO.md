# ⚠️ SQL para Executar no Banco de Dados de Produção

## Status: AÇÃO NECESSÁRIA

Se o banco de dados da produção **já estava criado antes** dos últimos commits, você precisa executar estes SQLs manualmente no PostgreSQL do EasyPanel.

---

## 📋 Verificar o que precisa fazer

### 1. **Verificar se as migrations já rodaram**

Execute no PostgreSQL do EasyPanel:

```sql
-- Ver todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Tabelas esperadas:**
- ✅ users
- ✅ organizations
- ✅ invites
- ✅ items
- ✅ transfers
- ✅ notifications
- ✅ movimentacoes
- ✅ obras
- ✅ categories (ou categorias)
- ✅ locais_armazenamento

---

## 🔧 SQL 1: FIX NOTIFICATIONS (Obrigatório)

**Problema:** Campo `reference_id` da tabela `notifications` estava como INTEGER mas recebe UUIDs.

**Executar:**

```sql
-- Alterar tipo do campo reference_id
ALTER TABLE notifications
ALTER COLUMN reference_id TYPE TEXT;

-- Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notifications'
AND column_name = 'reference_id';
```

**Resultado esperado:**
```
column_name   | data_type
--------------+-----------
reference_id  | text
```

---

## 🔧 SQL 2: FIX TRANSFERS FOREIGN KEYS (Obrigatório)

**Problema:** Foreign keys impediam deletar usuários que têm transferências.

**Executar:**

```sql
-- Remover constraints antigas
ALTER TABLE transfers
DROP CONSTRAINT IF EXISTS transfers_de_usuario_id_fkey,
DROP CONSTRAINT IF EXISTS transfers_para_usuario_id_fkey;

-- Adicionar constraints com ON DELETE SET NULL
ALTER TABLE transfers
ADD CONSTRAINT transfers_de_usuario_id_fkey
  FOREIGN KEY (de_usuario_id)
  REFERENCES users(id)
  ON DELETE SET NULL,
ADD CONSTRAINT transfers_para_usuario_id_fkey
  FOREIGN KEY (para_usuario_id)
  REFERENCES users(id)
  ON DELETE SET NULL;

-- Verificar
SELECT
  conname AS constraint_name,
  confdeltype AS on_delete_action
FROM pg_constraint
WHERE conrelid = 'transfers'::regclass
  AND conname LIKE '%usuario%';
```

**Resultado esperado:**
```
constraint_name                    | on_delete_action
-----------------------------------+------------------
transfers_de_usuario_id_fkey       | n (SET NULL)
transfers_para_usuario_id_fkey     | n (SET NULL)
```

---

## ✅ Como Executar no EasyPanel

### Opção 1: Via Interface do EasyPanel

1. Acesse o EasyPanel
2. Vá para o serviço PostgreSQL
3. Clique em "SQL Console" ou "Query"
4. Cole os SQLs acima
5. Execute

### Opção 2: Via psql (linha de comando)

```bash
# Conectar ao PostgreSQL
psql -h SEU_HOST -U almoxerife -d almoxerifad

# Executar os SQLs
\i FIX_NOTIFICATIONS_REFERENCE_ID.sql
\i FIX_TRANSFERS_FOREIGN_KEYS.sql

# Sair
\q
```

---

## 🆕 Migrations Automáticas (Já no Código)

As seguintes migrations rodam **automaticamente** quando o backend iniciar:

✅ **013-create-organizations.js** - Criar tabela de organizações
✅ **014-create-invites.js** - Criar tabela de convites
✅ **015-add-qrcode-to-items.js** - Adicionar campos QR em items
✅ **016-create-movimentacoes.js** - Criar tabela de movimentações
✅ **017-add-campos-essenciais-items.js** - Campos essenciais em items
✅ **018-fix-users-organization.js** - Fix de organization em users
✅ **019-update-invites-system.js** - Atualizar sistema de convites
✅ **020-create-notifications.js** - Criar tabela de notificações
✅ **021-fix-transfers-foreign-keys.js** - Fix foreign keys (só para bancos novos)

**IMPORTANTE:** As migrations 020 e 021 criam as tabelas corretas em bancos NOVOS, mas se o banco JÁ EXISTE, você precisa executar os SQLs manualmente.

---

## 📊 Script de Verificação Completa

Execute este SQL para verificar o estado do banco:

```sql
-- 1. Verificar tabelas existentes
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar tipo do campo reference_id em notifications
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifications' AND column_name = 'reference_id';

-- 3. Verificar foreign keys de transfers
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'transfers'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name LIKE '%usuario%';

-- 4. Verificar se há transferências no banco
SELECT status, COUNT(*) as total
FROM transfers
GROUP BY status;

-- 5. Verificar se há notificações
SELECT tipo, COUNT(*) as total
FROM notifications
GROUP BY tipo;
```

---

## ⚠️ Situações Possíveis

### Caso 1: Banco NOVO (primeira instalação)
✅ **NADA a fazer** - As migrations 020 e 021 já criam tudo correto

### Caso 2: Banco EXISTENTE (atualização)
⚠️ **Executar os 2 SQLs de FIX** manualmente:
1. FIX_NOTIFICATIONS_REFERENCE_ID.sql
2. FIX_TRANSFERS_FOREIGN_KEYS.sql

### Caso 3: Já executou os SQLs antes
✅ **Verificar** - Execute o script de verificação acima

---

## 🚨 Erros Comuns

### Erro: "invalid input syntax for type integer"
**Causa:** Campo `reference_id` ainda é INTEGER
**Solução:** Executar FIX_NOTIFICATIONS_REFERENCE_ID.sql

### Erro: "violates foreign key constraint"
**Causa:** Foreign keys ainda não têm ON DELETE SET NULL
**Solução:** Executar FIX_TRANSFERS_FOREIGN_KEYS.sql

### Erro: "constraint already exists"
**Causa:** Constraint foi adicionada manualmente antes
**Solução:** Ignorar - já está correto

---

## ✅ Checklist Final

Antes de considerar o banco pronto, verifique:

- [ ] Tabela `notifications` existe
- [ ] Campo `notifications.reference_id` é tipo TEXT
- [ ] Tabela `transfers` existe
- [ ] Foreign key `transfers_de_usuario_id_fkey` tem ON DELETE SET NULL
- [ ] Foreign key `transfers_para_usuario_id_fkey` tem ON DELETE SET NULL
- [ ] Todas as 10+ tabelas principais existem
- [ ] Consegue deletar usuários sem erro
- [ ] Consegue criar notificações para transferências

---

## 📞 Suporte

Se encontrar problemas:

1. Execute o **Script de Verificação Completa** acima
2. Copie os resultados
3. Verifique qual SQL precisa executar
4. Execute apenas o SQL necessário

**Última atualização:** 2025-11-14
