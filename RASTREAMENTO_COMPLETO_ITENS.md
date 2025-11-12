# Rastreamento Completo de Itens

## 🎯 Visão Geral

Este documento detalha como o sistema rastreia **exatamente onde está cada item** em tempo real, permitindo que você saiba instantaneamente se um item está:

- 📦 **No estoque** (almoxarifado)
- 🏗️ **Em uma obra** específica
- 👷 **Com um funcionário** específico
- 🚚 **Em trânsito** entre locais

---

## 📍 Estados de Localização de um Item

### Hierarquia de Localização

```
ITEM
│
├─ ESTOQUE (Almoxarifado Principal)
│  ├─ Setor A (Ferramentas)
│  ├─ Setor B (Elétrica)
│  └─ Setor C (Materiais)
│
├─ OBRA (Canteiro/Projeto)
│  ├─ Obra 1: Edifício Central
│  │  ├─ Em uso geral (disponível na obra)
│  │  └─ Com funcionário específico
│  │
│  ├─ Obra 2: Shopping Norte
│  └─ Obra 3: Residencial Sul
│
├─ FUNCIONÁRIO (Custódia Individual)
│  ├─ João Silva (Eletricista)
│  ├─ Maria Santos (Encarregada)
│  └─ Carlos Souza (Auxiliar)
│
└─ EM TRÂNSITO (Movimentação)
   ├─ Estoque → Obra
   ├─ Obra → Estoque (Devolução)
   ├─ Obra A → Obra B (Transferência)
   └─ Funcionário → Outro Funcionário
```

---

## 🔍 Como Funciona o Rastreamento

### 1. Modelo de Dados

Cada item pode ter **múltiplas localizações simultâneas** com quantidades diferentes:

```javascript
// Exemplo: Furadeira Bosch GSB 13 RE
{
  id: "item-001",
  codigo: "FER-001",
  nome: "Furadeira Bosch GSB 13 RE",
  quantidade_total: 10, // Total no sistema

  // LOCALIZAÇÕES ATUAIS
  localizacoes: [
    {
      tipo: "estoque",
      estoque_id: "almox-principal",
      setor: "Ferramentas - Setor A",
      quantidade: 3,
      updated_at: "2025-11-10 14:30"
    },
    {
      tipo: "obra",
      obra_id: "obra-edificio-central",
      obra_nome: "Edifício Central",
      quantidade: 5,
      status: "disponivel", // disponível na obra, não está com ninguém
      updated_at: "2025-11-10 10:15"
    },
    {
      tipo: "funcionario",
      funcionario_id: "func-123",
      funcionario_nome: "João Silva",
      funcionario_funcao: "Eletricista",
      obra_id: "obra-shopping-norte", // Funcionário está nesta obra
      obra_nome: "Shopping Norte",
      quantidade: 2,
      data_retirada: "2025-11-09 08:00",
      previsao_devolucao: "2025-11-15",
      updated_at: "2025-11-09 08:05"
    }
  ]
}
```

### 2. Regras de Negócio

```javascript
// ✅ SEMPRE VÁLIDO:
quantidade_total === soma(localizacoes.quantidade)

// Exemplo:
10 (total) = 3 (estoque) + 5 (obra) + 2 (funcionário) ✓
```

---

## 📱 Telas de Rastreamento

### Tela 1: Visão Geral do Item

