# Sistema de Almoxarifado/Inventário - Análise de Mercado e Requisitos

**Data de Análise:** 2025-11-11
**Objetivo:** Sistema de controle de inventário para ~900 itens com rastreamento de localização, responsáveis e aprovações mobile

---

## 1. RESUMO EXECUTIVO

### 1.1 Análise de Mercado

Após pesquisa aprofundada de sistemas existentes no mercado (ASAP Systems, Asset Panda, Sortly, EZOfficeInventory, Procore, Jonas Construction, entre outros), identificamos padrões consistentes de funcionalidades e fluxos de usuário que definem sistemas de almoxarifado modernos.

**Principais Tendências Identificadas:**
- **Mobile-First:** Todas as soluções líderes de mercado priorizam aplicativos mobile com recursos offline
- **Rastreamento por Códigos:** QR Codes e códigos de barras são padrão da indústria
- **Aprovações Automatizadas:** Workflows de aprovação configuráveis são essenciais
- **Multi-Localização:** Capacidade de rastrear itens entre múltiplas obras/projetos
- **Custódia Clara:** Registro detalhado de quem está com cada item e histórico completo

### 1.2 Escopo do Sistema Proposto

Sistema web + mobile para gerenciar 900 itens distribuídos entre:
- Almoxarifado central
- Múltiplas obras/projetos
- Responsáveis individuais (colaboradores)

---

## 2. FUNCIONALIDADES ESSENCIAIS

### 2.1 MVP (Fase 1 - Essencial)

#### 2.1.1 Gestão de Itens
- **Cadastro de Itens**
  - Código único (gerado automaticamente ou manual)
  - Nome/Descrição
  - Categoria/Tipo
  - Unidade de medida
  - Quantidade mínima (alerta de estoque baixo)
  - Foto do item
  - QR Code gerado automaticamente
  - Status (Ativo/Inativo/Em Manutenção/Descartado)

- **Busca e Filtros**
  - Busca por código, nome, categoria
  - Filtros por localização, responsável, status
  - Visualização em lista e grid
  - Ordenação por múltiplos critérios

#### 2.1.2 Controle de Localização
- **Cadastro de Locais**
  - Almoxarifado Central (seções/prateleiras)
  - Obras/Projetos (endereço, responsável)
  - Em Trânsito
  - Em Manutenção Externa

- **Movimentação de Itens**
  - Transferência entre locais
  - Registro de data/hora automático
  - Usuário que realizou a movimentação
  - Motivo da movimentação (opcional)
  - Histórico completo de movimentações

#### 2.1.3 Controle de Responsáveis
- **Atribuição de Itens**
  - Associar item a um responsável
  - Data de atribuição
  - Prazo de devolução (opcional)
  - Status: Em uso, Aguardando devolução, Devolvido

- **Histórico de Custódia**
  - Quem teve o item
  - Por quanto tempo
  - Condições de recebimento/devolução
  - Assinatura digital (aceite)

#### 2.1.4 Sistema de Aprovações
- **Requisição de Itens**
  - Usuário solicita item(ns)
  - Define quantidade, local de destino, justificativa
  - Sistema roteia para aprovador apropriado

- **Workflow de Aprovação**
  - Aprovação em 1 ou 2 níveis (configurável)
  - Notificações push/email
  - Aprovação via mobile
  - Histórico de aprovações/rejeições
  - Comentários do aprovador

- **Status de Requisição**
  - Pendente
  - Aprovada
  - Rejeitada
  - Em Separação
  - Entregue
  - Cancelada

#### 2.1.5 Funcionalidades Mobile (Essencial)
- **Escaneamento de QR Code/Código de Barras**
  - Entrada/Saída de itens
  - Verificação rápida de informações
  - Inventário rápido

- **Modo Offline**
  - Sincronização automática quando online
  - Armazenamento local de operações
  - Indicador visual de status de conexão

- **Operações Básicas**
  - Consultar itens
  - Registrar entrada/saída
  - Aprovar requisições
  - Fotografar itens
  - Assinar recebimentos

#### 2.1.6 Relatórios Básicos
- **Inventário Atual**
  - Por localização
  - Por categoria
  - Por responsável

- **Movimentações**
  - Por período
  - Por item
  - Por usuário

- **Requisições**
  - Pendentes
  - Histórico de aprovações

- **Alertas**
  - Estoque baixo
  - Itens não devolvidos no prazo
  - Itens sem movimentação há muito tempo

---

### 2.2 Fase 2 - Funcionalidades Avançadas

#### 2.2.1 Gestão Avançada de Estoque
- **Controle de Lotes**
  - Número de lote
  - Data de validade
  - Fornecedor
  - FIFO/LIFO automático

- **Controle de Custo**
  - Preço de aquisição
  - Valor total do estoque
  - Depreciação de ativos
  - Custo por centro de custo

- **Manutenção Preventiva**
  - Agenda de manutenções
  - Histórico de manutenções
  - Alertas de vencimento
  - Checklist de manutenção

#### 2.2.2 Integrações
- **Sistema Financeiro**
  - Integração com ERP
  - Ordens de compra
  - Notas fiscais

- **Fornecedores**
  - Cadastro de fornecedores
  - Cotações
  - Histórico de compras

- **RH**
  - Importação de colaboradores
  - Integração com ponto eletrônico

#### 2.2.3 Análises e BI
- **Dashboard Executivo**
  - KPIs principais
  - Gráficos interativos
  - Tendências de consumo

- **Análise Preditiva**
  - Previsão de necessidade
  - Otimização de estoque
  - Sugestões de reposição

- **Relatórios Customizados**
  - Construtor de relatórios
  - Exportação Excel/PDF
  - Relatórios agendados

#### 2.2.4 Mobile Avançado
- **Inventário Cíclico**
  - Rotinas de contagem
  - Divergências automáticas
  - Auditoria mobile

- **Comandos de Voz**
  - Operação hands-free
  - Busca por voz

- **Realidade Aumentada**
  - Visualização de localização
  - Mapeamento de armazém

#### 2.2.5 Segurança e Auditoria
- **Auditoria Completa**
  - Log de todas as operações
  - Rastreamento de alterações
  - Relatório de auditoria

- **Segurança Avançada**
  - Autenticação de dois fatores
  - Biometria
  - Geolocalização obrigatória
  - Assinatura digital certificada

---

## 3. TIPOS DE USUÁRIOS E PERMISSÕES

### 3.1 Matriz de Usuários

#### **1. Administrador do Sistema**
**Responsabilidades:**
- Configuração geral do sistema
- Gestão de usuários e permissões
- Cadastro de locais e categorias
- Configuração de workflows
- Acesso a todos os relatórios e auditorias

**Permissões:**
- ✅ Todas as funcionalidades
- ✅ Configurações do sistema
- ✅ Gestão de usuários
- ✅ Exclusão de registros
- ✅ Acesso a logs de auditoria

---

#### **2. Gerente de Almoxarifado (Almoxarife Chefe)**
**Responsabilidades:**
- Gestão operacional do almoxarifado
- Aprovação de requisições de alto valor
- Supervisão de inventários
- Gestão de estoque mínimo
- Relatórios gerenciais

**Permissões:**
- ✅ Cadastro e edição de itens
- ✅ Movimentação de itens
- ✅ Aprovação de requisições (nível 2)
- ✅ Ajustes de inventário
- ✅ Relatórios completos
- ✅ Gestão de almoxarifes
- ❌ Configurações do sistema
- ❌ Exclusão de registros (apenas inativação)

---

#### **3. Almoxarife / Operador de Almoxarifado**
**Responsabilidades:**
- Entrada e saída de materiais
- Separação de requisições aprovadas
- Contagem de inventário
- Organização física do almoxarifado
- Atualização de localizações

