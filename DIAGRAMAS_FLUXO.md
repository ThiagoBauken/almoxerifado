# Diagramas de Fluxo - Sistema de Almoxarifado

Este documento contém diagramas visuais dos principais fluxos do sistema usando Mermaid.

---

## 1. Fluxo de Requisição e Aprovação

```mermaid
graph TD
    A[Colaborador cria requisição] --> B{Sistema identifica aprovador}
    B --> C[Gestor de Obra Nível 1]
    C --> D{Decisão N1}
    D -->|Rejeitar| E[Requisição Rejeitada]
    D -->|Aprovar| F{Valor > Limite?}
    F -->|Sim| G[Encaminhar para Gerente N2]
    F -->|Não| H[Requisição Aprovada]
    G --> I{Decisão N2}
    I -->|Rejeitar| E
    I -->|Aprovar| H
    H --> J[Almoxarife recebe para separação]
    J --> K[Separa itens]
    K --> L{Itens disponíveis?}
    L -->|Não| M[Notifica divergência]
    L -->|Sim| N[Marca como pronto]
    N --> O[Colaborador retira]
    O --> P[Assina digitalmente]
    P --> Q[Atualiza estoque e custódia]
    E --> R[Notifica solicitante]
    M --> R
```

---

## 2. Arquitetura de Dados Simplificada

```mermaid
erDiagram
    USERS ||--o{ REQUISITIONS : creates
    USERS ||--o{ MOVEMENTS : executes
    USERS ||--o{ ITEM_CUSTODY : responsible
    USERS }o--|| ROLES : has
    USERS }o--o| LOCATIONS : "default location"

    ITEMS ||--o{ ITEM_STOCK : "stored in"
    ITEMS ||--o{ MOVEMENTS : involved
    ITEMS ||--o{ REQUISITION_ITEMS : requested
    ITEMS }o--|| CATEGORIES : belongs

    LOCATIONS ||--o{ ITEM_STOCK : contains
    LOCATIONS ||--o{ MOVEMENTS : "origin/destination"
    LOCATIONS ||--o{ REQUISITIONS : "destination"

    REQUISITIONS ||--o{ REQUISITION_ITEMS : contains
    REQUISITIONS ||--o{ MOVEMENTS : generates

    USERS {
        int id PK
        string username
        string email
        int role_id FK
        int location_id FK
    }

    ITEMS {
        int id PK
        string code
        string name
        int category_id FK
        float current_stock
        float min_stock
    }

    LOCATIONS {
        int id PK
        string code
        string name
        string type
        int responsible_id FK
    }

    REQUISITIONS {
        int id PK
        string req_number
        int requested_by FK
        int destination_id FK
        string status
    }

    MOVEMENTS {
        int id PK
        int item_id FK
        int from_location_id FK
        int to_location_id FK
        int user_id FK
        float quantity
    }
```

---

## 3. Fluxo de Devolução

```mermaid
sequenceDiagram
    participant C as Colaborador
    participant M as Mobile App
    participant S as Sistema
    participant A as Almoxarife

    C->>M: Acessa "Meus Itens"
    M->>S: Busca itens em custódia
    S-->>M: Lista de itens
    C->>M: Seleciona item e solicita devolução
    M->>S: Cria solicitação de devolução
    S->>S: Gera código DEV-XXXX
    S-->>A: Notificação de devolução pendente
    A->>M: Aceita e agenda recebimento
    S-->>C: Confirmação de agendamento

    Note over C,A: No dia agendado

    C->>A: Leva item ao almoxarifado
    A->>M: Escaneia QR Code do item
    M-->>A: Exibe histórico e condições originais
    A->>A: Inspeciona fisicamente
    A->>M: Registra condições atuais
    alt Item danificado
        A->>M: Registra dano e custo
        M->>S: Cria ordem de manutenção
    end
    A->>M: Confirma devolução
    M->>S: Atualiza estoque e custódia
    S-->>C: Confirmação de devolução
```

---

## 4. Estados de uma Requisição