```
┌────────────────────────────────────────┐
│ ← Furadeira Bosch GSB 13 RE     [QR]  │
├────────────────────────────────────────┤
│                                        │
│  📷 [Foto da Furadeira]                │
│                                        │
│  Código: FER-001                       │
│  Categoria: Ferramentas Elétricas      │
│  Quantidade Total: 10 unidades         │
│  Valor: R$ 450,00 cada                 │
│                                        │
├────────────────────────────────────────┤
│  📍 ONDE ESTÃO AS 10 UNIDADES?         │
├────────────────────────────────────────┤
│                                        │
│  📦 Estoque Principal                  │
│      3 unidades                        │
│      Setor: Ferramentas - A            │
│      [Ver Detalhes] →                  │
│                                        │
│  🏗️ Obra: Edifício Central            │
│      5 unidades (disponíveis)          │
│      Atualizado: há 4h                 │
│      [Ver Detalhes] →                  │
│                                        │
│  👷 João Silva (Eletricista)           │
│      2 unidades                        │
│      Obra: Shopping Norte              │
│      Desde: 09/11 às 08:00            │
│      Previsão devolução: 15/11         │
│      [Cobrar Devolução] [Ver Mais] →   │
│                                        │
├────────────────────────────────────────┤
│  📊 HISTÓRICO DE MOVIMENTAÇÕES         │
│      [Ver Histórico Completo] →        │
└────────────────────────────────────────┘
```

### Tela 2: Detalhes de Localização (Obra)

```
┌────────────────────────────────────────┐
│ ← Furadeira em: Edifício Central       │
├────────────────────────────────────────┤
│                                        │
│  🏗️ OBRA: Edifício Central            │
│                                        │
│  📍 Endereço:                          │
│  Av. Paulista, 1000 - São Paulo/SP     │
│                                        │
│  👤 Responsável:                       │
│  Maria Santos (Encarregada)            │
│  Tel: (11) 98765-4321                  │
│                                        │
├────────────────────────────────────────┤
│  📦 ITENS NESTA OBRA                   │
├────────────────────────────────────────┤
│                                        │
│  Furadeira Bosch GSB 13 RE             │
│  5 unidades disponíveis                │
│                                        │
│  Status: ✅ Disponível para uso        │
│                                        │
│  Chegou em: 10/11/2025 às 10:15       │
│  Via: Requisição #1234                 │
│                                        │
├────────────────────────────────────────┤
│  🔄 AÇÕES DISPONÍVEIS                  │
├────────────────────────────────────────┤
│                                        │
│  [Alocar para Funcionário]             │
│  [Transferir para Outra Obra]          │
│  [Devolver ao Estoque]                 │
│  [Registrar Manutenção]                │
│  [Ver Histórico Nesta Obra]            │
│                                        │
└────────────────────────────────────────┘
```

### Tela 3: Item com Funcionário

```
┌────────────────────────────────────────┐
│ ← Furadeira com: João Silva            │
├────────────────────────────────────────┤
│                                        │
│  👷 FUNCIONÁRIO                         │
│                                        │
│  [Foto] João Silva                     │
│         Eletricista                    │
│         Matrícula: 12345               │
│         Tel: (11) 91234-5678           │
│                                        │
│  📍 Localização Atual:                 │
│  🏗️ Obra: Shopping Norte               │
│                                        │
├────────────────────────────────────────┤
│  📦 ITENS SOB CUSTÓDIA                 │
├────────────────────────────────────────┤
│                                        │
│  ✅ Furadeira Bosch GSB 13 RE          │
│     2 unidades                         │
│     Desde: 09/11 às 08:00             │
│     Há 2 dias                          │
│                                        │
│     ⚠️ Devolução prevista para: 15/11  │
│     (em 4 dias)                        │
│                                        │
│     ✍️ Termo de Responsabilidade:      │
│     [Ver Assinatura Digital]           │
│                                        │
│     📄 Observações:                    │
│     "Instalação elétrica 2º andar"     │
│                                        │
├────────────────────────────────────────┤
│  🔔 AÇÕES                              │
├────────────────────────────────────────┤
│                                        │
│  [Registrar Devolução]                 │
│  [Estender Prazo]                      │
│  [Enviar Lembrete de Devolução]        │
│  [Reportar Problema]                   │
│                                        │
├────────────────────────────────────────┤
│  OUTROS ITENS COM JOÃO SILVA           │
├────────────────────────────────────────┤
│                                        │
│  • Alicate Amperímetro (1)             │
│  • Multímetro Digital (1)              │
│  • Escada 6m (1)                       │
│                                        │
│  [Ver Todos os 12 Itens] →             │
│                                        │
└────────────────────────────────────────┘
```

---

## 🔄 Fluxos de Movimentação