**Permissões:**
- ✅ Consulta de itens
- ✅ Registrar entrada/saída
- ✅ Movimentação entre locais
- ✅ Escaneamento de QR Codes
- ✅ Atualizar localização física
- ✅ Inventário (contagem)
- ❌ Cadastro de itens
- ❌ Aprovações
- ❌ Ajustes de inventário
- ❌ Exclusão de registros

---

#### **4. Gestor de Obra / Coordenador de Projeto**
**Responsabilidades:**
- Gestão de itens na obra
- Requisição de materiais para obra
- Aprovação de requisições da equipe
- Controle de responsáveis na obra
- Devolução de materiais

**Permissões:**
- ✅ Visualizar itens da sua obra
- ✅ Criar requisições
- ✅ Aprovar requisições da equipe (nível 1)
- ✅ Movimentar itens dentro da obra
- ✅ Atribuir responsáveis
- ✅ Relatórios da obra
- ❌ Acesso a outras obras
- ❌ Cadastro de itens
- ❌ Ajustes de inventário

---

#### **5. Encarregado / Líder de Equipe**
**Responsabilidades:**
- Requisição de materiais para equipe
- Controle de ferramentas da equipe
- Devolução de materiais
- Relatório de uso

**Permissões:**
- ✅ Visualizar itens disponíveis
- ✅ Criar requisições
- ✅ Consultar status de requisições
- ✅ Confirmar recebimento
- ✅ Registrar devolução
- ❌ Aprovações
- ❌ Movimentação livre
- ❌ Cadastro de itens

---

#### **6. Colaborador / Usuário Final**
**Responsabilidades:**
- Solicitar materiais/ferramentas
- Confirmar recebimento
- Informar problemas/danos
- Devolver itens

**Permissões:**
- ✅ Visualizar catálogo de itens
- ✅ Criar requisições pessoais
- ✅ Consultar suas requisições
- ✅ Confirmar recebimento
- ✅ Solicitar devolução
- ❌ Aprovar requisições
- ❌ Movimentar itens
- ❌ Acessar outras obras

---

#### **7. Consultor / Visualizador (Leitura)**
**Responsabilidades:**
- Visualização de relatórios
- Acompanhamento de indicadores
- Exportação de dados

**Permissões:**
- ✅ Visualizar itens
- ✅ Visualizar relatórios
- ✅ Exportar dados
- ❌ Qualquer alteração
- ❌ Requisições
- ❌ Movimentações

---

### 3.2 Matriz de Permissões Resumida

| Funcionalidade | Admin | Gerente | Almoxarife | Gestor Obra | Encarregado | Colaborador | Consultor |
|---------------|-------|---------|------------|-------------|-------------|-------------|-----------|
| **Gestão de Usuários** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configurações Sistema** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Cadastrar Itens** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Editar Itens** | ✅ | ✅ | 📝¹ | ❌ | ❌ | ❌ | ❌ |
| **Excluir Itens** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Entrada de Itens** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Saída de Itens** | ✅ | ✅ | ✅ | 📝² | ❌ | ❌ | ❌ |
| **Transferências** | ✅ | ✅ | ✅ | 📝² | ❌ | ❌ | ❌ |
| **Criar Requisição** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Aprovar Requisição N1** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Aprovar Requisição N2** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Ajuste de Inventário** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Contagem Inventário** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Atribuir Responsável** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Relatórios Gerais** | ✅ | ✅ | 📝³ | 📝⁴ | 📝⁴ | 📝⁵ | ✅ |
| **Logs de Auditoria** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legendas:**
- ✅ = Permissão total
- ❌ = Sem permissão
- 📝¹ = Apenas atualização de localização física
- 📝² = Apenas na sua obra
- 📝³ = Relatórios operacionais do almoxarifado
- 📝⁴ = Relatórios da sua obra/equipe
- 📝⁵ = Apenas suas requisições

---

## 4. FLUXOS DE USUÁRIO DETALHADOS

### 4.1 Fluxo Principal: Requisição e Entrega de Item

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO COMPLETO: Requisição de Material                      │
└─────────────────────────────────────────────────────────────┘

[COLABORADOR - Mobile/Web]
1. Acessa "Nova Requisição"
2. Busca item por nome ou escaneia QR Code
3. Seleciona quantidade necessária
4. Informa:
   - Local de destino (obra/projeto)
   - Data necessária
   - Justificativa
5. Submete requisição
   ↓
   Status: PENDENTE APROVAÇÃO

[SISTEMA]
- Gera número de requisição (REQ-2025-0001)
- Identifica aprovador(es) baseado em:
  * Valor do item
  * Quantidade
  * Regras configuradas
- Envia notificação push + email
   ↓

[GESTOR DE OBRA - Mobile]
6. Recebe notificação
7. Visualiza detalhes da requisição
8. Verifica:
   - Necessidade real
   - Disponibilidade no orçamento
   - Prioridade
9. Decisão:

   ┌─────────────┐          ┌─────────────┐
   │  APROVAR    │          │  REJEITAR   │
   └─────────────┘          └─────────────┘
         │                        │
         │                        │
         ↓                        ↓
   Status: APROVADA         Status: REJEITADA
   (+ comentário)           (+ motivo obrigatório)
         │                        │
         ↓                        ↓
   [Continua fluxo]         [Notifica colaborador]
                                  [FIM]

[SISTEMA - Aprovação Nível 1]
10. Se valor > R$ XXXX (configurável):
    - Encaminha para Gerente de Almoxarifado
    - Status: AGUARDANDO APROVAÇÃO N2
    Senão:
    - Status: APROVADA FINAL
    - Encaminha para separação
   ↓

[GERENTE DE ALMOXARIFADO - Desktop/Mobile]
11. Analisa requisição de alto valor
12. APROVAR ou REJEITAR
    ↓
    Status: APROVADA FINAL
   ↓

[ALMOXARIFE - Mobile]
13. Recebe lista de "Requisições Aprovadas"
14. Acessa requisição REQ-2025-0001
15. Inicia separação
    - Status: EM SEPARAÇÃO
16. Escaneia QR Code do item
    - Sistema valida disponibilidade
    - Confirma quantidade
17. Registra:
    - Quantidade separada
    - Condições do item (novo/usado/danificado)
    - Foto (opcional)
18. Se item em falta/quantidade insuficiente:
    - Registra divergência
    - Notifica gestor automaticamente
19. Finaliza separação
    - Status: AGUARDANDO RETIRADA
    - Notifica solicitante
   ↓

[COLABORADOR ou ENCARREGADO - Mobile]
20. Recebe notificação de "Material Pronto"
21. Desloca-se ao almoxarifado
22. Almoxarife confirma identidade
23. Colaborador:
    - Escaneia QR Code para confirmar recebimento
    - Assina digitalmente na tela
    - Confirma quantidade e condições
24. Sistema registra:
    - Data/hora de retirada
    - Usuário que retirou
    - Localização de destino
    - Assinatura digital
25. Status: ENTREGUE
    ↓

[SISTEMA - Atualização Automática]
26. Atualiza estoque:
    - Deduz quantidade do almoxarifado central
    - Adiciona quantidade na obra de destino
27. Atualiza responsável:
    - Item agora sob custódia do colaborador
28. Gera histórico de movimentação
29. Atualiza relatórios em tempo real
30. Se estoque < mínimo:
    - Dispara alerta de reposição