```mermaid
stateDiagram-v2
    [*] --> Pendente: Criada
    Pendente --> Aprovada_N1: Gestor aprova
    Pendente --> Rejeitada: Gestor rejeita
    Aprovada_N1 --> Aprovada_N2: Gerente aprova (se valor alto)
    Aprovada_N1 --> Em_Separacao: Encaminhada (se valor baixo)
    Aprovada_N2 --> Rejeitada: Gerente rejeita
    Aprovada_N2 --> Em_Separacao: Aprovada final
    Em_Separacao --> Aguardando_Retirada: Separação concluída
    Em_Separacao --> Parcialmente_Atendida: Falta de estoque
    Aguardando_Retirada --> Entregue: Colaborador retira
    Entregue --> [*]
    Rejeitada --> [*]
    Parcialmente_Atendida --> Aguardando_Retirada: Recebeu restante
    Pendente --> Cancelada: Usuário cancela
    Aprovada_N1 --> Cancelada: Usuário cancela
    Cancelada --> [*]
```

---

## 5. Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend"
        WEB[Web App - React]
        MOBILE[Mobile App - React Native]
    end

    subgraph "Backend"
        API[API REST - Node.js/Express]
        WS[WebSocket Server]
        AUTH[Auth Service - JWT]
    end

    subgraph "Dados"
        PG[(PostgreSQL)]
        REDIS[(Redis Cache)]
        S3[(S3 Storage)]
    end

    subgraph "Serviços"
        NOTIF[Notification Service]
        QUEUE[Background Jobs]
        SYNC[Sync Service]
    end

    WEB --> API
    MOBILE --> API
    MOBILE --> SYNC
    API --> AUTH
    API --> PG
    API --> REDIS
    API --> S3
    API --> WS
    WS --> MOBILE
    WS --> WEB
    API --> NOTIF
    API --> QUEUE
    SYNC --> PG
```

---

## 6. Fluxo de Inventário Cíclico

```mermaid
graph TD
    A[Gerente planeja inventário] --> B[Define categorias/locais]
    B --> C[Atribui responsáveis]
    C --> D[Sistema gera lista de itens]
    D --> E[Bloqueia movimentações opcional]
    E --> F[Notifica contadores]

    F --> G[Contador 1: Mobile]
    G --> H[Escaneia item]
    H --> I{Item na lista?}
    I -->|Não| J[Item extra - registra]
    I -->|Sim| K[Registra quantidade]
    K --> L{Mais itens?}
    L -->|Sim| H
    L -->|Não| M[Finaliza contagem 1]

    M --> N[Contador 2: Contagem cega]
    N --> O[Conta mesmos itens]
    O --> P[Finaliza contagem 2]

    P --> Q{Contagens batem?}
    Q -->|Sim| R[Contagem confirmada]
    Q -->|Não| S[Marca para recontagem]

    R --> T[Gerente revisa]
    S --> T
    T --> U{Aprovar ajustes?}
    U -->|Não| V[Solicita nova contagem]
    U -->|Sim| W[Atualiza sistema]
    V --> G
    W --> X[Gera relatório]
    X --> Y[Libera movimentações]
    Y --> Z[Fecha inventário]
```

---

## 7. Estrutura de Permissões (RBAC)

```mermaid
graph LR
    subgraph Administrador
        A1[Todas Funcionalidades]
        A2[Configurações]
        A3[Gestão Usuários]
    end

    subgraph Gerente
        G1[Cadastro Itens]
        G2[Aprovações N2]
        G3[Ajustes Inventário]
        G4[Relatórios Completos]
    end

    subgraph Almoxarife
        AL1[Entrada/Saída]
        AL2[Movimentações]
        AL3[Contagem]
        AL4[Scanner]
    end

    subgraph Gestor_Obra
        GO1[Requisições]
        GO2[Aprovações N1]
        GO3[Itens da Obra]
        GO4[Atribuir Responsáveis]
    end

    subgraph Colaborador
        C1[Ver Catálogo]
        C2[Criar Requisição]
        C3[Confirmar Recebimento]
        C4[Solicitar Devolução]
    end

    Administrador -.herda.-> Gerente
    Gerente -.herda.-> Almoxarife
    Gestor_Obra --> GO1 & GO2 & GO3 & GO4
    Colaborador --> C1 & C2 & C3 & C4