### Fluxo 1: Estoque → Obra

```
┌─────────────┐
│  REQUISIÇÃO │
│  Solicitada │
└──────┬──────┘
       │
       ▼
┌──────────────┐      ┌──────────────┐
│  Aprovação   │ ──→  │  Aprovação   │
│  Almoxarife  │      │  Gestor Obra │
└──────┬───────┘      └──────┬───────┘
       │                     │
       ▼                     ▼
┌─────────────────────────────────┐
│  SEPARAÇÃO NO ESTOQUE           │
│  - Almoxarife separa itens      │
│  - Escaneia QR codes            │
│  - Confirma quantidades         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ITEM EM TRÂNSITO               │
│  Status: "Saiu do estoque"      │
│  Destino: Obra Edifício Central │
│  Responsável transporte: Pedro  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  CHEGADA NA OBRA                │
│  - Encarregado confirma         │
│  - Escaneia QR codes            │
│  - Assina recebimento digital   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ✅ ITEM NA OBRA                 │
│  Status: "Disponível na obra"   │
│  Localização atualizada         │
└─────────────────────────────────┘
```

**Rastreamento em cada etapa:**

| Etapa | Status no Sistema | Onde está? |
|-------|-------------------|------------|
| 1 | `requisitado` | Estoque (reservado) |
| 2 | `aprovado` | Estoque (separado) |
| 3 | `em_transito` | Em trânsito p/ obra |
| 4 | `entregue` | Obra (disponível) |

### Fluxo 2: Obra → Funcionário

```
OBRA: Edifício Central
5 Furadeiras disponíveis

       │
       ▼
┌─────────────────────────────────┐
│  ALOCAÇÃO PARA FUNCIONÁRIO      │
│                                 │
│  Quem?: João Silva              │
│  Quantidade?: 2 unidades        │
│  Prazo?: 5 dias                 │
│  Motivo?: Instalação elétrica   │
│                                 │
│  ✍️ Funcionário assina no app   │
│  (assinatura digital + foto)    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ✅ ITEM COM FUNCIONÁRIO         │
│                                 │
│  Local: Obra Edifício Central   │
│  Custódia: João Silva           │
│  Quantidade: 2                  │
│                                 │
│  Estoque da obra atualizado:    │
│  5 → 3 disponíveis              │
└─────────────────────────────────┘
```

**No sistema:**

```javascript
// Antes
{
  tipo: "obra",
  obra_id: "obra-edificio-central",
  quantidade: 5,
  status: "disponivel"
}

// Depois
[
  {
    tipo: "obra",
    obra_id: "obra-edificio-central",
    quantidade: 3, // Reduziu
    status: "disponivel"
  },
  {
    tipo: "funcionario",
    funcionario_id: "joao-silva",
    obra_id: "obra-edificio-central", // Continua na mesma obra
    quantidade: 2,
    termo_responsabilidade: {
      assinatura_digital: "base64...",
      data: "2025-11-10 14:30",
      testemunha: "Maria Santos"
    }
  }
]
```

### Fluxo 3: Devolução Funcionário → Obra

```
┌─────────────────────────────────┐
│  FUNCIONÁRIO DEVOLVE            │
│                                 │
│  João Silva seleciona no app:   │
│  "Devolver Furadeira (2 un)"    │
│                                 │
│  Estado dos itens:              │
│  ⚪ Bom estado                   │
│  ⚪ Precisa manutenção           │
│  ⚪ Danificado                   │
│                                 │
│  📷 Foto dos itens (opcional)   │
│  📝 Observações                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ENCARREGADO CONFIRMA           │
│                                 │
│  Maria Santos recebe e          │
│  verifica as 2 furadeiras       │
│                                 │
│  ✅ Confirma bom estado         │
│  ✍️ Assina recebimento          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ✅ DEVOLUÇÃO CONCLUÍDA          │
│                                 │
│  Furadeiras voltam ao estoque   │
│  da obra (disponíveis)          │
│                                 │
│  João Silva liberado            │
│  Termo de responsabilidade      │
│  arquivado com sucesso          │
└─────────────────────────────────┘
```