[FIM DO FLUXO]
```

---

### 4.2 Fluxo: Devolução de Item

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Devolução de Material ao Almoxarifado                │
└─────────────────────────────────────────────────────────────┘

[COLABORADOR - Mobile]
1. Acessa "Meus Itens"
2. Seleciona item a devolver
3. Clica em "Solicitar Devolução"
4. Informa:
   - Quantidade a devolver
   - Condições (mesmo estado/danificado/desgastado)
   - Foto (se danificado)
   - Observações
5. Submete solicitação
   ↓
   Status: DEVOLUÇÃO SOLICITADA

[SISTEMA]
- Notifica almoxarife
- Gera código de devolução (DEV-2025-0001)
   ↓

[ALMOXARIFE - Mobile]
6. Recebe notificação
7. Pode:
   - Aceitar (agendar recebimento)
   - Solicitar mais informações
8. Agenda data/hora de recebimento
   ↓
   Status: DEVOLUÇÃO AGENDADA

[COLABORADOR - Mobile]
9. Recebe confirmação de agendamento
10. Na data agendada, desloca-se ao almoxarifado
    ↓

[ALMOXARIFE - Mobile]
11. Escaneia QR Code do item
12. Sistema exibe:
    - Histórico do item
    - Condições na retirada
    - Tempo de uso
13. Inspeciona fisicamente o item
14. Registra:
    - Condições atuais (OK/Danificado/Necessita Manutenção)
    - Quantidade recebida
    - Foto (se houver alteração)
    - Localização física no almoxarifado
15. Se danificado:
    - Registra tipo de dano
    - Estima custo de reparo
    - Pode cobrar do responsável
    - Altera status do item (Em Manutenção)
16. Confirma devolução
    - Status: DEVOLVIDO
   ↓

[SISTEMA - Atualização]
17. Retorna item ao estoque
18. Remove de "Itens sob Responsabilidade"
19. Atualiza histórico de custódia
20. Se necessário, cria ordem de manutenção
21. Atualiza relatórios

[FIM]
```

---

### 4.3 Fluxo: Entrada de Novos Itens

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Cadastro e Entrada de Novos Itens                    │
└─────────────────────────────────────────────────────────────┘

[GERENTE DE ALMOXARIFADO - Desktop]
1. Acessa "Cadastro de Itens"
2. Clica em "Novo Item"
3. Preenche informações:
   - Código (manual ou automático)
   - Nome do item
   - Descrição detalhada
   - Categoria
   - Subcategoria
   - Unidade de medida
   - Estoque mínimo
   - Estoque máximo (opcional)
   - Valor unitário
   - Fornecedor principal
   - Tempo de reposição
4. Upload de foto/imagem
5. Define:
   - Requer aprovação? (Sim/Não)
   - Nível de aprovação (1 ou 2 níveis)
   - Limite de valor para N2
6. Gera QR Code automaticamente
7. Salva cadastro
   ↓
   Item criado (Status: SEM ESTOQUE)

[ALMOXARIFE - Desktop/Mobile]
8. Acessa "Entrada de Materiais"
9. Busca item recém-criado
10. Registra entrada:
    - Quantidade recebida
    - Número da nota fiscal
    - Data de recebimento
    - Fornecedor
    - Lote (se aplicável)
    - Data de validade (se aplicável)
    - Valor total
11. Define localização física:
    - Seção: A
    - Prateleira: 3
    - Posição: 15
12. Fotografa itens (opcional)
13. Confirma entrada
    ↓

[SISTEMA]
14. Atualiza estoque
15. Gera etiquetas de QR Code para impressão
16. Atualiza valor do inventário
17. Registra no histórico
18. Item disponível para requisição

[ALMOXARIFE - Físico]
19. Imprime etiquetas QR Code
20. Cola etiquetas nos itens/prateleiras
21. Organiza fisicamente no local definido

[FIM]
```

---

### 4.4 Fluxo: Transferência Entre Obras

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Transferência de Item Entre Obras/Projetos           │
└─────────────────────────────────────────────────────────────┘

[GESTOR DE OBRA A - Mobile]
1. Acessa "Itens da Minha Obra"
2. Seleciona item excedente/ocioso
3. Clica em "Transferir"
4. Seleciona:
   - Obra de destino (Obra B)
   - Quantidade a transferir
   - Justificativa
   - Data de envio prevista
5. Submete solicitação
   ↓

[GESTOR DE OBRA B - Mobile]
6. Recebe notificação de transferência
7. Visualiza detalhes
8. ACEITAR ou RECUSAR
   - Se RECUSAR: Transferência cancelada
   - Se ACEITAR: Continua ↓
   ↓
   Status: TRANSFERÊNCIA APROVADA

[SISTEMA]
9. Notifica ambas as partes
10. Altera status do item: EM TRÂNSITO
11. Remove de estoque Obra A (reserva)
    ↓

[RESPONSÁVEL LOGÍSTICA - Mobile]
12. Recebe lista de "Transferências Pendentes"
13. Organiza transporte
14. Na Obra A:
    - Escaneia QR Code do item
    - Confirma coleta
    - Registra responsável pelo transporte
    - Foto da carga (opcional)
15. Status: EM TRANSPORTE
    ↓

[RESPONSÁVEL LOGÍSTICA - Mobile]
16. Na Obra B:
    - Escaneia QR Code do item
    - Confirma entrega
    - Gestor B assina recebimento
    - Foto da descarga (opcional)
17. Status: TRANSFERÊNCIA CONCLUÍDA
    ↓

[SISTEMA]
18. Remove item do estoque Obra A
19. Adiciona item ao estoque Obra B
20. Atualiza histórico de localização
21. Atualiza responsável (Gestor B)
22. Gera relatório de transferência

[FIM]
```

---

### 4.5 Fluxo: Inventário Cíclico

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Contagem de Inventário (Cíclico ou Geral)            │
└─────────────────────────────────────────────────────────────┘

[GERENTE DE ALMOXARIFADO - Desktop]
1. Acessa "Inventários"
2. Clica em "Novo Inventário"
3. Define:
   - Tipo: Cíclico (categoria específica) ou Geral (todos)
   - Categorias a contar
   - Data de início
   - Data limite
   - Responsáveis pela contagem
4. Gera ordem de inventário (INV-2025-001)
   ↓

[SISTEMA]
5. Cria lista de itens a contar
6. Bloqueia movimentações dos itens (opcional)
7. Notifica responsáveis
   ↓

[ALMOXARIFE 1 - Mobile]
8. Acessa inventário INV-2025-001
9. Visualiza lista de itens da sua área
10. Para cada item:
    - Escaneia QR Code
    - Sistema mostra:
      * Quantidade no sistema: 15 unidades
      * Última movimentação: XX/XX/XXXX
      * Localização esperada: A-3-15
    - Conta fisicamente
    - Registra quantidade contada: 13 unidades
    - Se divergência:
      * Tira foto
      * Adiciona observação
11. Marca item como "Contado"
12. Repete para todos os itens
13. Finaliza sua parte
    ↓

[ALMOXARIFE 2 - Mobile] (Contagem Cega - opcional)
14. Acessa mesmo inventário
15. Conta os mesmos itens SEM ver contagem anterior
16. Registra suas contagens
17. Finaliza
    ↓

[SISTEMA]
18. Compara contagens:
    - Contagem 1: 13 unidades
    - Contagem 2: 13 unidades
    - Sistema: 15 unidades
19. Se contagens batem:
    - Status item: CONTAGEM CONFIRMADA
20. Se contagens divergem:
    - Status item: RECONTAGEM NECESSÁRIA
   ↓

[GERENTE DE ALMOXARIFADO - Desktop]
21. Revisa divergências:
    - Item A: -2 unidades (falta)
    - Item B: +3 unidades (sobra)
22. Para cada divergência:
    - Analisa histórico
    - Verifica fotos
    - Investiga possível causa
23. Autoriza ajustes ou solicita nova contagem
24. Registra justificativa obrigatória
25. Aprova ajuste de inventário
    ↓

