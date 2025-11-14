# Relatório de Permissões por Cargo

## Sistema de Almoxarifado - Controle de Acessos

---

## 📋 **FUNCIONÁRIO** (Perfil Básico)

### ✅ **Permissões Permitidas:**

#### **Items (Itens)**
- ✅ Visualizar **apenas seus próprios itens** (com ele)
- ✅ Ver detalhes de seus itens
- ❌ NÃO pode ver itens do estoque
- ❌ NÃO pode ver itens de outros funcionários
- ❌ NÃO pode adicionar novos itens
- ❌ NÃO pode editar itens
- ❌ NÃO pode excluir itens

#### **Transferências**
- ✅ Criar transferências **apenas de seus próprios itens**
- ✅ Enviar itens para outros funcionários (requer aprovação do destinatário)
- ✅ **NÃO pode devolver itens ao estoque** (não tem acesso a esta opção)
- ✅ Receber transferências e aceitar/rejeitar
- ✅ Ver histórico de suas próprias transferências
- ❌ NÃO pode ver transferências de outros
- ❌ NÃO pode cancelar transferências

#### **Notificações**
- ✅ Ver suas notificações
- ✅ Aceitar ou rejeitar transferências recebidas
- ✅ Ver transferências pendentes direcionadas a ele
- ❌ NÃO tem acesso à aba "Administrar Transferências"

#### **Usuários**
- ❌ NÃO pode ver lista de usuários
- ❌ NÃO pode adicionar usuários
- ❌ NÃO pode editar usuários
- ❌ NÃO pode excluir usuários

#### **Outras Funcionalidades**
- ❌ NÃO pode acessar relatórios
- ❌ NÃO pode gerenciar obras
- ❌ NÃO pode gerenciar categorias
- ❌ NÃO pode gerenciar locais de armazenamento

---

## 🏪 **ALMOXARIFE** (Perfil Intermediário)

### ✅ **Permissões Permitidas:**

#### **Items (Itens)**
- ✅ Visualizar **TODOS os itens** (estoque + todos os funcionários)
- ✅ Adicionar novos itens ao estoque
- ✅ Editar qualquer item
- ✅ Excluir itens
- ✅ Ver detalhes completos de todos os itens
- ✅ Filtros avançados:
  - "Todos os Itens"
  - "Meus Itens Pessoais"
  - "Itens do Estoque"
  - "Itens de Outros Funcionários"

#### **Transferências**
- ✅ Visualizar **TODAS as transferências** da organização
- ✅ Criar transferências de **QUALQUER item** (estoque ou de outros funcionários)
- ✅ **Transferências administrativas automáticas** (sem aprovação):
  - Pegar item de outro funcionário e transferir diretamente
  - Item vai direto para o destinatário
  - Notificação automática para ambos
- ✅ Transferir itens do estoque para funcionários
- ✅ Receber e aprovar devoluções ao estoque
- ✅ Aceitar ou rejeitar transferências recebidas
- ✅ **Cancelar qualquer transferência pendente** com motivo
- ✅ Ver histórico completo de transferências

#### **Notificações**
- ✅ Ver todas as notificações
- ✅ Aceitar/rejeitar transferências
- ✅ **Aba "Administrar Transferências"**:
  - Ver todas as transferências (pendentes, concluídas, canceladas)
  - Cancelar transferências pendentes
  - Filtrar por status
- ✅ Receber notificações de devoluções ao estoque
- ✅ Aprovar/Rejeitar devoluções ao estoque (qualquer almoxarife/gestor/admin pode aprovar)

#### **Usuários**
- ❌ NÃO pode ver lista de usuários
- ❌ NÃO pode adicionar usuários
- ❌ NÃO pode editar usuários
- ❌ NÃO pode excluir usuários

#### **Outras Funcionalidades**
- ✅ Acesso a relatórios
- ✅ Gerenciar categorias
- ✅ Gerenciar locais de armazenamento
- ❌ NÃO pode gerenciar obras (apenas admin/gestor)

---

## 👔 **GESTOR** (Perfil de Gestão)

### ✅ **Permissões Permitidas:**

#### **TODAS as permissões do ALMOXARIFE, MAIS:**