### Fluxo 4: Transferência Entre Obras

```
OBRA A                              OBRA B
Edifício Central                    Shopping Norte
3 furadeiras disponíveis            2 furadeiras disponíveis

       │
       ▼
┌─────────────────────────────────┐
│  SOLICITAÇÃO DE TRANSFERÊNCIA   │
│                                 │
│  De: Edifício Central           │
│  Para: Shopping Norte           │
│  Item: Furadeira Bosch (2 un)   │
│  Solicitante: Carlos (Obra B)   │
│  Aprovador: Maria (Obra A)      │
└──────┬──────────────────────────┘
       │
       ▼
┌──────────────┐
│  APROVAÇÃO   │
│  Maria (A)   │
│  aprova      │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────┐
│  SAÍDA DA OBRA A                │
│  - Maria confirma saída         │
│  - Escaneia itens               │
│  3 → 1 disponível               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  EM TRÂNSITO                    │
│  Status: "Transferência"        │
│  De: Obra A → Obra B            │
│  Responsável: Motorista Pedro   │
│  🚚 Rastreável em tempo real    │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  CHEGADA NA OBRA B              │
│  - Carlos confirma recebimento  │
│  - Escaneia itens               │
│  - Assina digital               │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  ✅ TRANSFERÊNCIA CONCLUÍDA      │
│                                 │
│  Obra A: 3 → 1 disponível       │
│  Obra B: 2 → 4 disponíveis      │
│                                 │
│  Histórico atualizado em ambas  │
└─────────────────────────────────┘
```

---

## 📊 Painéis de Controle

### Painel 1: Visão Geral (Dashboard)

```
┌────────────────────────────────────────────────────────┐
│  PAINEL DE CONTROLE - ALMOXARIFADO                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📊 RESUMO GERAL                                       │
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   📦 900    │  │   🏗️ 12     │  │   👷 45     │   │
│  │   Itens     │  │   Obras     │  │   Funcioná  │   │
│  │   Cadastr.  │  │   Ativas    │  │   rios      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  📍 DISTRIBUIÇÃO DE ITENS                       │  │
│  │                                                 │  │
│  │  📦 Estoque Principal: 3.450 itens (45%)       │  │
│  │  🏗️ Em Obras: 3.120 itens (41%)               │  │
│  │  👷 Com Funcionários: 980 itens (13%)          │  │
│  │  🚚 Em Trânsito: 50 itens (1%)                 │  │
│  │                                                 │  │
│  │  [Gráfico de Pizza]                            │  │
│  └─────────────────────────────────────────────────┘  │
│                                                        │
│  ⚠️ ALERTAS                                            │
│                                                        │
│  🔴 15 itens com prazo de devolução vencido           │
│  🟡 23 itens próximos do prazo (< 2 dias)             │
│  🟠 8 itens abaixo do estoque mínimo                  │
│                                                        │
│  [Ver Todos os Alertas] →                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Painel 2: Por Obra

```
┌────────────────────────────────────────────────────────┐
│  🏗️ OBRAS ATIVAS                                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔍 Buscar obra...                            [+Nova]  │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📍 Edifício Central                                   │
│  Av. Paulista, 1000 - São Paulo/SP                     │
│  👤 Encarregada: Maria Santos                          │
│                                                        │
│  📦 450 itens nesta obra                               │
│  👷 28 funcionários ativos                             │
│  ⚠️ 5 itens com devolução pendente                     │
│                                                        │
│  [Ver Detalhes] [Ver Itens] [Ver Requisições]         │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📍 Shopping Norte                                     │
│  Rua das Flores, 500 - São Paulo/SP                    │
│  👤 Encarregado: Carlos Souza                          │
│                                                        │
│  📦 320 itens nesta obra                               │
│  👷 18 funcionários ativos                             │
│  ✅ Todos itens regularizados                          │
│                                                        │
│  [Ver Detalhes] [Ver Itens] [Ver Requisições]         │
│                                                        │
├────────────────────────────────────────────────────────┤
│  ... + 10 obras                                        │
└────────────────────────────────────────────────────────┘
```

### Painel 3: Por Funcionário

```
┌────────────────────────────────────────────────────────┐
│  👷 FUNCIONÁRIOS COM ITENS                              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🔍 Buscar funcionário...                              │
│                                                        │
│  Filtros:                                              │
│  [Todos] [Com itens vencidos] [Por obra]              │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 João Silva - Eletricista                           │
│  Matrícula: 12345                                      │
│  📍 Obra: Shopping Norte                               │
│                                                        │
│  📦 12 itens sob custódia                              │
│  ⚠️ 2 itens com prazo vencido                          │
│                                                        │
│  Itens principais:                                     │
│  • Furadeira Bosch (2) - Vence em 4 dias              │
│  • Multímetro (1) - ⚠️ Vencido há 2 dias              │
│  • Alicate (3) - ⚠️ Vencido há 5 dias                 │
│  ... +9 itens                                          │
│                                                        │
│  [Ver Detalhes] [Cobrar Devolução] [Contatar]         │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  👤 Maria Santos - Encarregada                         │
│  Matrícula: 12346                                      │
│  📍 Obra: Edifício Central                             │
│                                                        │
│  📦 8 itens sob custódia                               │
│  ✅ Todos regularizados                                │
│                                                        │
│  [Ver Detalhes]                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🔎 Busca e Filtros Avançados