[SISTEMA]
26. Atualiza quantidades no sistema
27. Gera relatório de inventário:
    - Itens contados
    - Divergências encontradas
    - Ajustes realizados
    - Valor das diferenças
28. Registra em auditoria
29. Fecha inventário
30. Libera movimentações

[FIM]
```

---

### 4.6 Fluxo: Manutenção de Item

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Envio de Item para Manutenção                        │
└─────────────────────────────────────────────────────────────┘

[COLABORADOR - Mobile]
1. Identifica problema no item
2. Acessa "Meus Itens"
3. Seleciona item com problema
4. Clica em "Reportar Problema"
5. Preenche:
   - Tipo de problema
   - Descrição detalhada
   - Fotos/vídeos
   - Gravidade (Baixa/Média/Alta/Crítica)
6. Submete
   ↓

[GESTOR DE OBRA - Mobile]
7. Recebe notificação
8. Avalia problema
9. Decide:
   - Reparar localmente
   - Enviar para manutenção externa
   - Descartar
10. Se enviar para manutenção:
    - Clica "Enviar para Manutenção"
    - Solicita devolução ao almoxarifado
    ↓

[ALMOXARIFE - Mobile]
11. Recebe item devolvido
12. Confirma problema reportado
13. Registra:
    - Estado atual (fotos)
    - Orçamento estimado
    - Prazo estimado
14. Altera status: EM MANUTENÇÃO
15. Se manutenção externa:
    - Cadastra fornecedor/oficina
    - Gera ordem de serviço (OS-2025-001)
    - Registra data de envio
    ↓

[SISTEMA]
16. Remove item do estoque disponível
17. Cria registro de manutenção
18. Notifica gerente do orçamento
19. Se item crítico:
    - Alerta de substituição necessária
    ↓

[FORNECEDOR EXTERNO]
20. Realiza manutenção
    ↓

[ALMOXARIFE - Mobile]
21. Recebe item de volta
22. Registra:
    - Data de retorno
    - Serviços realizados
    - Custo real
    - Nota fiscal
23. Testa funcionamento
24. Tira fotos do estado atual
25. Se OK:
    - Status: DISPONÍVEL
    - Retorna ao estoque
26. Se não OK:
    - Status: AGUARDANDO DECISÃO
    - Notifica gerente
    ↓

[SISTEMA]
27. Atualiza valor do ativo
28. Registra em histórico de manutenções
29. Atualiza custo total de propriedade
30. Item disponível para nova requisição

[FIM]
```

---

## 5. ESTRUTURA DE DADOS SUGERIDA

### 5.1 Modelo de Dados Relacional

#### **Tabela: users (Usuários)**
```sql
users
├── id (PK)
├── username (unique)
├── email (unique)
├── password_hash
├── full_name
├── cpf (unique)
├── phone
├── photo_url
├── role_id (FK → roles)
├── department_id (FK → departments)
├── default_location_id (FK → locations)
├── is_active
├── last_login
├── created_at
├── updated_at
└── deleted_at (soft delete)
```

#### **Tabela: roles (Perfis/Funções)**
```sql
roles
├── id (PK)
├── name (Admin, Gerente, Almoxarife, Gestor de Obra, etc.)
├── description
├── permissions (JSON ou tabela separada)
├── created_at
└── updated_at
```

#### **Tabela: departments (Departamentos)**
```sql
departments
├── id (PK)
├── name
├── description
├── manager_id (FK → users)
├── created_at
└── updated_at
```

#### **Tabela: locations (Localizações)**
```sql
locations
├── id (PK)
├── code (unique, ex: ALMOX-01, OBRA-SP-001)
├── name
├── type (Almoxarifado, Obra, Em Trânsito, Manutenção Externa)
├── parent_location_id (FK → locations, para hierarquia)
├── address
├── city
├── state
├── zip_code
├── latitude
├── longitude
├── responsible_user_id (FK → users)
├── is_active
├── created_at
└── updated_at
```

#### **Tabela: categories (Categorias)**
```sql
categories
├── id (PK)
├── name
├── description
├── parent_category_id (FK → categories, para subcategorias)
├── icon
├── color
├── requires_approval
├── approval_levels (1 ou 2)
├── approval_value_threshold (para N2)
├── created_at
└── updated_at
```

#### **Tabela: items (Itens)**
```sql
items
├── id (PK)
├── code (unique, ex: EQP-001, MAT-345)
├── name
├── description
├── category_id (FK → categories)
├── unit_of_measure (UN, KG, M, M², L, etc.)
├── current_stock
├── min_stock_level
├── max_stock_level
├── unit_cost
├── total_value (calculado: current_stock * unit_cost)
├── qr_code (gerado automaticamente)
├── barcode
├── photo_url
├── status (Ativo, Inativo, Em Manutenção, Descartado)
├── is_serialized (booleano, se cada unidade tem número único)
├── requires_approval
├── approval_levels
├── supplier_id (FK → suppliers)
├── reorder_lead_time_days
├── notes
├── created_by (FK → users)
├── created_at
├── updated_at
└── deleted_at
```

#### **Tabela: item_stock (Estoque por Localização)**
```sql
item_stock
├── id (PK)
├── item_id (FK → items)
├── location_id (FK → locations)
├── quantity
├── section (ex: Seção A)
├── shelf (ex: Prateleira 3)
├── position (ex: Posição 15)
├── batch_number
├── expiration_date
├── last_counted_at
├── last_movement_at
├── updated_at
└── UNIQUE(item_id, location_id, batch_number)
```

#### **Tabela: movements (Movimentações)**
```sql
movements
├── id (PK)
├── movement_number (unique, ex: MOV-2025-00001)
├── item_id (FK → items)
├── type (Entrada, Saída, Transferência, Ajuste, Devolução)
├── quantity
├── unit_cost (no momento da movimentação)
├── from_location_id (FK → locations, null se entrada)
├── to_location_id (FK → locations, null se saída)
├── from_user_id (FK → users, quem está entregando)
├── to_user_id (FK → users, quem está recebendo)
├── movement_date
├── reason (motivo da movimentação)
├── reference_number (NF, Requisição, OS, etc.)
├── reference_type (PurchaseOrder, Requisition, MaintenanceOrder, etc.)
├── reference_id (FK para tabela correspondente)
├── notes
├── status (Pendente, Confirmado, Cancelado)
├── confirmed_by (FK → users)
├── confirmed_at
├── created_by (FK → users)
├── created_at
└── attachments (JSON com URLs de fotos/documentos)
```

#### **Tabela: requisitions (Requisições)**
```sql
requisitions
├── id (PK)
├── requisition_number (unique, ex: REQ-2025-00001)
├── requested_by (FK → users)
├── destination_location_id (FK → locations)
├── needed_date
├── priority (Baixa, Normal, Alta, Urgente)
├── justification
├── status (Pendente, Aprovada N1, Aprovada N2, Rejeitada, Em Separação, Aguardando Retirada, Entregue, Cancelada)
├── approved_level1_by (FK → users)
├── approved_level1_at
├── approved_level1_comments
├── approved_level2_by (FK → users)
├── approved_level2_at
├── approved_level2_comments
├── rejected_by (FK → users)
├── rejected_at
├── rejection_reason
├── separated_by (FK → users)
├── separated_at
├── delivered_by (FK → users)
├── delivered_at
├── received_by (FK → users)
├── received_at
├── digital_signature (hash da assinatura)
├── created_at
└── updated_at
```

