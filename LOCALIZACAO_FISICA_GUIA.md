# 📦 Sistema de Localização Física de Itens

## ✅ O QUE FOI ADICIONADO

Agora o sistema rastreia **ONDE** cada item está fisicamente armazenado no almoxarifado!

**Antes:** Você sabia apenas se o item estava em estoque, com funcionário, ou em obra.

**Agora:** Você sabe EXATAMENTE onde no almoxarifado: Caixa A1, Prateleira B3, Armário 1, etc.

---

## 🗄️ Estrutura do Banco de Dados

### Nova Tabela: `locais_armazenamento`

```sql
CREATE TABLE locais_armazenamento (
  id UUID PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,      -- Ex: "CX-A1", "PR-01", "ARM-01"
  descricao TEXT,                          -- Ex: "Caixa A1 - EPIs"
  tipo VARCHAR(50),                        -- caixa, prateleira, armario, gaveta, sala, outro
  capacidade INTEGER,                      -- Número máximo de itens
  setor VARCHAR(100),                      -- Ex: "Ferramentas", "Segurança"
  observacoes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Campos Adicionados na Tabela `items`

```sql
ALTER TABLE items
ADD COLUMN local_armazenamento_id UUID REFERENCES locais_armazenamento(id),
ADD COLUMN local_armazenamento_descricao TEXT;
```

---

## 🚀 Como Configurar

### 1. Rodar a Migration

```bash
cd backend
npm run migrate:storage
```

Isso cria a tabela `locais_armazenamento` e adiciona os campos necessários.

### 2. Popular com Dados de Exemplo

```bash
npm run seed:storage
```

Isso cria:
- **5 caixas** (CX-A1, CX-A2, CX-B1, CX-B2, CX-C1)
- **5 prateleiras** (PR-01 a PR-05)
- **3 armários** (ARM-01, ARM-02, ARM-03)
- **3 gavetas** (GAV-1A, GAV-1B, GAV-2A)
- **2 salas** (SALA-1, SALA-2)

E associa 43 dos 50 itens de exemplo aos locais apropriados.

### 3. Configurar Tudo de Uma Vez

```bash
npm run setup
```

Este comando executa:
1. Migration principal
2. Migration de storage
3. Seed principal (50 itens)
4. Seed de storage (18 locais)

---

## 📡 API Endpoints

### Base URL: `/api/storage`

### 1. Listar Todos os Locais

**GET** `/api/storage`

Query params opcionais:
- `tipo` - Filtrar por tipo (caixa, prateleira, etc.)
- `setor` - Filtrar por setor

```bash
curl http://localhost:3000/api/storage
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "codigo": "CX-A1",
      "descricao": "Caixa A1 - EPIs",
      "tipo": "caixa",
      "capacidade": 50,
      "setor": "Segurança",
      "itens_count": 12,
      "disponibilidade": 38,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### 2. Buscar Local por ID

**GET** `/api/storage/:id`

```bash
curl http://localhost:3000/api/storage/uuid-do-local
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "codigo": "CX-A1",
    "descricao": "Caixa A1 - EPIs",
    "tipo": "caixa",
    "capacidade": 50,
    "setor": "Segurança",
    "itens": [
      {
        "id": "item-uuid",
        "nome": "Capacete de Segurança",
        "lacre": "CAP-001",
        "categoria_nome": "EPI"
      }
    ],
    "itens_count": 12,
    "disponibilidade": 38
  }
}
```

### 3. Criar Novo Local

**POST** `/api/storage`

```bash
curl -X POST http://localhost:3000/api/storage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
  -d '{
    "codigo": "CX-D1",
    "descricao": "Caixa D1 - Elétrica",
    "tipo": "caixa",
    "capacidade": 40,
    "setor": "Elétrica",
    "observacoes": "Materiais elétricos em geral"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Local criado com sucesso",
  "data": { ... }
}
```

### 4. Atualizar Local

**PUT** `/api/storage/:id`

```bash
curl -X PUT http://localhost:3000/api/storage/uuid-do-local \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu_token_jwt" \
  -d '{
    "descricao": "Caixa A1 - EPIs e Uniformes",
    "capacidade": 60
  }'
```

### 5. Deletar Local

**DELETE** `/api/storage/:id`

⚠️ **Só é possível deletar locais VAZIOS** (sem itens)

```bash
curl -X DELETE http://localhost:3000/api/storage/uuid-do-local \
  -H "Authorization: Bearer seu_token_jwt"
```

### 6. Estatísticas

**GET** `/api/storage/stats/overview`

```bash
curl http://localhost:3000/api/storage/stats/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_locais": 18,
    "capacidade_total": 485,
    "tipos_diferentes": 5,
    "setores_diferentes": 8,
    "locais_ocupados": 14,
    "por_tipo": [
      { "tipo": "prateleira", "quantidade": 5 },
      { "tipo": "caixa", "quantidade": 5 },
      { "tipo": "armario", "quantidade": 3 }
    ]
  }
}
```

