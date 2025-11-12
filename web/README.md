# 🌐 Almoxarifado Web Dashboard

Dashboard web de administração para o sistema de almoxarifado.

## 🚀 Funcionalidades

- ✅ Dashboard com estatísticas e gráficos
- ✅ Gestão de Itens (CRUD completo)
- ✅ Gestão de Usuários
- ✅ Gestão de Obras
- ✅ Gestão de Categorias
- ✅ Visualização de Transferências
- ✅ Relatórios e filtros
- ✅ Responsivo (desktop first)

## 🛠 Tecnologias

- React 18 + Vite
- TailwindCSS para styling
- React Router para navegação
- Axios para API calls
- Recharts para gráficos
- React Table para tabelas

## 📁 Estrutura

```
web/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # App principal
    ├── index.css             # Estilos globais
    ├── api/
    │   └── axios.js          # Configuração API
    ├── components/
    │   ├── Layout.jsx        # Layout principal
    │   ├── Sidebar.jsx       # Menu lateral
    │   ├── Header.jsx        # Header
    │   └── StatsCard.jsx     # Card de estatística
    └── pages/
        ├── Dashboard.jsx     # Dashboard principal
        ├── Items.jsx         # Lista de itens
        ├── Users.jsx         # Gestão de usuários
        ├── Obras.jsx         # Gestão de obras
        ├── Categories.jsx    # Categorias
        └── Transfers.jsx     # Transferências
```

## 🔧 Como Rodar

### 1. Instalar Dependências

```bash
cd web
npm install
```

### 2. Configurar API

Edite `src/api/axios.js`:
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

### 3. Iniciar Desenvolvimento

```bash
npm run dev
```

Abre em: http://localhost:5173

### 4. Build para Produção

```bash
npm run build
# Arquivos em /dist
```

## 📊 Páginas

### 1. Dashboard (/)

**Estatísticas:**
- Total de itens
- Itens disponíveis
- Itens em uso
- Itens em manutenção

**Gráficos:**
- Itens por categoria (barra)
- Status dos itens (pizza)
- Transferências por mês (linha)

**Últimas movimentações:**
- Lista das 10 últimas transferências

### 2. Itens (/items)

**Funcionalidades:**
- Listar todos os itens (tabela)
- Buscar por nome/lacre
- Filtrar por categoria, estado
- Criar novo item
- Editar item
- Ver detalhes + histórico
- Deletar item

**Campos do formulário:**
- Lacre (único)
- Nome
- Categoria
- Estado
- Foto (URL)
- Valor unitário
- Data de aquisição
- Descrição

### 3. Usuários (/users)

**Funcionalidades:**
- Listar usuários
- Buscar por nome/email
- Filtrar por perfil
- Criar novo usuário
- Editar usuário
- Ativar/desativar

**Perfis:**
- Funcionário
- Almoxarife
- Gestor
- Admin

### 4. Obras (/obras)

**Funcionalidades:**
- Listar obras
- Criar nova obra
- Editar obra
- Mudar status (ativa/pausada/concluída)
- Ver itens da obra
- Ver funcionários alocados

### 5. Categorias (/categories)

**Funcionalidades:**
- Listar categorias
- Criar nova categoria
- Editar categoria (nome, ícone)
- Ver quantos itens por categoria
- Deletar (se não tiver itens)

### 6. Transferências (/transfers)

**Funcionalidades:**
- Listar transferências
- Filtrar por:
  - Status (pendente/concluída/cancelada)
  - Data (intervalo)
  - Usuário remetente
  - Usuário destinatário
  - Item
- Ver detalhes completos
- Timeline de cada transferência
- Exportar relatório (CSV)

## 🎨 Design System

### Cores

```css
/* Tailwind Classes */
primary:     bg-blue-600    #2563EB
success:     bg-green-500   #10B981
warning:     bg-yellow-500  #F59E0B
error:       bg-red-500     #EF4444
gray-bg:     bg-gray-100    #F3F4F6
```

### Componentes

**StatsCard:**
```jsx
<StatsCard
  title="Total de Itens"
  value="900"
  icon="📦"
  color="blue"
  trend="+12%"
/>
```

**Table:**
```jsx
<Table
  data={items}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**Modal:**
```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Novo Item"
>
  <ItemForm onSubmit={handleSubmit} />
</Modal>
```

## 🔐 Autenticação

O dashboard usa JWT para autenticação.

**Fluxo:**
1. Login em `/login`
2. Token armazenado em localStorage
3. Token enviado em todas as requisições (header Authorization)
4. Se token inválido/expirado → redirect para login

## 📱 Responsividade

- **Desktop**: Layout com sidebar
- **Tablet**: Sidebar colapsável
- **Mobile**: Menu hambúrguer (mas web é focado em desktop)

## 🚀 Deploy

### Vercel

```bash
npm install -g vercel
vercel --prod
```

### Netlify

```bash
npm run build
# Upload da pasta /dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📊 Gráficos (Recharts)

### Exemplo: Itens por Categoria

```jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const data = [
  { categoria: 'EPIs', quantidade: 150 },
  { categoria: 'Ferramentas', quantidade: 200 },
  // ...
];

<BarChart data={data} width={600} height={300}>
  <XAxis dataKey="categoria" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="quantidade" fill="#2563EB" />
</BarChart>
```

## 🧪 Desenvolvimento

### Estrutura de Componente

```jsx
// src/pages/Items.jsx
import { useState, useEffect } from 'react';
import { getItems } from '../api';

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const result = await getItems();
    if (result.success) {
      setItems(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Itens</h1>
      {/* Content */}
    </div>
  );
}
```

## ⚠️ Troubleshooting

### CORS Error

Certifique-se que o backend permite requisições do frontend:

```javascript
// backend/server.js
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));
```

### Build Error

Limpe cache e reinstale:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 TODO (Melhorias Futuras)

- [ ] Dark mode
- [ ] Exportar relatórios PDF
- [ ] Notificações em tempo real (WebSocket)
- [ ] Upload de fotos dos itens
- [ ] Gráficos mais avançados
- [ ] Filtros salvos
- [ ] Permissões granulares por página
- [ ] Audit log (quem fez o quê)
- [ ] Multi-idioma (i18n)

## 📄 Licença

MIT

---

**🎉 Dashboard Web Completo e Funcional!**

Para rodar:
```bash
npm install && npm run dev
```