### Busca Universal

```
┌────────────────────────────────────────────────────────┐
│  🔍 Buscar item, funcionário, obra...                  │
│  ┌────────────────────────────────────────────────┐   │
│  │ furadeira bosch                         [🎤] [📷]│   │
│  └────────────────────────────────────────────────┘   │
│                                                        │
│  RESULTADOS (3)                                        │
│                                                        │
│  📦 ITENS (1)                                          │
│  • Furadeira Bosch GSB 13 RE                           │
│    10 unidades - 3 localizações                        │
│    [Ver Localizações] →                                │
│                                                        │
│  👷 FUNCIONÁRIOS (2)                                    │
│  • João Silva - tem 2 furadeiras Bosch                 │
│    Obra: Shopping Norte                                │
│  • Pedro Costa - tem 1 furadeira Bosch                 │
│    Obra: Residencial Sul                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Filtros Avançados

```
┌────────────────────────────────────────────────────────┐
│  FILTRAR ITENS                                         │
│                                                        │
│  Localização:                                          │
│  ☑️ Estoque  ☑️ Obras  ☑️ Funcionários  ☐ Trânsito    │
│                                                        │
│  Obra específica:                                      │
│  [Selecionar obra...        ▼]                         │
│                                                        │
│  Categoria:                                            │
│  [Todas as categorias       ▼]                         │
│                                                        │
│  Status:                                               │
│  ☑️ Disponível  ☑️ Em uso  ☐ Manutenção  ☐ Vencido    │
│                                                        │
│  Prazo de devolução:                                   │
│  ☐ Hoje  ☐ Esta semana  ☐ Vencido                     │
│                                                        │
│  [Limpar Filtros]                   [Aplicar Filtros]  │
└────────────────────────────────────────────────────────┘
```

---

## 📜 Histórico Completo

Cada item mantém um **histórico completo** de todas as movimentações:

```
┌────────────────────────────────────────────────────────┐
│  HISTÓRICO: Furadeira Bosch GSB 13 RE                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📅 10/11/2025 14:30                                   │
│  🔄 ALOCAÇÃO PARA FUNCIONÁRIO                          │
│  De: Obra Edifício Central (disponível)               │
│  Para: João Silva (Eletricista)                        │
│  Quantidade: 2 unidades                                │
│  Por: Maria Santos (Encarregada)                       │
│  Prazo: 15/11/2025                                     │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📅 10/11/2025 10:15                                   │
│  📥 ENTRADA NA OBRA                                    │
│  De: Almoxarifado Principal                            │
│  Para: Obra Edifício Central                           │
│  Quantidade: 5 unidades                                │
│  Recebido por: Maria Santos                            │
│  Requisição: #1234                                     │
│  ✍️ [Ver Assinatura Digital]                           │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📅 10/11/2025 08:00                                   │
│  ✅ APROVAÇÃO DE REQUISIÇÃO                            │
│  Requisição: #1234                                     │
│  Aprovada por: Roberto (Gestor Obra)                   │
│  Observação: "Urgente para instalação elétrica"       │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📅 10/11/2025 07:45                                   │
│  ✅ APROVAÇÃO DE REQUISIÇÃO                            │
│  Requisição: #1234                                     │
│  Aprovada por: Ana (Almoxarife)                        │
│  Separado: Setor A - Prateleira 3                      │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  📅 09/11/2025 16:20                                   │
│  📝 REQUISIÇÃO CRIADA                                  │
│  Requisição: #1234                                     │
│  Solicitante: Carlos (Encarregado)                     │
│  Obra: Edifício Central                                │
│  Quantidade: 5 unidades                                │
│  Status: Pendente aprovação                            │
│                                                        │
├────────────────────────────────────────────────────────┤
│  ... mais 45 registros históricos                      │
│  [Carregar Mais] [Exportar Histórico]                  │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Casos de Uso Práticos