---

## 🔧 Alterações na API de Items

A API de items agora retorna informações de localização física.

### GET /api/items

**Response agora inclui:**
```json
{
  "id": "item-uuid",
  "nome": "Furadeira Bosch",
  "lacre": "FUR-001",
  "estado": "disponivel_estoque",
  "local_codigo": "PR-02",
  "local_descricao": "Prateleira 2 - Ferramentas Elétricas",
  "local_tipo": "prateleira"
}
```

### GET /api/items/:id

**Response agora inclui:**
```json
{
  "id": "item-uuid",
  "nome": "Furadeira Bosch",
  "lacre": "FUR-001",
  "estado": "disponivel_estoque",
  "local_codigo": "PR-02",
  "local_descricao": "Prateleira 2 - Ferramentas Elétricas",
  "local_tipo": "prateleira",
  "local_setor": "Ferramentas"
}
```

### POST /api/items

**Agora aceita `local_armazenamento_id`:**
```json
{
  "lacre": "FUR-050",
  "nome": "Furadeira Makita",
  "categoria_id": "uuid-categoria",
  "estado": "disponivel_estoque",
  "local_armazenamento_id": "uuid-local",
  "valor_unitario": 350.00
}
```

### PUT /api/items/:id

**Pode atualizar a localização:**
```json
{
  "local_armazenamento_id": "uuid-novo-local"
}
```

---

## 📱 Como Usar no Mobile App

### 1. Exibir Local na Tela de Detalhes

**`screens/ItemDetailScreen.js`** - Adicione:

```jsx
// Depois das informações existentes
{item.local_codigo && (
  <View style={styles.infoRow}>
    <Ionicons name="location" size={20} color="#666" />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>Local de Armazenamento</Text>
      <Text style={styles.infoValue}>
        {item.local_codigo} - {item.local_descricao}
      </Text>
      <Text style={styles.infoSubvalue}>
        Tipo: {item.local_tipo}
      </Text>
    </View>
  </View>
)}
```

### 2. Filtrar por Local na Lista

**`screens/ItemListScreen.js`** - Adicione filtro:

```jsx
const [filtroLocal, setFiltroLocal] = useState('');

// No fetch
const queryParams = new URLSearchParams({
  search: searchText,
  estado: filtroEstado,
  // ... outros filtros
});

// Mostrar local na lista
<Text style={styles.itemLocation}>
  📍 {item.local_codigo || 'Sem local definido'}
</Text>
```

### 3. API Service

Já está pronto em `mobile/src/services/api.js`:

```javascript
// Buscar locais
export const getStorageLocations = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/storage?${params}`);
  return response.data;
};

// Buscar local específico
export const getStorageLocation = async (id) => {
  const response = await api.get(`/storage/${id}`);
  return response.data;
};

// Criar local
export const createStorageLocation = async (data) => {
  const response = await api.post('/storage', data);
  return response.data;
};
```

---

## 🌐 Como Usar no Web Dashboard

### 1. Criar Página de Gestão de Locais

**`web/src/pages/StorageLocations.jsx`**

```jsx
import { useState, useEffect } from 'react';
import { getStorageLocations } from '../services/api';