#### **Tabela: requisition_items (Itens da Requisição)**
```sql
requisition_items
├── id (PK)
├── requisition_id (FK → requisitions)
├── item_id (FK → items)
├── quantity_requested
├── quantity_approved
├── quantity_delivered
├── unit_cost (snapshot no momento)
├── item_condition (Novo, Usado, Recondicionado)
├── notes
├── created_at
└── updated_at
```

#### **Tabela: item_custody (Custódia de Itens)**
```sql
item_custody
├── id (PK)
├── item_id (FK → items)
├── responsible_user_id (FK → users)
├── location_id (FK → locations)
├── quantity
├── assigned_date
├── expected_return_date
├── actual_return_date
├── status (Em Uso, Atrasado, Devolvido)
├── assignment_condition (estado na retirada)
├── return_condition (estado na devolução)
├── assignment_notes
├── return_notes
├── assignment_signature
├── return_signature
├── created_by (FK → users)
├── created_at
├── returned_by (FK → users)
└── returned_at
```

#### **Tabela: inventory_counts (Contagens de Inventário)**
```sql
inventory_counts
├── id (PK)
├── count_number (unique, ex: INV-2025-001)
├── type (Cíclico, Geral, Spot)
├── status (Planejado, Em Andamento, Concluído, Cancelado)
├── location_id (FK → locations, null se geral)
├── category_id (FK → categories, null se geral)
├── scheduled_date
├── start_date
├── end_date
├── created_by (FK → users)
├── approved_by (FK → users)
├── approved_at
├── notes
├── created_at
└── updated_at
```

#### **Tabela: inventory_count_items (Itens Contados)**
```sql
inventory_count_items
├── id (PK)
├── inventory_count_id (FK → inventory_counts)
├── item_id (FK → items)
├── location_id (FK → locations)
├── system_quantity (quantidade no sistema antes da contagem)
├── counted_quantity_1 (primeira contagem)
├── counted_by_1 (FK → users)
├── counted_at_1
├── counted_quantity_2 (segunda contagem, se necessário)
├── counted_by_2 (FK → users)
├── counted_at_2
├── final_quantity (quantidade final aceita)
├── variance (diferença)
├── variance_cost (impacto financeiro)
├── status (Pendente, Contado, Divergente, Recontagem, Ajustado)
├── notes
├── photos (JSON com URLs)
└── updated_at
```

#### **Tabela: maintenance_orders (Ordens de Manutenção)**
```sql
maintenance_orders
├── id (PK)
├── order_number (unique, ex: OS-2025-001)
├── item_id (FK → items)
├── type (Preventiva, Corretiva, Preditiva)
├── priority (Baixa, Normal, Alta, Crítica)
├── reported_by (FK → users)
├── reported_date
├── problem_description
├── status (Aberta, Em Orçamento, Aguardando Aprovação, Em Execução, Concluída, Cancelada)
├── assigned_to (FK → suppliers ou users internos)
├── estimated_cost
├── actual_cost
├── estimated_completion_date
├── actual_completion_date
├── work_description
├── parts_used (JSON)
├── invoice_number
├── approved_by (FK → users)
├── approved_at
├── created_at
├── updated_at
└── attachments (JSON com fotos antes/depois, orçamentos, NFs)
```

#### **Tabela: suppliers (Fornecedores)**
```sql
suppliers
├── id (PK)
├── name
├── legal_name
├── cnpj (unique)
├── contact_person
├── email
├── phone
├── address
├── city
├── state
├── zip_code
├── payment_terms
├── lead_time_days
├── rating (1-5 estrelas)
├── is_active
├── notes
├── created_at
└── updated_at
```

#### **Tabela: notifications (Notificações)**
```sql
notifications
├── id (PK)
├── user_id (FK → users)
├── type (Requisição, Aprovação, Alerta, Sistema, etc.)
├── title
├── message
├── reference_type (Requisition, MaintenanceOrder, etc.)
├── reference_id
├── is_read
├── read_at
├── priority (Normal, Alta)
├── action_url (link para a ação)
├── created_at
└── expires_at
```

#### **Tabela: audit_logs (Logs de Auditoria)**
```sql
audit_logs
├── id (PK)
├── user_id (FK → users)
├── action (CREATE, UPDATE, DELETE, APPROVE, REJECT, etc.)
├── entity_type (Item, Requisition, Movement, etc.)
├── entity_id
├── old_values (JSON)
├── new_values (JSON)
├── ip_address
├── user_agent
├── location_latitude
├── location_longitude
├── created_at
└── INDEX(user_id, entity_type, created_at)
```

#### **Tabela: alerts (Alertas do Sistema)**
```sql
alerts
├── id (PK)
├── type (EstoqueBaixo, ItemAtrasado, ManutençãoVencida, etc.)
├── severity (Info, Warning, Error, Critical)
├── item_id (FK → items, nullable)
├── location_id (FK → locations, nullable)
├── user_id (FK → users, nullable)
├── title
├── description
├── status (Ativo, Resolvido, Ignorado)
├── resolved_by (FK → users)
├── resolved_at
├── resolution_notes
├── created_at
└── updated_at
```

---

### 5.2 Relacionamentos Principais

```
users
  ├─ 1:N → requisitions (solicitante)
  ├─ 1:N → movements (executor)
  ├─ 1:N → item_custody (responsável)
  ├─ 1:N → inventory_count_items (contador)
  ├─ N:1 → roles (função)
  └─ N:1 → locations (localização padrão)

items
  ├─ 1:N → item_stock (estoque em cada local)
  ├─ 1:N → movements (movimentações)
  ├─ 1:N → requisition_items (requisições)
  ├─ 1:N → item_custody (custódia)
  ├─ N:1 → categories (categoria)
  └─ N:1 → suppliers (fornecedor principal)

locations
  ├─ 1:N → item_stock (itens neste local)
  ├─ 1:N → movements (origem ou destino)
  ├─ 1:N → requisitions (destino)
  └─ N:1 → users (responsável)

requisitions
  ├─ 1:N → requisition_items (itens solicitados)
  ├─ 1:N → movements (geradas após aprovação)
  ├─ N:1 → users (solicitante)
  └─ N:1 → locations (destino)

movements
  ├─ N:1 → items (item movimentado)
  ├─ N:1 → locations (origem)
  ├─ N:1 → locations (destino)
  └─ N:1 → users (executor)
```

---

## 6. CONSIDERAÇÕES TÉCNICAS

### 6.1 Arquitetura Recomendada

#### **Stack Tecnológico Sugerido**

**Backend:**
- **Node.js + Express** ou **Python + FastAPI**
  - APIs RESTful
  - Autenticação JWT
  - WebSockets para notificações em tempo real

- **Banco de Dados:**
  - **PostgreSQL** (principal) - dados relacionais
  - **Redis** - cache e sessões
  - **S3-compatible storage** - fotos e documentos

**Frontend Web:**
- **React** ou **Vue.js**
- **TypeScript** para type safety
- **TailwindCSS** ou **Material-UI** para UI
- **React Query / TanStack Query** para cache de dados
- PWA (Progressive Web App) para funcionar offline

**Mobile:**
- **React Native** ou **Flutter**
  - Compartilhamento de código entre iOS e Android
  - Acesso nativo à câmera e GPS
  - Suporte offline robusto

**Infraestrutura:**
- **Docker** para containerização
- **Kubernetes** ou **AWS ECS** para orquestração
- **AWS/Azure/GCP** para cloud hosting
- **CloudFront/CDN** para distribuição de assets

---

### 6.2 Funcionalidades Críticas para Mobile

#### **6.2.1 Modo Offline (ESSENCIAL)**

**Estratégia:**
1. **Sincronização Inteligente:**
   - Queue local de operações pendentes
   - Sincronização automática quando online
   - Resolução de conflitos (last-write-wins ou manual)

