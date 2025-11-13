# 👥 Perfis de Usuário - Sistema Almoxarifado

## Hierarquia de Perfis

```
Admin > Gestor > Almoxarife > Funcionário
```

---

## 🔴 **Administrador** (admin)

**Controle total do sistema**

### Permissões:
- ✅ **Tudo que Gestor pode fazer, mais:**
- ✅ Ver e gerenciar menu "Usuários" (exclusivo)
- ✅ Criar/editar/excluir qualquer usuário
- ✅ Criar convites para qualquer perfil (incluindo admin)
- ✅ Acessar todas as funcionalidades sem restrição

### Quando usar:
- Proprietário da empresa
- TI / Responsável pelo sistema
- Apenas 1-2 pessoas devem ter esse perfil

---

## 🟡 **Gestor** (gestor)

**Gerência e supervisão**

### Permissões:
- ✅ **Tudo que Almoxarife pode fazer, mais:**
- ✅ Criar convites para novos usuários (até perfil Gestor)
- ✅ Ver todos os usuários da organização
- ✅ Ver relatórios e dashboard completo
- ✅ Gerenciar obras e projetos
- ✅ Aprovar/rejeitar requisições especiais

### Quando usar:
- Gerente de projetos
- Coordenador de obras
- Supervisor geral

---

## 🟢 **Almoxarife** (almoxarife)

**Controle do estoque**

### Permissões:
- ✅ **Tudo que Funcionário pode fazer, mais:**
- ✅ **Transferir itens DO ESTOQUE para funcionários**
- ✅ Cadastrar novos itens no sistema
- ✅ Editar/excluir itens
- ✅ Criar categorias e locais de armazenamento
- ✅ Receber devoluções de itens
- ✅ Fazer inventário e ajustes de estoque
- ✅ Ver histórico completo de movimentações

### Quando usar:
- Responsável pelo almoxarifado físico
- Pessoa que controla entrada/saída de materiais
- Faz contagem de estoque

---

## 🔵 **Funcionário** (funcionario)

**Uso básico - requisição de materiais**

### Permissões:
- ✅ Ver itens disponíveis
- ✅ **Transferir apenas SEUS PRÓPRIOS itens** para outros usuários
- ✅ Solicitar transferências (que precisam ser aceitas)
- ✅ Receber/aceitar/rejeitar transferências
- ✅ Ver seu histórico de movimentações
- ✅ Escanear QR codes

### Restrições:
- ❌ **NÃO pode transferir itens do estoque** (só almoxarife+)
- ❌ NÃO pode criar/editar itens
- ❌ NÃO pode ver itens de outros usuários
- ❌ NÃO pode criar categorias ou locais

### Quando usar:
- Funcionários de obra
- Usuários que apenas usam ferramentas/materiais
- Equipe de campo

---

## 📊 Tabela Resumida de Permissões

| Funcionalidade | Funcionário | Almoxarife | Gestor | Admin |
|----------------|-------------|------------|--------|-------|
| Ver itens | ✅ | ✅ | ✅ | ✅ |
| Criar/editar itens | ❌ | ✅ | ✅ | ✅ |
| **Transferir itens do estoque** | ❌ | ✅ | ✅ | ✅ |
| Transferir seus itens | ✅ | ✅ | ✅ | ✅ |
| Criar categorias | ❌ | ✅ | ✅ | ✅ |
| Criar locais | ❌ | ✅ | ✅ | ✅ |
| Gerenciar obras | ❌ | ❌ | ✅ | ✅ |
| Ver usuários | ❌ | ❌ | ✅ | ✅ |
| Criar convites | ❌ | ❌ | ✅ | ✅ |
| Menu Usuários | ❌ | ❌ | ❌ | ✅ |
| Gerenciar qualquer usuário | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Exemplo de Uso

### Cenário 1: Funcionário requisita material
1. **João (funcionário)** precisa de uma furadeira
2. **João** acessa "Transferências" → vê apenas SEUS itens
3. **João** NÃO VÊ itens do estoque (só almoxarife vê)
4. **João** pede para o almoxarife

### Cenário 2: Almoxarife envia material
1. **Maria (almoxarife)** acessa "Transferências"
2. **Maria** VÊ itens do estoque + seus próprios itens
3. **Maria** seleciona furadeira do estoque
4. **Maria** transfere para João
5. **João** recebe notificação e aceita
6. Item sai do estoque e vai para João

### Cenário 3: Funcionário devolve item
1. **João (funcionário)** terminou de usar furadeira
2. **João** acessa "Transferências" → vê a furadeira (agora é dele)
3. **João** seleciona a furadeira
4. **João** transfere para Maria (almoxarife)
5. **Maria** aceita e devolve ao estoque

---

## 🔒 Segurança

- Usuário só vê itens da **SUA organização**
- Funcionário só transfere **SEUS itens**
- Almoxarife/Gestor/Admin podem transferir do **estoque**
- Todas as transferências geram **notificações**
- Histórico completo de **auditoria**

---

## 💡 Recomendações

### Distribuição Ideal:
- **1-2 Admins** (apenas proprietários/TI)
- **2-3 Gestores** (gerentes de projeto)
- **1-2 Almoxarifes** (responsáveis pelo estoque)
- **Demais: Funcionários**

### Boas Práticas:
1. Não criar muitos admins (risco de segurança)
2. Almoxarife deve ser alguém que está sempre no local
3. Gestor deve ter visão estratégica
4. Funcionários devem ter treinamento básico do sistema