#### **Usuários**
- ⚠️ Pode visualizar usuários (limitado)
- ❌ NÃO pode adicionar usuários
- ❌ NÃO pode editar usuários
- ❌ NÃO pode excluir usuários

#### **Outras Funcionalidades**
- ✅ Gerenciar obras
- ✅ Acesso a relatórios avançados
- ✅ Visão geral da organização

**Nota:** Gestores têm as mesmas permissões de transferência que almoxarifes (transferências administrativas automáticas).

---

## 👑 **ADMIN** (Perfil Completo)

### ✅ **Permissões Permitidas:**

#### **TODAS as permissões do GESTOR, MAIS:**

#### **Usuários**
- ✅ Ver **TODOS os usuários** da organização
- ✅ Adicionar novos usuários
- ✅ Editar qualquer usuário
- ✅ **Excluir usuários** (exceto a si mesmo)
- ✅ Gerenciar perfis e permissões
- ✅ Enviar convites para novos usuários

#### **Items**
- ✅ Controle total sobre todos os itens

#### **Transferências**
- ✅ **Poder total sobre transferências administrativas**
- ✅ Pode aprovar suas próprias devoluções ao estoque
- ✅ Cancelar qualquer transferência
- ✅ Forçar transferências sem aprovação

#### **Organizações**
- ✅ Gerenciar configurações da organização
- ✅ Convidar novos membros
- ✅ Definir permissões

#### **Outras Funcionalidades**
- ✅ Acesso completo a todas as funcionalidades do sistema
- ✅ Configurações avançadas
- ✅ Logs e auditoria

---

## 🔄 Fluxos de Transferência por Cargo

### **FUNCIONÁRIO → FUNCIONÁRIO**
1. Funcionário A cria transferência do seu item para Funcionário B
2. Status: **PENDENTE**
3. Funcionário B recebe notificação
4. Funcionário B aceita ou rejeita
5. Se aceito: item vai para Funcionário B
6. Se rejeitado: item volta para Funcionário A

### **FUNCIONÁRIO → ESTOQUE (Devolução)**
1. ❌ Funcionários **NÃO PODEM** devolver ao estoque
2. Essa opção não aparece para eles

### **ADMIN/GESTOR/ALMOXARIFE → FUNCIONÁRIO (do estoque)**
1. Admin seleciona item do estoque
2. Cria transferência para Funcionário
3. Status: **PENDENTE**
4. Funcionário recebe notificação
5. Funcionário aceita ou rejeita

### **ADMIN/GESTOR/ALMOXARIFE → FUNCIONÁRIO (de outro funcionário) 🆕**
1. Admin seleciona item que está com Funcionário A
2. Cria transferência para Funcionário B
3. Status: **CONCLUÍDA AUTOMATICAMENTE**
4. Item vai DIRETO para Funcionário B (sem aprovação)
5. Funcionário A recebe notificação: "Item transferido administrativamente"
6. Funcionário B recebe notificação: "Item transferido para você"

### **QUALQUER CARGO → ESTOQUE (Devolução com Aprovação)**
1. Usuário cria devolução ao estoque
2. Status: **PENDENTE**
3. **TODOS** os almoxarifes/gestores/admins recebem notificação
4. **Primeiro a responder** processa a devolução
5. Se aprovado: item vai para estoque
6. Se rejeitado: item volta para o remetente
7. Outras notificações são automaticamente deletadas

---

## 🔒 Validações de Segurança

### **Ao Deletar Usuário:**
- ✅ Foreign keys com `ON DELETE SET NULL`
- ✅ Transferências mantidas no histórico
- ✅ Referências ao usuário tornam-se NULL
- ✅ Items órfãos vão para o estoque
- ❌ Usuário não pode deletar a si mesmo

### **Ao Cancelar Transferência:**
- ✅ Apenas admin/gestor/almoxarife pode cancelar
- ✅ Não pode cancelar transferências concluídas
- ✅ Item volta ao remetente se era pendente
- ✅ Notificações relacionadas são deletadas
- ✅ Remetente é notificado do cancelamento