```

---

## 8. Fluxo de Sincronização Offline

```mermaid
sequenceDiagram
    participant U as Usuário
    participant A as App Mobile
    participant L as Local Storage
    participant S as Servidor

    Note over U,S: MODO ONLINE
    U->>A: Realiza operação
    A->>S: Envia para servidor
    S-->>A: Confirmação
    A->>L: Atualiza cache local
    A-->>U: Sucesso

    Note over U,S: PERDE CONEXÃO

    U->>A: Realiza operação
    A->>L: Salva na fila local
    A-->>U: Pendente de sincronização
    U->>A: Realiza outra operação
    A->>L: Adiciona à fila

    Note over A,L: Queue Local: [Op1, Op2]

    Note over U,S: RECONECTA

    A->>A: Detecta conexão
    loop Para cada operação na fila
        A->>S: Envia operação
        alt Sucesso
            S-->>A: OK
            A->>L: Remove da fila
        else Erro
            S-->>A: Erro
            A->>L: Marca erro
            A-->>U: Notifica conflito
        end
    end
    A-->>U: Sincronização completa
```

---

## 9. Jornada do Usuário - Colaborador

```mermaid
journey
    title Jornada de Requisição de Ferramenta
    section Manhã
      Identifica necessidade: 3: Colaborador
      Abre app mobile: 5: Colaborador
      Busca ferramenta: 4: Colaborador
      Cria requisição: 5: Colaborador
    section Aguardando
      Notificação enviada: 5: Sistema
      Gestor aprova: 5: Gestor
      Almoxarife separa: 4: Almoxarife
      Recebe notificação: 5: Colaborador
    section Retirada
      Vai ao almoxarifado: 3: Colaborador
      Escaneia QR Code: 5: Colaborador
      Assina recebimento: 5: Colaborador
      Usa ferramenta: 5: Colaborador
    section Devolução
      Solicita devolução: 5: Colaborador
      Agenda horário: 4: Colaborador
      Devolve item: 5: Colaborador
      Confirma estado: 4: Almoxarife
```

---

## 10. Ciclo de Vida de um Item

```mermaid
stateDiagram-v2
    [*] --> Cadastrado: Criação
    Cadastrado --> Sem_Estoque: Estado inicial
    Sem_Estoque --> Disponível: Entrada de estoque
    Disponível --> Reservado: Requisição aprovada
    Reservado --> Em_Uso: Retirado
    Em_Uso --> Disponível: Devolvido OK
    Em_Uso --> Em_Manutenção: Devolvido com problema
    Em_Manutenção --> Disponível: Manutenção concluída
    Em_Manutenção --> Descartado: Sem conserto
    Disponível --> Em_Transferência: Transferência iniciada
    Em_Transferência --> Disponível: Chegou ao destino
    Disponível --> Sem_Estoque: Estoque zerado
    Descartado --> [*]

    note right of Disponível
        Item pode ser requisitado
    end note

    note right of Em_Uso
        Sob custódia de colaborador
    end note
```

---

## 11. Dashboard - Visão por Perfil

```mermaid
graph TB
    subgraph Dashboard_Admin
        DA1[KPIs Gerais]
        DA2[Usuários Ativos]
        DA3[Logs de Auditoria]
        DA4[Alertas do Sistema]
    end

    subgraph Dashboard_Gerente
        DG1[Valor Total Inventário]
        DG2[Requisições Pendentes N2]
        DG3[Itens Abaixo Estoque]
        DG4[Relatório Financeiro]
    end

    subgraph Dashboard_Almoxarife
        DAL1[Separações Pendentes]
        DAL2[Devoluções Agendadas]
        DAL3[Inventários em Andamento]
        DAL4[Alertas Estoque]
    end

    subgraph Dashboard_Gestor_Obra
        DGO1[Itens na Obra]
        DGO2[Requisições da Equipe]
        DGO3[Itens Atrasados]
        DGO4[Valor em Uso]
    end

    subgraph Dashboard_Colaborador
        DC1[Meus Itens]
        DC2[Minhas Requisições]
        DC3[Ações Pendentes]
        DC4[Histórico]
    end
```

---

## 12. Fluxo de Transferência Entre Obras

```mermaid
graph TD
    A[Gestor Obra A: Item excedente] --> B[Cria transferência]
    B --> C[Seleciona Obra B destino]
    C --> D[Sistema notifica Gestor B]
    D --> E{Gestor B aceita?}
    E -->|Não| F[Transferência cancelada]
    E -->|Sim| G[Status: Aprovada]
    G --> H[Logística coleta na Obra A]
    H --> I[Escaneia item: Status Em Trânsito]
    I --> J[Transporta]
    J --> K[Logística entrega na Obra B]
    K --> L[Escaneia item: Chegada]
    L --> M[Gestor B assina recebimento]
    M --> N[Sistema atualiza estoques]
    N --> O[Remove de Obra A]
    O --> P[Adiciona em Obra B]
    P --> Q[Transferência completa]
    F --> R[Notifica Gestor A]