2. **Dados Locais:**
   - Cache de itens mais usados
   - Cache de localizações
   - Cache de requisições do usuário
   - SQLite local ou Realm/WatermelonDB

3. **Indicadores Visuais:**
   - Status de conexão sempre visível
   - Operações pendentes de sincronização
   - Confirmação de sincronização bem-sucedida

**Implementação:**
```javascript
// Exemplo conceitual
const offlineQueue = {
  operations: [],

  async add(operation) {
    operations.push({
      id: uuid(),
      type: operation.type,
      data: operation.data,
      timestamp: Date.now(),
      status: 'pending'
    });
    await saveToLocalStorage();
  },

  async sync() {
    if (!navigator.onLine) return;

    for (let op of operations) {
      try {
        await api.execute(op);
        op.status = 'synced';
      } catch (error) {
        op.status = 'error';
        op.error = error.message;
      }
    }

    operations = operations.filter(op => op.status !== 'synced');
    await saveToLocalStorage();
  }
};
```

---

#### **6.2.2 Escaneamento de QR Code / Código de Barras**

**Requisitos:**
- Scanner integrado no app (react-native-camera, expo-barcode-scanner)
- Suporte para múltiplos formatos (QR, EAN-13, Code-39, Code-128)
- Modo de escaneamento contínuo (múltiplos itens)
- Flashlight automático em ambientes escuros
- Feedback visual e sonoro de sucesso

**Fluxos de Uso:**
1. **Entrada/Saída Rápida:** Escanear → Confirmar quantidade → Salvar
2. **Inventário:** Escanear → Sistema mostra esperado → Inserir contado
3. **Transferência:** Escanear origem → Escanear destino → Confirmar
4. **Consulta:** Escanear → Ver detalhes completos do item

---

#### **6.2.3 Geolocalização**

**Usos:**
- Validar que usuário está no local correto (anti-fraude)
- Rastrear onde operações foram realizadas
- Alertas se usuário está longe do local de entrega

**Configurações:**
- Obrigatório para operações críticas (aprovações de alto valor)
- Opcional para consultas
- Precisão configurável (100m, 500m, 1km)

---

#### **6.2.4 Assinatura Digital**

**Implementação:**
- Canvas para assinatura com dedo/stylus
- Salvar como imagem (PNG)
- Timestamp e geolocalização vinculados
- Hash criptográfico para validação

---

#### **6.2.5 Câmera e Fotos**

**Funcionalidades:**
- Tirar múltiplas fotos
- Fotos obrigatórias para:
  - Itens danificados
  - Devoluções com problemas
  - Inventário com divergências
- Compressão automática para economizar dados
- Upload em background quando em Wi-Fi

---

### 6.3 Performance e Escalabilidade

#### **6.3.1 Otimizações de Performance**

**Backend:**
- Indexação de banco de dados (item_code, requisition_number, etc.)
- Paginação para listas grandes
- Cache de queries frequentes (Redis)
- Compressão de responses (gzip)
- Rate limiting para prevenir abuso

**Frontend:**
- Virtual scrolling para listas longas
- Lazy loading de imagens
- Code splitting
- Service Workers para cache
- Debouncing em buscas

**Mobile:**
- Imagens otimizadas (WebP)
- Paginação infinita
- Cache agressivo de dados
- Lazy loading de telas

---

#### **6.3.2 Escalabilidade para 900 Itens**

**Preocupações:**
- 900 itens é gerenciável, mas pensar em crescimento futuro
- Múltiplas obras simultâneas = multiplicador de movimentações
- Histórico cresce exponencialmente

**Estratégias:**
1. **Particionamento de Dados:**
   - Movimentações antigas em cold storage
   - Arquivamento automático após 12 meses

2. **Busca Otimizada:**
   - ElasticSearch para buscas full-text
   - Índices compostos para filtros comuns

3. **Relatórios:**
   - Processamento assíncrono (background jobs)
   - Cache de relatórios pré-calculados
   - Exportações via fila (não bloqueante)

---

### 6.4 Segurança

#### **6.4.1 Autenticação e Autorização**

**Autenticação:**
- JWT tokens (access + refresh)
- Expiração curta (15 min access, 7 dias refresh)
- Logout em todos os dispositivos
- Senha forte obrigatória
- 2FA opcional (recomendado para admins)

**Autorização:**
- RBAC (Role-Based Access Control)
- Validação de permissões no backend (nunca confiar no frontend)
- Permissões granulares por recurso
- Logs de todas as ações sensíveis

---

#### **6.4.2 Proteção de Dados**

**Criptografia:**
- HTTPS obrigatório (TLS 1.3)
- Senhas com bcrypt (cost factor ≥ 12)
- Dados sensíveis criptografados em repouso
- Assinaturas digitais com hash SHA-256

**Privacidade:**
- LGPD compliance
- Dados pessoais minimizados
- Direito de exclusão de dados
- Anonimização de logs antigos

**Backup:**
- Backup diário automatizado
- Retenção de 30 dias
- Testes de restore mensais
- Backup offsite

---

#### **6.4.3 Auditoria**

**Logs Obrigatórios:**
- Quem fez o quê, quando e onde
- IP address e device info
- Mudanças em dados críticos (before/after)
- Tentativas de acesso não autorizado

**Retenção:**
- Logs de auditoria: 5 anos (compliance)
- Logs operacionais: 90 dias
- Logs de segurança: 1 ano

---

### 6.5 Integrações Futuras

#### **6.5.1 APIs de Terceiros**

**ERP/Financeiro:**
- SAP, TOTVS, Omie, Bling
- Sincronização de produtos
- Integração de compras
- Conciliação de estoque

**E-commerce/Marketplace:**
- Sincronização de estoque disponível
- Reserva automática em vendas

**Fornecedores:**
- Cotações automáticas
- Tracking de entregas
- Notas fiscais eletrônicas (NF-e)

**Contabilidade:**
- Movimentações de estoque
- Valorização de inventário
- Depreciação de ativos

---

#### **6.5.2 IoT e Automação**

**RFID:**
- Leitura em massa de múltiplos itens
- Contagem automática em portais
- Alertas de remoção não autorizada

**Sensores:**
- Temperatura/umidade para itens sensíveis
- Peso em prateleiras (estoque automático)
- Abertura de portas/armários

**Beacons/Bluetooth:**
- Localização indoor precisa
- Proximidade para auto-check-in/out

---

### 6.6 UX/UI - Melhores Práticas

#### **6.6.1 Princípios de Design**

**Mobile-First:**
- Projetar para telas pequenas primeiro
- Operações com no máximo 3 toques
- Botões grandes (min 44x44px)
- Texto legível (min 16px)

**Feedback Imediato:**
- Loading states claros
- Success/error messages
- Animações suaves (não excessivas)
- Confirmações para ações destrutivas

**Acessibilidade:**
- Contraste adequado (WCAG AA)
- Suporte a screen readers
- Navegação por teclado
- Textos alternativos em imagens

---

#### **6.6.2 Padrões de Interface**

**Dashboard:**
- KPIs principais visíveis imediatamente
- Ações rápidas (botões de ação primária)
- Busca global sempre acessível
- Notificações não intrusivas

**Listas:**
- Filtros persistentes
- Busca instantânea
- Ações em massa (seleção múltipla)
- Pull-to-refresh

**Formulários:**
- Validação inline (tempo real)
- Autocomplete quando possível
- Campo de busca com sugestões
- Salvar rascunhos automaticamente

**Mobile Específico:**
- Bottom navigation (fácil alcance com polegar)
- Swipe gestures para ações comuns
- Scanner acessível em 1 toque
- Modo escuro (economiza bateria OLED)

---

## 7. ROADMAP DE IMPLEMENTAÇÃO

