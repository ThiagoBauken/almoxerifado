# 📦 Sistema de Almoxarifado - Documentação Completa

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React Native](https://img.shields.io/badge/React_Native-recommended-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql)

**Sistema completo de gestão de almoxarifado com rastreamento offline-first e controle total de localização**

[📚 Documentação](#-documentação-completa) • [🚀 Funcionalidades](#-funcionalidades-principais) • [🎯 Começar](#-por-onde-começar) • [💻 Stack](#️-stack-tecnológico)

</div>

---

## 🎯 Visão Geral

Sistema completo de gestão de almoxarifado com foco em **controle de inventário**, **rastreamento em tempo real** de localização (estoque → obra → funcionário) e **gestão mobile offline-first**.

### 🌟 Destaques

- ✅ Controle de **~900 itens** em múltiplas localizações
- ✅ **Rastreamento completo**: sempre saiba onde está cada item
- ✅ **100% offline** - funciona sem internet e sincroniza depois
- ✅ **Gestão de múltiplas obras** simultaneamente
- ✅ **Custódia individual** com termo de responsabilidade digital
- ✅ **Aprovações mobile** em 2 níveis (Almoxarife + Gestor)
- ✅ **QR Code** para operações rápidas
- ✅ **7 perfis de usuário** com permissões granulares
- ✅ **Backend API REST** escalável e seguro
- ✅ **Dashboard** com estatísticas em tempo real

---

## 📚 Documentação Completa

### 🎯 Documentos Principais (Para Começar)

#### 1. [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md)
**Visão geral do projeto para decisores**
- Funcionalidades MVP prioritizadas
- ROI esperado: R$ 50-115k/ano de economia
- Payback: 12-18 meses
- Roadmap de implementação em 3 fases
- **👔 Recomendado para:** CEOs, Diretores, Investidores

#### 2. [REQUISITOS_SISTEMA_ALMOXARIFADO.md](REQUISITOS_SISTEMA_ALMOXARIFADO.md)
**Especificação técnica completa**
- Requisitos funcionais detalhados
- 7 perfis de usuário com matriz de permissões
- 6 fluxos de usuário passo-a-passo
- Estrutura de banco de dados (15+ tabelas)
- Considerações técnicas (arquitetura, segurança, performance)
- **👨‍💻 Recomendado para:** Product Managers, Desenvolvedores, Arquitetos

#### 3. [ANALISE_COMPARATIVA_MERCADO.md](ANALISE_COMPARATIVA_MERCADO.md)
**Pesquisa e análise competitiva**
- Comparação de 6+ sistemas existentes
- Gaps identificados no mercado
- Estratégia de precificação (US$ 30-80/usuário vs US$ 250-500 dos concorrentes)
- Análise SWOT completa
- **📊 Recomendado para:** Product Managers, Estratégia, Marketing

### 🔧 Documentos Técnicos Detalhados

#### 4. [SISTEMA_OFFLINE_SINCRONIZACAO.md](SISTEMA_OFFLINE_SINCRONIZACAO.md) ⭐ **NOVO**
**Arquitetura offline-first completa**
- Como funciona o sistema offline com SQLite
- Fluxo de sincronização automática
- Resolução de conflitos (Last Write Wins, validação, merge manual)
- 3 casos de uso práticos
- Stack tecnológico recomendado
- **👨‍💻 Recomendado para:** Desenvolvedores Mobile, Arquitetos

#### 5. [RASTREAMENTO_COMPLETO_ITENS.md](RASTREAMENTO_COMPLETO_ITENS.md) ⭐ **NOVO**
**Como rastrear onde está cada item**
- Hierarquia de localização (Estoque → Obra → Funcionário)
- 4 fluxos de movimentação detalhados
- 3 painéis de controle
- Busca e filtros avançados
- Histórico completo
- 3 casos de uso práticos
- **📍 Recomendado para:** Product Managers, UX Designers, Desenvolvedores

#### 6. [WIREFRAMES_APP_MOBILE.md](WIREFRAMES_APP_MOBILE.md) ⭐ **NOVO**
**Protótipos de todas as telas**
- 18 telas detalhadas do app mobile
- Design system (cores, ícones, tipografia)
- Fluxo de navegação
- Padrões de interação e gestos
- Estados visuais (loading, error, empty, offline)
- **🎨 Recomendado para:** UX/UI Designers, Product Managers

#### 7. [ESTADOS_CICLO_VIDA_ITENS.md](ESTADOS_CICLO_VIDA_ITENS.md) ⭐ **NOVO**
**Máquina de estados completa**
- 11 estados possíveis de um item
- Matriz de transições permitidas
- Regras de negócio por estado
- Implementação técnica (TypeScript/JavaScript)
- Relatórios e consultas SQL úteis
- **👨‍💻 Recomendado para:** Desenvolvedores Backend, Arquitetos

#### 8. [DIAGRAMAS_FLUXO.md](DIAGRAMAS_FLUXO.md)
**Visualizações e diagramas**
- 15 diagramas Mermaid
- Fluxos de requisição e aprovação
- Arquitetura de dados (ERD)
- Estrutura de permissões (RBAC)
- Sincronização offline
- **📊 Recomendado para:** Todos os perfis técnicos

---

## 🎯 Por Onde Começar?

### Se você é um **Gestor/Executivo:**
1. 📖 Leia o [RESUMO_EXECUTIVO.md](RESUMO_EXECUTIVO.md) **(15 minutos)**
2. 📊 Depois veja [ANALISE_COMPARATIVA_MERCADO.md](ANALISE_COMPARATIVA_MERCADO.md) para entender o mercado

### Se você é **Product Manager:**
1. 📋 Comece com [REQUISITOS_SISTEMA_ALMOXARIFADO.md](REQUISITOS_SISTEMA_ALMOXARIFADO.md)
2. 📍 Depois leia [RASTREAMENTO_COMPLETO_ITENS.md](RASTREAMENTO_COMPLETO_ITENS.md)
3. 🎨 Veja os wireframes em [WIREFRAMES_APP_MOBILE.md](WIREFRAMES_APP_MOBILE.md)

### Se você é **Desenvolvedor:**
1. 📋 Leia [REQUISITOS_SISTEMA_ALMOXARIFADO.md](REQUISITOS_SISTEMA_ALMOXARIFADO.md) (foco na parte técnica)
2. 💾 Estude [SISTEMA_OFFLINE_SINCRONIZACAO.md](SISTEMA_OFFLINE_SINCRONIZACAO.md)
3. 🔄 Revise [ESTADOS_CICLO_VIDA_ITENS.md](ESTADOS_CICLO_VIDA_ITENS.md)
4. 📊 Veja os diagramas em [DIAGRAMAS_FLUXO.md](DIAGRAMAS_FLUXO.md)

### Se você é **Designer:**
1. 🎨 Veja os wireframes em [WIREFRAMES_APP_MOBILE.md](WIREFRAMES_APP_MOBILE.md)
2. 📍 Entenda os fluxos em [RASTREAMENTO_COMPLETO_ITENS.md](RASTREAMENTO_COMPLETO_ITENS.md)
3. 📊 Revise os diagramas em [DIAGRAMAS_FLUXO.md](DIAGRAMAS_FLUXO.md)

---

## 🚀 Funcionalidades Principais

### 1. Controle de Inventário
- Cadastro de ~900 itens
- Categorização e organização
- QR Codes para rastreamento rápido
- Fotos e documentação

### 2. Rastreamento de Localização
**Sempre saiba onde está cada item:**
- 📦 **No estoque** (almoxarifado principal)
- 🏗️ **Em uma obra** específica
- 👷 **Com um funcionário** específico
- 🚚 **Em trânsito** entre locais

### 3. Gestão de Requisições
- Criação via mobile
- Aprovação em 2 níveis (Almoxarife + Gestor)
- Acompanhamento de status
- Histórico completo

### 4. Custódia Individual
- Termo de responsabilidade digital
- Assinatura no app
- Prazo de devolução
- Alertas automáticos

### 5. Modo Offline
- **100% funcional sem internet**
- Banco de dados local (SQLite)
- Sincronização automática ao reconectar
- Resolução inteligente de conflitos

### 6. Aprovações Mobile
- Aprovar/rejeitar requisições
- Confirmar recebimentos
- Assinar digitalmente
- Fotografar itens

---

## 📊 Números do Projeto

### Escopo
- **900+ itens** no inventário
- **12+ obras** simultâneas
- **45+ funcionários** ativos
- **200+ movimentações/mês**

### MVP (Estimativa)
- **Prazo:** 2-3 meses
- **Custo:** US$ 40-60k
- **Time:** 4-6 pessoas

### ROI Esperado
- **Economia anual:** R$ 50-115k
- **Payback:** 12-18 meses
- **Redução de perdas:** 5-10%
- **Tempo economizado:** 30-60 min/requisição

---

## 🚀 Funcionalidades (Técnicas)

### 📱 **App Mobile (Flutter)**

#### Gestão de Itens
- ✅ Listar todos os itens do almoxarifado
- ✅ Buscar por nome, código ou categoria
- ✅ Scanner QR Code integrado
- ✅ Visualizar detalhes completos
- ✅ Verificar localização exata (Container → Prateleira → Fileira → Caixa)
- ✅ Alertas de estoque baixo

#### Solicitações
- ✅ Criar solicitação de retirada
- ✅ Acompanhar status em tempo real
- ✅ Sistema de prioridades (baixa, normal, alta, urgente)
- ✅ Aprovar/rejeitar (gerentes)
- ✅ Confirmar entrega (operadores)
- ✅ Histórico completo

#### Modo Offline
- ✅ Funciona 100% sem internet
- ✅ Cache local com Hive
- ✅ Fila de sincronização
- ✅ Indicador de status de conexão
- ✅ Sincronização automática ao conectar

### 🖥️ **Backend API (Node.js)**

#### Autenticação & Autorização
- ✅ JWT Authentication
- ✅ 4 níveis de permissão (Admin, Manager, Operator, User)
- ✅ Senhas criptografadas (bcrypt)
- ✅ Endpoints protegidos

#### Gestão de Estoque
- ✅ CRUD completo de itens
- ✅ Categorização (Equipamentos, Ferramentas, Consumíveis)
- ✅ Localização hierárquica
- ✅ Geração automática de QR Code
- ✅ Controle de quantidade mínima
- ✅ Status e condição dos itens

#### Sistema de Solicitações
- ✅ Workflow completo de aprovação
- ✅ Notificações de mudança de status
- ✅ Rastreamento de responsáveis
- ✅ Histórico de ações

#### Rastreabilidade
- ✅ Log completo de movimentações
- ✅ Histórico de cada item
- ✅ Relatórios de entrada/saída
- ✅ Auditoria completa

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────┐
│                                                 │
│         📱 App Mobile (Flutter)                 │
│         - Offline First                         │
│         - Local Cache (Hive)                    │
│         - QR Scanner                            │
│                                                 │
└────────────────┬───────────────────────────────┘
                 │
                 │ REST API (JSON)
                 │ JWT Auth
                 │
┌────────────────▼───────────────────────────────┐
│                                                 │
│         🖥️  Backend API (Node.js)              │
│         - Express.js                            │
│         - JWT Authentication                    │
│         - Sequelize ORM                         │
│                                                 │
└────────────────┬───────────────────────────────┘
                 │
                 │ SQL Queries
                 │
┌────────────────▼───────────────────────────────┐
│                                                 │
│         🗄️  PostgreSQL Database                │
│         - Dados persistentes                    │
│         - Relacionamentos complexos             │
│         - Índices otimizados                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **Sequelize** - ORM
- **JWT** - Autenticação
- **Bcrypt** - Criptografia de senhas
- **QRCode** - Geração de QR Codes

### Mobile
- **Flutter** - Framework multiplataforma
- **Dart** - Linguagem de programação
- **Hive** - Database local NoSQL
- **Provider** - Gerenciamento de estado
- **Dio** - Cliente HTTP
- **QR Code Scanner** - Leitura de QR Codes

---

## 📥 Instalação

### Pré-requisitos

```bash
# Backend
✅ Node.js 18+
✅ PostgreSQL 14+
✅ npm ou yarn

# Mobile
✅ Flutter SDK 3.0+
✅ Android Studio
✅ Android SDK
```

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone [repositório]
cd stockmaster-system

# 2. Backend
cd backend-api
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run seed  # Criar banco e dados iniciais
npm run dev   # Iniciar servidor

# 3. Mobile
cd ../mobile-app
flutter pub get
flutter pub run build_runner build
# Editar lib/services/api_service.dart com URL da API
flutter build apk --release
```

📘 **Guia completo:** [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)

---

## 🎮 Como Usar

### 1️⃣ Fazer Login

Use as credenciais padrão após o seed:
```
Admin: admin@stockmaster.com / admin123
Gerente: gerente@stockmaster.com / gerente123
```

### 2️⃣ Visualizar Estoque

- Abra o app
- Navegue pela lista de itens
- Use a busca ou scanner QR Code
- Veja localização exata de cada item

### 3️⃣ Solicitar Retirada

1. Selecione o item desejado
2. Clique em "Solicitar Retirada"
3. Preencha quantidade e finalidade
4. Aguarde aprovação do gerente

### 4️⃣ Aprovar Solicitação (Gerente)

1. Acesse "Solicitações Pendentes"
2. Revise detalhes
3. Aprove ou rejeite com justificativa

### 5️⃣ Entregar Item (Operador)

1. Acesse solicitações aprovadas
2. Confirme a entrega
3. Sistema atualiza estoque automaticamente

---

## 📸 Screenshots

### App Mobile
<div align="center">

| Login | Home | Scanner QR |
|-------|------|------------|
| <img src="docs/screenshots/login.png" width="200"/> | <img src="docs/screenshots/home.png" width="200"/> | <img src="docs/screenshots/scanner.png" width="200"/> |

| Lista de Itens | Detalhes | Solicitações |
|----------------|----------|--------------|
| <img src="docs/screenshots/items.png" width="200"/> | <img src="docs/screenshots/details.png" width="200"/> | <img src="docs/screenshots/requests.png" width="200"/> |

</div>

---

## 📚 Documentação

### Estrutura do Banco de Dados

```sql
Users          → Usuários do sistema
Categories     → Categorias de itens
Locations      → Localizações físicas
Items          → Itens do almoxarifado
Requests       → Solicitações de retirada
Transfers      → Transferências entre usuários
Movements      → Histórico de movimentações
```

### Endpoints da API

Consulte [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) para lista completa.

**Base URL:** `http://localhost:3000/api`

#### Principais endpoints:
```
POST   /auth/login           → Login
GET    /items                → Listar itens
GET    /items/code/:code     → Buscar por QR Code
POST   /requests             → Criar solicitação
PUT    /requests/:id/approve → Aprovar solicitação
```

---

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Proteção contra SQL Injection (Sequelize ORM)
- ✅ Validação de dados em todas as rotas
- ✅ Middleware de autorização por roles
- ✅ CORS configurável
- ✅ Rate limiting (recomendado para produção)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

## 📝 Roadmap

### Versão 1.1
- [ ] Painel Web administrativo
- [ ] Exportação de relatórios em PDF/Excel
- [ ] Notificações push
- [ ] Suporte a múltiplos almoxarifados

### Versão 1.2
- [ ] Integração com leitor de código de barras
- [ ] App iOS
- [ ] Sistema de manutenção preventiva
- [ ] Dashboard analítico avançado

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

Desenvolvido com ❤️ para otimizar o gerenciamento de almoxarifados de alpinismo industrial.

---

## 📞 Suporte

Para dúvidas, problemas ou sugestões:

- 📧 Email: suporte@stockmaster.com
- 📖 Wiki: [docs.stockmaster.com](https://docs.stockmaster.com)
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/stockmaster/issues)

---

<div align="center">

**StockMaster v1.0.0** - Gerenciamento de Almoxarifado Simplificado

⭐ Se este projeto foi útil, considere dar uma estrela!

</div>