### **Transferências Administrativas:**
- ✅ Apenas admin/gestor/almoxarife
- ✅ Apenas se item está com OUTRO funcionário
- ✅ Item vai direto sem aprovação
- ✅ Ambos são notificados
- ✅ Registrado como "Transferência administrativa"

---

## 📊 Resumo Visual de Permissões

| Funcionalidade | Funcionário | Almoxarife | Gestor | Admin |
|---|:---:|:---:|:---:|:---:|
| **Ver próprios itens** | ✅ | ✅ | ✅ | ✅ |
| **Ver itens do estoque** | ❌ | ✅ | ✅ | ✅ |
| **Ver itens de outros** | ❌ | ✅ | ✅ | ✅ |
| **Adicionar itens** | ❌ | ✅ | ✅ | ✅ |
| **Editar itens** | ❌ | ✅ | ✅ | ✅ |
| **Excluir itens** | ❌ | ✅ | ✅ | ✅ |
| **Transferir próprios itens** | ✅ | ✅ | ✅ | ✅ |
| **Transferir itens de outros (admin)** | ❌ | ✅ | ✅ | ✅ |
| **Devolver ao estoque** | ❌ | ✅ | ✅ | ✅ |
| **Aprovar devoluções** | ❌ | ✅ | ✅ | ✅ |
| **Cancelar transferências** | ❌ | ✅ | ✅ | ✅ |
| **Ver todas as transferências** | ❌ | ✅ | ✅ | ✅ |
| **Gerenciar usuários** | ❌ | ❌ | ⚠️ | ✅ |
| **Excluir usuários** | ❌ | ❌ | ❌ | ✅ |
| **Gerenciar obras** | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar categorias** | ❌ | ✅ | ✅ | ✅ |
| **Relatórios** | ❌ | ✅ | ✅ | ✅ |

**Legenda:**
- ✅ = Permitido
- ❌ = Bloqueado
- ⚠️ = Limitado

---

## 🆕 Funcionalidades Recentes Implementadas

1. **Transferências Administrativas (Admin/Gestor/Almoxarife)**
   - Pegar item de outro funcionário sem aprovação
   - Transferência automática e imediata

2. **Aprovação de Próprias Devoluções (Admin/Gestor/Almoxarife)**
   - Admins podem aprovar devoluções que eles mesmos enviaram
   - Útil quando é o único admin

3. **Devolução ao Estoque com Aprovação Distribuída**
   - Todos os admins/gestores/almoxarifes são notificados
   - Primeiro a responder processa
   - Outras notificações deletadas automaticamente

4. **Cancelamento de Transferências (Admin/Gestor/Almoxarife)**
   - Cancelar qualquer transferência pendente
   - Item volta ao remetente
   - Notificações limpas

5. **Deleção de Usuários sem Erro**
   - Foreign keys com `ON DELETE SET NULL`
   - Histórico de transferências preservado
   - Sem erros de constraint

6. **Visualização Completa para Admins**
   - Ver todos os itens de todos
   - Filtros: "Itens de Outros Funcionários"
   - Filtro por funcionário específico

---

## 🔐 Regras de Negócio Importantes

1. **Um funcionário NUNCA pode:**
   - Ver itens que não são dele
   - Transferir itens de outros
   - Devolver ao estoque
   - Cancelar transferências

2. **Almoxarife/Gestor/Admin SEMPRE podem:**
   - Ver todos os itens
   - Transferir qualquer item
   - Aprovar devoluções
   - Cancelar transferências pendentes

3. **Apenas Admin pode:**
   - Gerenciar usuários completamente
   - Excluir usuários
   - Configurar a organização

4. **Transferências Automáticas (Admin) ocorrem quando:**
   - Quem cria a transferência é admin/gestor/almoxarife
   - Item está com OUTRO funcionário (não com quem está transferindo)
   - Vai direto sem aprovação

5. **Devoluções ao Estoque:**
   - Qualquer cargo pode devolver (exceto funcionário)
   - Requer aprovação de admin/gestor/almoxarife
   - Aprovação distribuída (qualquer um pode aprovar)
   - Primeiro a aprovar processa

---

**Última atualização:** 2025-11-13
**Versão do sistema:** 1.0 (com transferências administrativas)