### 7.1 Fase 1 - MVP (2-3 meses)

**Sprint 1-2: Fundação (4 semanas)**
- Setup de infraestrutura
- Autenticação e usuários
- Cadastro de itens básico
- Cadastro de locais

**Sprint 3-4: Operações Básicas (4 semanas)**
- Entrada/saída de itens
- Movimentações entre locais
- Busca e filtros
- Geração de QR Codes

**Sprint 5-6: Requisições (4 semanas)**
- Sistema de requisições
- Workflow de aprovação (2 níveis)
- Notificações
- Status tracking

**Sprint 7-8: Mobile MVP (4 semanas)**
- App mobile básico
- Scanner de QR Code
- Modo offline
- Aprovações mobile

**Sprint 9: Relatórios Básicos (2 semanas)**
- Inventário atual
- Movimentações
- Requisições pendentes

**Sprint 10: Testes e Ajustes (2 semanas)**
- Testes de integração
- Testes de usuário
- Correções de bugs
- Documentação

---

### 7.2 Fase 2 - Funcionalidades Avançadas (2-3 meses)

**Sprint 11-12: Custódia e Devolução**
- Sistema de atribuição de responsáveis
- Assinatura digital
- Controle de prazos
- Alertas de atraso

**Sprint 13-14: Inventário Cíclico**
- Planejamento de inventários
- Contagem mobile
- Dupla contagem
- Ajustes automatizados

**Sprint 15-16: Manutenção**
- Ordens de manutenção
- Workflow de aprovação
- Integração com fornecedores
- Histórico de manutenções

**Sprint 17-18: Relatórios Avançados**
- Dashboard executivo
- Gráficos e KPIs
- Relatórios customizados
- Exportações

---

### 7.3 Fase 3 - Otimizações e Integrações (2 meses)

**Sprint 19-20: Performance**
- Otimização de queries
- Cache avançado
- Compressão
- CDN setup

**Sprint 21-22: Integrações**
- API pública
- Webhooks
- Integração ERP (1º parceiro)
- Importação em massa

**Sprint 23-24: Segurança e Compliance**
- Auditoria completa
- 2FA
- Backup automático
- LGPD compliance

---

## 8. MÉTRICAS DE SUCESSO (KPIs)

### 8.1 KPIs Operacionais

**Eficiência:**
- ⏱ Tempo médio de aprovação de requisição (meta: < 2 horas)
- ⏱ Tempo médio de separação (meta: < 30 min)
- 📊 Taxa de requisições aprovadas no primeiro nível (meta: > 80%)
- 📊 Acurácia de inventário (meta: > 98%)

**Produtividade:**
- 📈 Número de movimentações por dia
- 📈 Itens processados por almoxarife/hora
- 📈 Requisições processadas por dia
- 📉 Redução de tempo em processos manuais (meta: -60%)

**Qualidade:**
- ✅ Divergências de inventário (meta: < 2%)
- ✅ Devoluções com problemas (meta: < 5%)
- ✅ Erros de separação (meta: < 1%)
- ✅ Requisições canceladas após aprovação (meta: < 3%)

---

### 8.2 KPIs de Adoção

**Usuários:**
- 👥 Taxa de adoção mobile (meta: > 90% dos usuários ativos)
- 👥 Usuários ativos diários (DAU)
- 👥 Frequência de uso por usuário
- 👥 Taxa de retenção mensal

**Funcionalidades:**
- 📱 % de operações via mobile vs web (meta: > 70% mobile)
- 📱 Uso de scanner QR Code (meta: > 80% das operações)
- 📱 Aprovações via mobile (meta: > 60%)
- 📱 Operações offline sincronizadas com sucesso (meta: > 95%)

---

### 8.3 KPIs Financeiros

**Custos:**
- 💰 Redução de perdas de estoque (meta: -40%)
- 💰 Redução de itens não localizados (meta: -80%)
- 💰 Redução de compras duplicadas (meta: -50%)
- 💰 ROI do sistema (payback esperado: 12-18 meses)

**Valor de Estoque:**
- 📊 Valor total de inventário
- 📊 Itens inativos/parados (meta: < 10%)
- 📊 Giro de estoque (meta: aumentar 25%)
- 📊 Custo de armazenagem por item

---

### 8.4 KPIs de Satisfação

**Usuários:**
- ⭐ NPS (Net Promoter Score) - meta: > 50
- ⭐ Satisfação com o app mobile - meta: > 4.5/5
- ⭐ Facilidade de uso - meta: > 4.0/5
- ⭐ Tickets de suporte por usuário - meta: < 0.5/mês

**Sistema:**
- 🚀 Disponibilidade (uptime) - meta: > 99.5%
- 🚀 Tempo de resposta médio - meta: < 500ms
- 🚀 Taxa de erro - meta: < 0.1%
- 🚀 Sincronizações offline bem-sucedidas - meta: > 98%

---

## 9. FUNCIONALIDADES CRÍTICAS NÃO MENCIONADAS

### 9.1 Essenciais para o MVP

#### **9.1.1 Gestão de Rascunhos**
- Salvar requisições não finalizadas
- Continuar de onde parou (especialmente mobile)
- Auto-save a cada alteração

#### **9.1.2 Busca Global Inteligente**
- Buscar por código, nome, localização, responsável
- Sugestões enquanto digita
- Filtros salvos/favoritos
- Histórico de buscas

#### **9.1.3 Notificações Push**
- Requisições pendentes de aprovação
- Itens prontos para retirada
- Alertas de estoque baixo
- Itens atrasados para devolução
- Configuráveis por usuário

#### **9.1.4 Dashboard Personalizado**
- Widgets configuráveis por perfil
- Atalhos para ações frequentes
- Indicadores relevantes para cada tipo de usuário
- Atualizações em tempo real

#### **9.1.5 Histórico Completo**
- Linha do tempo de cada item
- Quem teve, quando, por quanto tempo
- Todas as movimentações
- Todas as aprovações/rejeições

#### **9.1.6 Comentários e Comunicação**
- Comentários em requisições
- Threads de discussão
- @menções para notificar pessoas
- Histórico de comunicações

---

### 9.2 Importantes para Fase 2

#### **9.2.1 Etiquetas e Tags**
- Tags customizadas para itens
- Cores para categorização visual
- Filtros por tags
- Tags sugeridas automaticamente

#### **9.2.2 Anexos e Documentos**
- Manuais de equipamentos
- Notas fiscais
- Certificados
- Garantias
- Fotos em alta resolução

#### **9.2.3 Kits e Conjuntos**
- Agrupar itens relacionados
- Movimentar conjunto completo
- Checklists de conferência
- Ex: "Kit Elétrico Básico" = alicate + chave phillips + multímetro

#### **9.2.4 Reservas**
- Reservar itens para futura requisição
- Bloquear estoque temporariamente
- Gerenciar fila de espera
- Priorização de reservas

#### **9.2.5 Templates de Requisição**
- Salvar requisições frequentes como template
- Requisições recorrentes
- Clone de requisições passadas
- Ex: "Material Semanal Obra ABC"

#### **9.2.6 Calendário de Entregas**
- Visualizar todas as entregas programadas
- Capacidade de entrega por dia
- Rotas de entrega otimizadas
- Integração com Google Calendar

#### **9.2.7 Empréstimos entre Obras**
- Fluxo simplificado de empréstimo
- Prazo de devolução obrigatório
- Lembretes de devolução
- Histórico de empréstimos

#### **9.2.8 Gestão de Uniformes e EPIs**
- Controle de tamanhos
- Validade de EPIs
- Troca periódica obrigatória
- Conformidade com NRs

