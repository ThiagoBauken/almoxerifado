# Histórico e Auditoria do Sistema

## O que está sendo rastreado atualmente

---

## ✅ **TRANSFERÊNCIAS** (Rastreamento COMPLETO)

### Tabela: `transfers`

**Campos Salvos:**
- ✅ `id` - ID único da transferência
- ✅ `item_id` - Qual item foi transferido
- ✅ `tipo` - Tipo (transferencia, manutencao, devolucao)
- ✅ `de_usuario_id` - **Quem enviou**
- ✅ `para_usuario_id` - **Quem recebeu**
- ✅ `de_localizacao` - De onde saiu
- ✅ `para_localizacao` - Para onde foi
- ✅ `status` - pendente, concluida, cancelada
- ✅ `data_envio` - **Quando foi enviada**
- ✅ `data_aceitacao` - **Quando foi aceita/rejeitada**
- ✅ `assinatura_remetente` - Quem assinou no envio
- ✅ `assinatura_destinatario` - Quem assinou no recebimento
- ✅ `foto_comprovante` - Foto da transferência
- ✅ `motivo` - Por que foi transferido
- ✅ `observacoes` - Observações (incluindo quem cancelou)
- ✅ `created_at` - Data de criação
- ✅ `updated_at` - Última atualização

### Informações Rastreadas:

✅ **Histórico Completo:**
- Quem transferiu (remetente)
- Para quem transferiu (destinatário)
- Quando transferiu
- Por que transferiu
- Se foi aceito ou rejeitado
- Se foi cancelado e por quem
- Qual admin fez transferência administrativa
- Funcionário que teve item retirado (em observações)

✅ **Endpoint de Histórico:**
- `GET /transfers/item/:item_id/history`
- Retorna TODAS as transferências de um item específico
- Ordenado por data (mais recente primeiro)

**Exemplo de Histórico:**
```json
{
  "id": "uuid",
  "item_nome": "Notebook Dell",
  "de_usuario_nome": "Admin João",
  "para_usuario_nome": "Funcionário Maria",
  "tipo": "transferencia",
  "status": "concluida",
  "data_envio": "2025-01-10 10:00",
  "data_aceitacao": "2025-01-10 10:30",
  "observacoes": "Transferência administrativa - Item retirado de João Silva"
}
```

---

## ⚠️ **MOVIMENTAÇÕES** (Tabela Criada mas NÃO ESTÁ SENDO USADA)

### Tabela: `movimentacoes`

**Campos Disponíveis:**
- `id` - ID
- `item_id` - Item movimentado
- `usuario_id` - **Quem fez a movimentação**
- `tipo` - Tipo de movimentação
- `quantidade` - Quantidade movimentada
- `local_from_id` - Local de origem
- `local_to_id` - Local de destino
- `observacao` - Observações
- `created_at` - **Quando foi feito**

### Status Atual:
⚠️ **Tabela existe mas NÃO está sendo populada automaticamente**

**Onde está sendo usada:**
- Apenas em `/movimentacoes` (endpoint manual)
- NÃO é preenchida automaticamente em transferências
- NÃO é preenchida em criação/edição de itens

---

## ✅ **NOTIFICAÇÕES** (Rastreamento Parcial)

### Tabela: `notifications`

**Campos Salvos:**
- ✅ `id` - ID da notificação
- ✅ `user_id` - **Para quem foi enviada**
- ✅ `tipo` - Tipo de notificação
- ✅ `titulo` - Título
- ✅ `mensagem` - Mensagem (inclui quem fez a ação)
- ✅ `reference_type` - Tipo de referência (transfer, item, etc)
- ✅ `reference_id` - ID do objeto referenciado
- ✅ `link` - Link para acessar
- ✅ `read` - Se foi lida
- ✅ `created_at` - **Quando foi criada**
- ✅ `read_at` - Quando foi lida

### Informações Rastreadas:

✅ **Ações Notificadas:**
- Transferências recebidas
- Transferências aceitas/rejeitadas
- Transferências canceladas (quem cancelou aparece na mensagem)
- Devoluções ao estoque pendentes
- Items transferidos administrativamente

❌ **NÃO Rastreiam:**
- Quem leu a notificação (apenas se foi lida)
- Ações não relacionadas a transferências

---

## ❌ **ITEMS** (SEM Auditoria Completa)

### Tabela: `items`

**Campos com Timestamps:**
- ✅ `created_at` - **Quando foi criado**
- ✅ `updated_at` - **Quando foi atualizado pela última vez**
- ✅ `data_aquisicao` - Data de compra
- ✅ `data_saida` - Data de saída
- ✅ `data_retorno` - Data de retorno

### Informações NÃO Rastreadas:

❌ **Faltam:**
- **Quem criou o item** (não tem campo `created_by_user_id`)
- **Quem editou o item** (não tem campo `updated_by_user_id`)
- **Histórico de mudanças** (valores anteriores não são salvos)
- **Log de alterações de quantidade**
- **Log de mudanças de estado**

**Observação:** Você só sabe QUANDO foi criado/atualizado, mas não QUEM fez.

---

## ❌ **USUÁRIOS** (SEM Auditoria)

### Tabela: `users`

**Campos com Timestamps:**
- ✅ `created_at` - Quando foi criado
- ✅ `updated_at` - Quando foi atualizado

### Informações NÃO Rastreadas:

❌ **Faltam:**
- Quem criou o usuário
- Quem editou o usuário
- Quem deletou o usuário
- Histórico de mudanças de perfil/cargo
- Log de acessos

---

## ❌ **CATEGORIAS e OBRAS** (SEM Auditoria)

Não têm rastreamento de:
- Quem criou
- Quem editou
- Quem deletou
- Quando foi feito

---