```

---

## 13. Tipos de Notificações

```mermaid
mindmap
  root((Notificações))
    Requisições
      Nova requisição pendente
      Requisição aprovada
      Requisição rejeitada
      Item pronto para retirada
      Requisição cancelada
    Aprovações
      Aguardando sua aprovação
      Aprovação vencendo prazo
      Escalada automática
    Estoque
      Estoque abaixo mínimo
      Item esgotado
      Reposição necessária
      Inventário agendado
    Custódia
      Item atrasado devolução
      Lembrete devolução próxima
      Devolução agendada
      Item devolvido danificado
    Manutenção
      Manutenção vencida
      Item voltou manutenção
      Orçamento aprovado
    Sistema
      Sincronização completa
      Erro de sincronização
      Atualização disponível
      Backup concluído
```

---

## 14. Fluxo de Onboarding de Novo Usuário

```mermaid
graph TD
    A[Admin cria usuário] --> B[Sistema gera credenciais]
    B --> C[Envia email boas-vindas]
    C --> D[Usuário acessa pela 1ª vez]
    D --> E[Solicita troca de senha]
    E --> F[Define nova senha]
    F --> G{Tipo de usuário?}

    G -->|Almoxarife| H1[Tutorial Mobile]
    G -->|Gestor| H2[Tutorial Aprovações]
    G -->|Colaborador| H3[Tutorial Requisições]

    H1 --> I1[Como escanear QR]
    I1 --> I2[Como registrar entrada]
    I2 --> I3[Como separar requisição]

    H2 --> J1[Como aprovar no mobile]
    J1 --> J2[Como ver itens da obra]
    J2 --> J3[Como transferir itens]

    H3 --> K1[Como buscar item]
    K1 --> K2[Como criar requisição]
    K2 --> K3[Como confirmar recebimento]

    I3 --> L[Tutorial completo]
    J3 --> L
    K3 --> L
    L --> M[Oferece tour guiado]
    M --> N{Aceita tour?}
    N -->|Sim| O[Demonstração interativa]
    N -->|Não| P[Acessa sistema]
    O --> P
    P --> Q[Usuário ativo]
```

---

## 15. Integração com Sistema ERP (Futuro)

```mermaid
sequenceDiagram
    participant A as Almoxarifado
    participant API as API Sistema
    participant INT as Integration Service
    participant ERP as ERP Externo

    Note over A,ERP: Entrada de Material com NF

    A->>API: Registra entrada + NF
    API->>INT: Evento: Nova Entrada
    INT->>INT: Transforma dados
    INT->>ERP: Cria lançamento contábil
    ERP-->>INT: Confirmação + ID
    INT->>API: Atualiza referência ERP
    API-->>A: Entrada confirmada

    Note over A,ERP: Requisição Aprovada

    API->>INT: Evento: Requisição aprovada
    INT->>ERP: Movimenta centro custo
    ERP-->>INT: OK

    Note over A,ERP: Sincronização de Fornecedores

    ERP->>INT: Webhook: Novo fornecedor
    INT->>API: Cria/atualiza fornecedor
    API-->>INT: Sincronizado
```

---

## Legenda

- **Retângulos:** Processos/Ações
- **Losangos:** Decisões
- **Cilindros:** Bancos de dados
- **Nuvens:** Serviços externos
- **Setas sólidas:** Fluxo principal
- **Setas tracejadas:** Fluxo alternativo/notificações

---

## Como Visualizar

Estes diagramas estão em formato **Mermaid** e podem ser visualizados em:

1. **GitHub/GitLab:** Renderizam automaticamente em arquivos .md
2. **VSCode:** Extensão "Markdown Preview Mermaid Support"
3. **Online:** https://mermaid.live/
4. **Notion, Confluence:** Suporte nativo
5. **Documentação:** Docusaurus, MkDocs, etc.

---

**Documento criado em:** 2025-11-11
**Versão:** 1.0

*Para entender os fluxos em detalhes textuais, consultar REQUISITOS_SISTEMA_ALMOXARIFADO.md*