#### **9.2.9 Múltiplas Unidades de Medida**
- Conversões automáticas
- Ex: Cabos em metros ou rolos
- Requisitar em uma unidade, controlar em outra

#### **9.2.10 Importação e Exportação**
- Importar catálogo de fornecedores (CSV/Excel)
- Exportar relatórios
- Backup manual
- Migração de sistemas legados

---

## 10. CONSIDERAÇÕES FINAIS

### 10.1 Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixa adoção mobile | Alto | Média | Treinamento intensivo, UX simples, feedback dos usuários |
| Problemas de sincronização offline | Alto | Média | Testes extensivos, queue robusta, indicadores claros |
| Resistência à mudança | Médio | Alta | Change management, mostrar benefícios rápidos |
| Performance com grande volume | Médio | Baixa | Arquitetura escalável, testes de carga |
| Perda de conexão constante | Alto | Alta | Modo offline completo, não depender de internet |
| Segurança de dados | Alto | Baixa | Criptografia, auditorias, backups |

---

### 10.2 Fatores Críticos de Sucesso

1. **Simplicidade**: Interface intuitiva, fluxos diretos
2. **Mobile-First**: Operações críticas devem ser 100% mobile
3. **Offline**: Não pode depender de conexão estável
4. **Treinamento**: Onboarding eficiente e documentação clara
5. **Suporte**: Atendimento rápido nos primeiros meses
6. **Feedback**: Iteração constante baseada em uso real
7. **Performance**: Aplicativo rápido e responsivo
8. **Dados Confiáveis**: Estoque sempre preciso

---

### 10.3 Próximos Passos

**Imediatos (Esta Semana):**
1. ✅ Validar requisitos com stakeholders
2. ✅ Definir escopo final do MVP
3. ✅ Escolher stack tecnológico
4. ✅ Montar time de desenvolvimento

**Curto Prazo (Próximo Mês):**
1. Setup de infraestrutura (repos, CI/CD, ambientes)
2. Design de banco de dados final
3. Wireframes de telas principais
4. Arquitetura detalhada
5. Iniciar Sprint 1

**Médio Prazo (3 Meses):**
1. MVP completo em produção
2. Pilot com grupo reduzido de usuários
3. Ajustes baseados em feedback
4. Rollout gradual para todos os usuários

---

### 10.4 Recursos Adicionais

**Inspirações de Mercado:**
- Sortly (https://www.sortly.com) - UX mobile excelente
- Asset Panda (https://www.assetpanda.com) - Flexibilidade
- EZOfficeInventory (https://ezo.io) - Funcionalidades completas
- Procore (https://www.procore.com) - Foco em construção

**Padrões e Documentação:**
- Material Design (Google) - UI patterns mobile
- Human Interface Guidelines (Apple) - iOS best practices
- ISO 9001 - Gestão de qualidade em estoque
- NRs (Normas Regulamentadoras) - Para EPIs

**Comunidades:**
- r/InventoryManagement (Reddit)
- APICS (Association for Supply Chain Management)
- IMAM (Instituto de Movimentação e Armazenagem de Materiais)

---

## 11. GLOSSÁRIO

**Almoxarifado:** Local físico de armazenamento de materiais e equipamentos.

**Almoxarife:** Profissional responsável pela gestão operacional do almoxarifado.

**Custódia:** Responsabilidade temporária sobre um item, com registro de quem está com o item.

**Divergência de Inventário:** Diferença entre quantidade física contada e quantidade no sistema.

**EPI:** Equipamento de Proteção Individual (capacete, luvas, etc.).

**FIFO:** First In, First Out - Primeiro que entra, primeiro que sai.

**Inventário Cíclico:** Contagem periódica de parte do estoque (por categoria, localização, etc.).

**Inventário Geral:** Contagem completa de todo o estoque.

**KPI:** Key Performance Indicator - Indicador-chave de desempenho.

**Lead Time:** Tempo entre solicitar e receber um item.

**Lote:** Conjunto de itens recebidos na mesma remessa, com mesmo fornecedor e data.

**MVP:** Minimum Viable Product - Produto Mínimo Viável.

**NF-e:** Nota Fiscal Eletrônica.

**PWA:** Progressive Web App - Aplicação web que funciona como app nativo.

**QR Code:** Quick Response Code - Código bidimensional para identificação rápida.

**RBAC:** Role-Based Access Control - Controle de acesso baseado em funções.

**Requisição:** Solicitação formal de itens do almoxarifado.

**ROI:** Return on Investment - Retorno sobre investimento.

**Separação:** Processo de separar fisicamente os itens de uma requisição aprovada.

**SKU:** Stock Keeping Unit - Unidade de manutenção de estoque.

**Transferência:** Movimentação de item entre duas localizações diferentes.

---

## APÊNDICE A - Checklist de Funcionalidades

### Prioridade ALTA (MVP)
- [ ] Cadastro de usuários e perfis
- [ ] Cadastro de itens
- [ ] Cadastro de localizações
- [ ] Entrada de itens
- [ ] Saída de itens
- [ ] Transferências entre locais
- [ ] Sistema de requisições
- [ ] Aprovações (2 níveis)
- [ ] Notificações push
- [ ] App mobile básico
- [ ] Scanner QR Code/Barcode
- [ ] Modo offline
- [ ] Busca e filtros
- [ ] Relatório de inventário atual
- [ ] Relatório de movimentações
- [ ] Histórico de item

### Prioridade MÉDIA (Fase 2)
- [ ] Custódia de itens
- [ ] Assinatura digital
- [ ] Inventário cíclico
- [ ] Contagem mobile
- [ ] Ajustes de inventário
- [ ] Ordens de manutenção
- [ ] Dashboard executivo
- [ ] Gráficos e KPIs
- [ ] Alertas automatizados
- [ ] Comentários e comunicação
- [ ] Anexos e documentos
- [ ] Templates de requisição
- [ ] Kits e conjuntos

### Prioridade BAIXA (Fase 3)
- [ ] Integração ERP
- [ ] Integração fornecedores
- [ ] Cotações automáticas
- [ ] Previsão de demanda
- [ ] Relatórios customizados
- [ ] RFID
- [ ] Realidade aumentada
- [ ] Comandos de voz
- [ ] Geofencing
- [ ] API pública
- [ ] Webhooks

---

## APÊNDICE B - Perguntas para Validação com Stakeholders

**Sobre Operação:**
1. Quantas movimentações diárias em média?
2. Quantos usuários simultâneos esperados?
3. Quantas obras/projetos simultâneos?
4. Qual a distância média entre almoxarifado e obras?
5. Qual a qualidade da internet nas obras? (para planejar offline)

**Sobre Aprovações:**
6. Quem aprova o quê? (matriz RACI)
7. Há limite de valor para aprovações?
8. Aprovações devem ser sequenciais ou paralelas?
9. Quanto tempo máximo para aprovar uma requisição?

**Sobre Itens:**
10. Que tipos de itens serão gerenciados? (ferramentas, EPIs, materiais, etc.)
11. Há itens controlados/críticos com regras especiais?
12. Há itens com validade/vencimento?
13. Há itens serializados (número único por unidade)?

**Sobre Integrações:**
14. Há sistema ERP atual? Qual?
15. Há sistema de RH? Precisa integrar?
16. Há necessidade de integração com fornecedores?
17. Há sistema de compras separado?

**Sobre Relatórios:**
18. Quais relatórios são críticos?
19. Com que frequência são gerados?
20. Quem consome esses relatórios?

---

**Documento preparado em:** 2025-11-11
**Versão:** 1.0
**Status:** Pronto para revisão e validação

---

*Este documento serve como base para o planejamento e desenvolvimento do sistema de almoxarifado. Todos os requisitos devem ser validados com stakeholders antes do início do desenvolvimento.*