### Caso 1: "Onde está a furadeira X?"

**Pergunta do gestor:**
> "Preciso saber onde estão TODAS as furadeiras Bosch modelo GSB 13 RE"

**Resposta do sistema em 2 toques:**

1. Buscar "Furadeira Bosch GSB 13 RE"
2. Clicar em "Ver Localizações"

**Resultado:**
```
📦 TOTAL: 10 unidades

📍 LOCALIZAÇÕES:

✅ 3 unidades → Estoque Principal
   Setor: Ferramentas - Prateleira A-3
   Disponíveis para requisição

✅ 5 unidades → Obra Edifício Central
   Status: Disponíveis na obra
   Responsável: Maria Santos
   Tel: (11) 98765-4321

✅ 2 unidades → João Silva (Eletricista)
   Obra: Shopping Norte
   Desde: 09/11 | Devolução: 15/11
   Tel: (11) 91234-5678
```

### Caso 2: "O que João Silva tem?"

**Pergunta:**
> "Quero saber TODOS os itens que estão com o João Silva"

**Fluxo:**

1. Buscar "João Silva" ou acessar lista de funcionários
2. Ver perfil de João Silva

**Resultado:**
```
👤 JOÃO SILVA - Eletricista
📍 Obra: Shopping Norte
📦 12 itens sob custódia

ITENS:
✅ Furadeira Bosch GSB 13 RE (2)
   Devolução: 15/11 - em 4 dias

⚠️ Multímetro Digital Fluke (1)
   Devolução: 08/11 - VENCIDO há 2 dias

⚠️ Alicate Amperímetro (3)
   Devolução: 05/11 - VENCIDO há 5 dias

✅ Escada Fibra 6m (1)
   Devolução: 20/11 - em 9 dias

... +8 itens

[Cobrar Devoluções Vencidas]
[Contatar João Silva]
```

### Caso 3: "O que tem na Obra X?"

**Pergunta:**
> "Preciso de um relatório completo do que está na Obra Edifício Central"

**Resultado:**
```
🏗️ OBRA: EDIFÍCIO CENTRAL
Av. Paulista, 1000 - São Paulo/SP
👤 Encarregada: Maria Santos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 INVENTÁRIO DA OBRA: 450 itens

POR CATEGORIA:
• Ferramentas Elétricas: 85 itens
• Ferramentas Manuais: 120 itens
• Equipamentos de Segurança: 95 itens
• Materiais Elétricos: 150 itens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 STATUS:
✅ Disponíveis na obra: 320 itens
👷 Com funcionários: 130 itens
   • João Silva: 12 itens
   • Pedro Costa: 8 itens
   • Ana Paula: 15 itens
   ... +25 funcionários

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ALERTAS:
🔴 5 itens com devolução vencida
🟡 12 itens próximos do prazo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Exportar Relatório PDF]
[Ver Itens Detalhados]
[Solicitar Transferência]
[Devolver ao Estoque]
```