## 📊 Resumo do Rastreamento

| Entidade | Quem Fez | Quando | O Que Fez | Histórico Completo |
|---|:---:|:---:|:---:|:---:|
| **Transferências** | ✅ | ✅ | ✅ | ✅ |
| **Notificações** | ⚠️ | ✅ | ✅ | ⚠️ |
| **Items** | ❌ | ✅ | ❌ | ❌ |
| **Usuários** | ❌ | ✅ | ❌ | ❌ |
| **Categorias** | ❌ | ❌ | ❌ | ❌ |
| **Obras** | ❌ | ❌ | ❌ | ❌ |
| **Movimentações** | ✅* | ✅* | ✅* | ✅* |

**Legenda:**
- ✅ = Rastreado completamente
- ⚠️ = Rastreado parcialmente
- ❌ = Não rastreado
- * = Tabela existe mas não está sendo usada automaticamente

---

## 🔍 O Que Você Consegue Saber Atualmente

### ✅ **PODE SABER:**

1. **Transferências:**
   - Histórico completo de quem transferiu para quem
   - Quando foi transferido
   - Se foi aceito ou rejeitado
   - Quem cancelou e quando
   - Se foi transferência administrativa e quem fez

2. **Notificações:**
   - Quem recebeu quais notificações
   - Quando foram enviadas
   - Se foram lidas

### ❌ **NÃO PODE SABER:**

1. **Items:**
   - Quem criou o item
   - Quem editou o item pela última vez
   - Histórico de mudanças (ex: quem mudou a quantidade de 10 para 5)
   - Quem alterou o estado do item

2. **Usuários:**
   - Quem criou um usuário
   - Quem editou um usuário
   - Quem deletou um usuário
   - Histórico de mudanças de perfil

3. **Categorias/Obras:**
   - Quem criou
   - Quem editou
   - Histórico de mudanças

---

## 🚀 Recomendações para Melhorar o Rastreamento

### **Prioridade ALTA:**

1. **Adicionar auditoria em Items:**
   ```sql
   ALTER TABLE items ADD COLUMN created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
   ALTER TABLE items ADD COLUMN updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
   ```

2. **Criar tabela de log de mudanças:**
   ```sql
   CREATE TABLE audit_log (
     id SERIAL PRIMARY KEY,
     table_name VARCHAR(50) NOT NULL,
     record_id TEXT NOT NULL,
     action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
     user_id UUID REFERENCES users(id) ON DELETE SET NULL,
     changes JSONB, -- {campo: {old: valor_antigo, new: valor_novo}}
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Usar a tabela movimentacoes automaticamente:**
   - Criar trigger para registrar mudanças de quantidade
   - Registrar mudanças de estado
   - Registrar transferências

### **Prioridade MÉDIA:**

4. **Adicionar auditoria em Usuários:**
   ```sql
   ALTER TABLE users ADD COLUMN created_by_user_id UUID REFERENCES users(id);
   ALTER TABLE users ADD COLUMN updated_by_user_id UUID REFERENCES users(id);
   ```

5. **Log de acessos:**
   ```sql
   CREATE TABLE access_log (
     id SERIAL PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     action VARCHAR(100),
     ip_address VARCHAR(45),
     user_agent TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### **Prioridade BAIXA:**

6. **Auditoria em Categorias/Obras**
7. **Snapshot de estados anteriores**
8. **Exportação de logs para CSV/Excel**

---

## 📝 Exemplo de Consulta de Histórico Atual

### **Histórico de um Item (Transferências):**

```sql
SELECT
  t.*,
  i.nome as item_nome,
  u1.nome as de_usuario_nome,
  u2.nome as para_usuario_nome
FROM transfers t
LEFT JOIN items i ON t.item_id = i.id
LEFT JOIN users u1 ON t.de_usuario_id = u1.id
LEFT JOIN users u2 ON t.para_usuario_id = u2.id
WHERE t.item_id = 'UUID_DO_ITEM'
ORDER BY t.data_envio DESC;
```

**Resultado:**
```
id | item_nome | de_usuario | para_usuario | tipo | status | data_envio | observacoes
---|-----------|------------|--------------|------|--------|------------|------------
1  | Notebook  | Admin João | Maria Silva  | transferencia | concluida | 2025-01-10 | Transferência administrativa
2  | Notebook  | João Silva | Admin João   | devolucao | concluida | 2025-01-09 | Devolução ao estoque
3  | Notebook  | Almox      | João Silva   | transferencia | concluida | 2025-01-08 | Entrega inicial
```

---

## ⚠️ Limitações Atuais

1. **Não é possível saber quem:**
   - Criou um item no estoque
   - Alterou a quantidade de um item
   - Mudou o estado de um item manualmente
   - Editou informações de um item

2. **Não é possível saber:**
   - Valores anteriores de campos editados
   - Quando exatamente um campo foi alterado
   - Quantas vezes um item foi editado

3. **Rastreamento apenas em transferências:**
   - Somente transferências têm histórico completo
   - Outras ações (criar, editar, deletar items) não são rastreadas

---

## ✅ Conclusão

**O sistema atualmente rastreia MUITO BEM:**
- ✅ Transferências (histórico completo de quem fez o quê)
- ✅ Notificações (quem recebeu e quando)

**O sistema NÃO rastreia:**
- ❌ Quem cria/edita/deleta items
- ❌ Mudanças em campos de items
- ❌ Quem gerencia usuários, categorias, obras

**Se você precisa de auditoria completa, é necessário implementar:**
1. Campos `created_by_user_id` e `updated_by_user_id` em todas as tabelas
2. Tabela de `audit_log` para rastrear todas as mudanças
3. Triggers ou lógica de aplicação para popular esses logs automaticamente

---

**Última atualização:** 2025-11-13