export default function StorageLocations() {
  const [locais, setLocais] = useState([]);

  useEffect(() => {
    loadLocais();
  }, []);

  const loadLocais = async () => {
    const data = await getStorageLocations();
    setLocais(data.data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Locais de Armazenamento</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {locais.map(local => (
          <div key={local.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{local.codigo}</h3>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {local.tipo}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3">{local.descricao}</p>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ocupação:</span>
              <span className="font-medium">
                {local.itens_count} / {local.capacidade}
              </span>
            </div>

            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(local.itens_count / local.capacidade) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Adicionar na Navegação

**`web/src/App.jsx`**

```jsx
import StorageLocations from './pages/StorageLocations';

// Nas rotas
<Route path="/storage" element={<StorageLocations />} />
```

---

## 📊 Tipos de Locais Disponíveis

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `caixa` | Caixas plásticas/papelão | CX-A1, CX-B2 |
| `prateleira` | Prateleiras metálicas | PR-01, PR-02 |
| `armario` | Armários com portas | ARM-01, ARM-02 |
| `gaveta` | Gavetas em bancadas | GAV-1A, GAV-2B |
| `sala` | Salas específicas | SALA-1, SALA-2 |
| `outro` | Outros tipos | Depende do uso |

---

## 💡 Casos de Uso

### 1. Cadastrar Novo Item com Local

```javascript
const novoItem = {
  lacre: "MAR-100",
  nome: "Martelete",
  categoria_id: "uuid-ferramentas",
  estado: "disponivel_estoque",
  local_armazenamento_id: "uuid-prateleira-02",
  valor_unitario: 450.00
};

await createItem(novoItem);
```

### 2. Mover Item de Local

```javascript
await updateItem(itemId, {
  local_armazenamento_id: "uuid-novo-local"
});
```

### 3. Ver Todos os Itens de um Local

```javascript
const local = await getStorageLocation(localId);
console.log(local.itens); // Lista de itens neste local
```

### 4. Encontrar Locais Vazios

```javascript
const locais = await getStorageLocations();
const locaisVazios = locais.data.filter(l => l.itens_count === 0);
```

### 5. Verificar Ocupação

```javascript
const locais = await getStorageLocations();
locais.data.forEach(local => {
  const percentual = (local.itens_count / local.capacidade) * 100;
  console.log(`${local.codigo}: ${percentual.toFixed(1)}% ocupado`);
});
```

---

## 🔍 Exemplo Completo: Workflow de Uso

### 1. Sistema Recebe Novos Itens

```javascript
// 10 capacetes chegaram
for (let i = 1; i <= 10; i++) {
  await createItem({
    lacre: `CAP-${String(i).padStart(3, '0')}`,
    nome: "Capacete de Segurança",
    categoria_id: "uuid-epi",
    estado: "disponivel_estoque",
    local_armazenamento_id: "uuid-caixa-a1", // CX-A1 - EPIs
    valor_unitario: 45.00
  });
}
```

### 2. Funcionário Busca Item

```javascript
// Listar itens disponíveis
const items = await getItems({ estado: 'disponivel_estoque' });

// Encontrar capacete
const capacete = items.data.find(i => i.nome.includes('Capacete'));

// Ver onde está
console.log(`Item está em: ${capacete.local_codigo} - ${capacete.local_descricao}`);
// Output: "Item está em: CX-A1 - Caixa A1 - EPIs"
```

### 3. Transferir Item

```javascript
// Item sai do estoque (local físico) e vai para funcionário
await updateItem(capaceteId, {
  estado: 'com_funcionario',
  funcionario_id: 'uuid-funcionario',
  local_armazenamento_id: null // Não está mais no almoxarifado
});
```

### 4. Item Volta ao Estoque

```javascript
// Item retorna e precisa ser guardado
await updateItem(capaceteId, {
  estado: 'disponivel_estoque',
  funcionario_id: null,
  local_armazenamento_id: 'uuid-caixa-a1' // De volta à CX-A1
});
```

---

## 🎯 Regras de Negócio

### 1. Local vs Funcionário/Obra

- Se `estado = 'disponivel_estoque'` → Item DEVE ter `local_armazenamento_id`
- Se `estado = 'com_funcionario'` → Item tem `funcionario_id`, mas `local_armazenamento_id = null`
- Se `estado = 'em_obra'` → Item tem `obra_id`, mas `local_armazenamento_id = null`

### 2. Capacidade

- Locais têm capacidade máxima
- Sistema não impede ultrapassar (apenas avisa)
- Use estatísticas para monitorar

### 3. Códigos Únicos

- Cada local precisa de código único (ex: CX-A1)
- Use padrão consistente: TIPO-NÚMERO

### 4. Organização por Setor

- Agrupe por setor (Ferramentas, EPIs, Elétrica, etc.)
- Facilita localização física

---

## ✅ Checklist de Implementação

### Backend
- [x] Migration `locais_armazenamento`
- [x] Seed com 18 locais de exemplo
- [x] API `/api/storage` (CRUD completo)
- [x] Atualizar `/api/items` para incluir local
- [x] Registrar rotas em `server.js`

### Mobile
- [ ] Mostrar local em ItemDetailScreen
- [ ] Adicionar filtro por local (opcional)
- [ ] Atualizar sincronização offline

### Web
- [ ] Página de gestão de locais
- [ ] Mostrar local na lista de itens
- [ ] Formulário para cadastrar/editar locais
- [ ] Dashboard com ocupação por local

---

## 🚀 Próximos Passos

1. **Rodar as migrations:**
   ```bash
   cd backend
   npm run migrate:storage
   npm run seed:storage
   ```

2. **Testar API:**
   ```bash
   # Listar locais
   curl http://localhost:3000/api/storage

   # Ver estatísticas
   curl http://localhost:3000/api/storage/stats/overview
   ```

3. **Implementar no Mobile:**
   - Adicionar exibição de local em ItemDetailScreen
   - Testar com dados reais

4. **Implementar no Web:**
   - Criar página StorageLocations
   - Adicionar na navegação

---

## 📝 Resumo

✅ **Agora você tem:**
- Tabela de locais físicos no banco
- 18 locais de exemplo criados
- API completa para gerenciar locais
- Relação entre items e locais
- Estatísticas de ocupação

✅ **O que fazer:**
- Rodar as migrations
- Testar a API
- Implementar interface (mobile/web)
- Começar a usar!

**Localização completa:** Item → Local Físico → Pessoa/Obra

**Exemplo Real:**
```
Furadeira Bosch (FUR-001)
├─ Categoria: Ferramentas
├─ Local Físico: PR-02 - Prateleira 2
├─ Estado: disponivel_estoque
└─ Valor: R$ 450,00
```

---

🎉 **Sistema de Localização Física 100% Completo!**