---

## 🔔 Notificações e Alertas

### Alertas Automáticos

O sistema envia notificações automáticas em situações importantes:

#### 1. Prazo de Devolução

```
🔔 LEMBRETE

João Silva,

Você tem 2 furadeiras Bosch que
devem ser devolvidas amanhã (15/11).

Por favor, devolva na sala da
encarregada Maria Santos.

[Registrar Devolução Agora]
[Solicitar Extensão de Prazo]
```

#### 2. Devolução Vencida

```
⚠️ DEVOLUÇÃO VENCIDA

João Silva está com 3 alicates
desde 05/11 (há 5 dias).

Prazo de devolução: 08/11

[Enviar Lembrete]
[Contatar Funcionário]
[Ver Detalhes]
```

#### 3. Item Requisitado Disponível

```
✅ ITEM DISPONÍVEL

O multímetro Fluke que você
requisitou está disponível!

Retire no almoxarifado com Ana
(Setor B - Prateleira 5).

[Confirmar Retirada]
[Ver Requisição #1245]
```

---

## 📊 Relatórios

### Relatório 1: Itens por Localização

```
RELATÓRIO: DISTRIBUIÇÃO DE ITENS
Período: 01/11/2025 a 10/11/2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 ESTOQUE PRINCIPAL: 3.450 itens (45%)

Top 5 Categorias:
1. Materiais Elétricos: 1.200 itens
2. Ferramentas Manuais: 850 itens
3. Equipamentos Segurança: 600 itens
4. Ferramentas Elétricas: 450 itens
5. Materiais Hidráulicos: 350 itens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏗️ EM OBRAS: 3.120 itens (41%)

Por Obra:
1. Edifício Central: 450 itens (14%)
2. Shopping Norte: 320 itens (10%)
3. Residencial Sul: 280 itens (9%)
4. Outras 9 obras: 2.070 itens (68%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👷 COM FUNCIONÁRIOS: 980 itens (13%)

Top 10 Funcionários:
1. João Silva: 12 itens
2. Pedro Costa: 11 itens
3. Ana Paula: 10 itens
... +42 funcionários

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚚 EM TRÂNSITO: 50 itens (1%)

• Estoque → Obras: 35 itens
• Entre Obras: 15 itens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Exportar PDF] [Exportar Excel]
```

### Relatório 2: Movimentações do Período

```
RELATÓRIO: MOVIMENTAÇÕES
Período: 01/11/2025 a 10/11/2025

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMO:
• Total de movimentações: 234
• Saídas do estoque: 156
• Entradas no estoque: 45
• Transferências entre obras: 18
• Alocações para funcionários: 89
• Devoluções: 67

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📤 PRINCIPAIS SAÍDAS:

1. Furadeira Bosch GSB 13 RE
   45 saídas | 12 devoluções
   Saldo: -33 unidades no estoque

2. Alicate Amperímetro
   32 saídas | 28 devoluções
   Saldo: -4 unidades no estoque

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 PRINCIPAIS ENTRADAS:

1. Capacete de Segurança
   50 entradas (compra)

2. Luvas PVC
   100 pares (compra)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Exportar Detalhado] [Ver Gráficos]
```

---

## 🎯 Resumo dos Benefícios

### Para Gestores
- ✅ **Visibilidade total** de onde está cada item
- ✅ **Rastreamento em tempo real**
- ✅ **Relatórios automáticos**
- ✅ **Alertas de devoluções**
- ✅ **Controle de responsabilidade**

### Para Almoxarifes
- ✅ **Localização rápida** de qualquer item
- ✅ **Histórico completo** de movimentações
- ✅ **Aprovações digitais**
- ✅ **Menos trabalho manual**

### Para Funcionários
- ✅ **Ver itens sob sua custódia**
- ✅ **Lembretes automáticos**
- ✅ **Devolução digital** (sem papel)
- ✅ **Histórico pessoal** acessível

---

**Documentação criada em:** 2025-11-11
**Versão:** 1.0
