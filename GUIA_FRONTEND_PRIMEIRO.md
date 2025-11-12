# Guia: Desenvolver Frontend Primeiro (Sem Backend)

## 🎯 Por Que Começar pelo Frontend?

### Vantagens
- ✅ **Validar UX/UI rapidamente** - ver se funciona antes de gastar tempo no backend
- ✅ **Mostrar para stakeholders** - ter algo visual para apresentar
- ✅ **Testar fluxos** - validar se os fluxos fazem sentido
- ✅ **Iteração rápida** - mudar rapidamente sem mexer em banco de dados
- ✅ **Desenvolvimento paralelo** - frontend e backend podem ser feitos por times diferentes

### Como Funciona
1. Criar o app mobile com **dados falsos** (mock data)
2. Testar toda a interface e fluxos
3. Quando tudo estiver OK, conectar ao backend real

---

## 📱 Estratégia 1: Mock Data (Recomendado para Iniciar)

### Como Funciona
- Dados ficam dentro do código do app
- Simula todas as operações (criar, editar, deletar)
- Funciona 100% offline
- Depois é só trocar pelos dados reais da API

### Estrutura de Pastas
```
mobile-app/
├── lib/
│   ├── models/           # Modelos de dados
│   ├── screens/          # Telas
│   ├── widgets/          # Componentes reutilizáveis
│   ├── services/
│   │   ├── mock/         # 👈 Dados falsos aqui
│   │   │   ├── mock_items.dart
│   │   │   ├── mock_requisicoes.dart
│   │   │   ├── mock_usuarios.dart
│   │   │   └── mock_service.dart
│   │   └── api/          # API real (para depois)
│   │       └── api_service.dart
│   └── main.dart
```

---

## 💾 Exemplo 1: Mock de Itens

```dart
// lib/services/mock/mock_items.dart

class MockItems {
  static List<Map<String, dynamic>> items = [
    {
      'id': 'item-001',
      'codigo': 'FER-001',
      'nome': 'Furadeira Bosch GSB 13 RE',
      'categoria': 'Ferramentas Elétricas',
      'quantidade_total': 10,
      'unidade': 'unidade',
      'valor_unitario': 450.00,
      'foto_url': 'assets/images/furadeira.jpg',
      'qr_code': 'FER-001-QR',
      'localizacoes': [
        {
          'tipo': 'estoque',
          'nome': 'Estoque Principal',
          'quantidade': 3,
        },
        {
          'tipo': 'obra',
          'nome': 'Edifício Central',
          'quantidade': 5,
        },
        {
          'tipo': 'funcionario',
          'nome': 'João Silva',
          'funcao': 'Eletricista',
          'quantidade': 2,
        }
      ]
    },
    {
      'id': 'item-002',
      'codigo': 'ELE-023',
      'nome': 'Multímetro Fluke 87V',
      'categoria': 'Equipamentos Elétricos',
      'quantidade_total': 8,
      'unidade': 'unidade',
      'valor_unitario': 1200.00,
      'foto_url': 'assets/images/multimetro.jpg',
      'qr_code': 'ELE-023-QR',
      'localizacoes': [
        {
          'tipo': 'estoque',
          'nome': 'Estoque Principal',
          'quantidade': 5,
        },
        {
          'tipo': 'funcionario',
          'nome': 'João Silva',
          'funcao': 'Eletricista',
          'quantidade': 2,
          'vencido': true,
        },
        {
          'tipo': 'obra',
          'nome': 'Shopping Norte',
          'quantidade': 1,
        }
      ]
    },
    {
      'id': 'item-003',
      'codigo': 'ELE-045',
      'nome': 'Alicate Amperímetro Digital',
      'categoria': 'Equipamentos Elétricos',
      'quantidade_total': 15,
      'unidade': 'unidade',
      'valor_unitario': 350.00,
      'foto_url': 'assets/images/alicate.jpg',
      'qr_code': 'ELE-045-QR',
      'localizacoes': [
        {
          'tipo': 'estoque',
          'nome': 'Estoque Principal',
          'quantidade': 8,
        },
        {
          'tipo': 'obra',
          'nome': 'Residencial Sul',
          'quantidade': 7,
        }
      ]
    },
    // ... adicionar mais 897 itens ou gerar automaticamente
  ];

  // Buscar todos os itens
  static Future<List<Map<String, dynamic>>> getAll() async {
    // Simular delay de rede
    await Future.delayed(Duration(milliseconds: 500));
    return items;
  }

  // Buscar por ID
  static Future<Map<String, dynamic>?> getById(String id) async {
    await Future.delayed(Duration(milliseconds: 300));
    return items.firstWhere(
      (item) => item['id'] == id,
      orElse: () => {},
    );
  }

  // Buscar por código QR
  static Future<Map<String, dynamic>?> getByQrCode(String qrCode) async {
    await Future.delayed(Duration(milliseconds: 300));
    return items.firstWhere(
      (item) => item['qr_code'] == qrCode,
      orElse: () => {},
    );
  }

  // Buscar por texto
  static Future<List<Map<String, dynamic>>> search(String query) async {
    await Future.delayed(Duration(milliseconds: 300));

    if (query.isEmpty) return items;

    return items.where((item) {
      String nome = item['nome'].toString().toLowerCase();
      String codigo = item['codigo'].toString().toLowerCase();
      String categoria = item['categoria'].toString().toLowerCase();
      String q = query.toLowerCase();

      return nome.contains(q) || codigo.contains(q) || categoria.contains(q);
    }).toList();
  }

  // Adicionar item (simular)
  static Future<Map<String, dynamic>> add(Map<String, dynamic> item) async {
    await Future.delayed(Duration(milliseconds: 500));

    // Gerar ID
    item['id'] = 'item-${DateTime.now().millisecondsSinceEpoch}';

    // Adicionar à lista
    items.add(item);

    return item;
  }

  // Atualizar item
  static Future<bool> update(String id, Map<String, dynamic> data) async {
    await Future.delayed(Duration(milliseconds: 500));

    int index = items.indexWhere((item) => item['id'] == id);
    if (index != -1) {
      items[index] = {...items[index], ...data};
      return true;
    }
    return false;
  }

  // Deletar item
  static Future<bool> delete(String id) async {
    await Future.delayed(Duration(milliseconds: 500));

    return items.removeWhere((item) => item['id'] == id) > 0;
  }
}
```

---

## 📋 Exemplo 2: Mock de Requisições

```dart
// lib/services/mock/mock_requisicoes.dart

class MockRequisicoes {
  static List<Map<String, dynamic>> requisicoes = [
    {
      'id': 'req-1234',
      'numero': '#1234',
      'status': 'pendente_almoxarife',
      'obra': {
        'id': 'obra-001',
        'nome': 'Edifício Central',
      },
      'solicitante': {
        'id': 'user-001',
        'nome': 'Carlos Souza',
        'funcao': 'Encarregado',
      },
      'itens': [
        {
          'item_id': 'item-001',
          'nome': 'Furadeira Bosch GSB 13 RE',
          'quantidade': 2,
          'disponivel': 3,
        },
        {
          'item_id': 'item-002',
          'nome': 'Multímetro Fluke 87V',
          'quantidade': 1,
          'disponivel': 5,
        }
      ],
      'prioridade': 'normal',
      'data_necessaria': '2025-11-15',
      'observacoes': 'Instalação elétrica 2º andar',
      'criada_em': '2025-11-11T10:00:00',
    },
    {
      'id': 'req-1233',
      'numero': '#1233',
      'status': 'aprovada',
      'obra': {
        'id': 'obra-002',
        'nome': 'Shopping Norte',
      },
      'solicitante': {
        'id': 'user-002',
        'nome': 'Ana Paula',
        'funcao': 'Eletricista',
      },
      'itens': [
        {
          'item_id': 'item-003',
          'nome': 'Alicate Amperímetro Digital',
          'quantidade': 3,
          'disponivel': 8,
        }
      ],
      'prioridade': 'alta',
      'data_necessaria': '2025-11-12',
      'observacoes': 'Manutenção preventiva',
      'criada_em': '2025-11-10T15:30:00',
      'aprovada_almoxarife_em': '2025-11-10T16:00:00',
      'aprovada_gestor_em': '2025-11-10T17:00:00',
    },
    // ... mais requisições
  ];

  // Listar todas
  static Future<List<Map<String, dynamic>>> getAll() async {
    await Future.delayed(Duration(milliseconds: 500));
    return requisicoes;
  }

  // Filtrar por status
  static Future<List<Map<String, dynamic>>> getByStatus(String status) async {
    await Future.delayed(Duration(milliseconds: 300));
    return requisicoes.where((r) => r['status'] == status).toList();
  }

  // Criar requisição
  static Future<Map<String, dynamic>> create(Map<String, dynamic> data) async {
    await Future.delayed(Duration(milliseconds: 500));

    data['id'] = 'req-${DateTime.now().millisecondsSinceEpoch}';
    data['numero'] = '#${requisicoes.length + 1000}';
    data['status'] = 'pendente_almoxarife';
    data['criada_em'] = DateTime.now().toIso8601String();

    requisicoes.insert(0, data);

    return data;
  }

  // Aprovar
  static Future<bool> aprovar(String id, String tipo) async {
    await Future.delayed(Duration(milliseconds: 500));

    int index = requisicoes.indexWhere((r) => r['id'] == id);
    if (index != -1) {
      if (tipo == 'almoxarife') {
        requisicoes[index]['status'] = 'pendente_gestor';
        requisicoes[index]['aprovada_almoxarife_em'] =
          DateTime.now().toIso8601String();
      } else if (tipo == 'gestor') {
        requisicoes[index]['status'] = 'aprovada';
        requisicoes[index]['aprovada_gestor_em'] =
          DateTime.now().toIso8601String();
      }
      return true;
    }
    return false;
  }

  // Rejeitar
  static Future<bool> rejeitar(String id, String motivo) async {
    await Future.delayed(Duration(milliseconds: 500));

    int index = requisicoes.indexWhere((r) => r['id'] == id);
    if (index != -1) {
      requisicoes[index]['status'] = 'rejeitada';
      requisicoes[index]['motivo_rejeicao'] = motivo;
      requisicoes[index]['rejeitada_em'] = DateTime.now().toIso8601String();
      return true;
    }
    return false;
  }
}
```

---

## 👤 Exemplo 3: Mock de Usuários

```dart
// lib/services/mock/mock_usuarios.dart

class MockUsuarios {
  static Map<String, dynamic>? usuarioLogado;

  static List<Map<String, dynamic>> usuarios = [
    {
      'id': 'user-admin',
      'nome': 'Admin Sistema',
      'email': 'admin@almoxarifado.com',
      'senha': 'admin123',
      'perfil': 'administrador',
      'foto_url': 'assets/images/avatar-admin.jpg',
    },
    {
      'id': 'user-almox',
      'nome': 'Ana Silva',
      'email': 'ana@almoxarifado.com',
      'senha': 'ana123',
      'perfil': 'almoxarife',
      'foto_url': 'assets/images/avatar-ana.jpg',
    },
    {
      'id': 'user-gestor',
      'nome': 'Roberto Santos',
      'email': 'roberto@almoxarifado.com',
      'senha': 'roberto123',
      'perfil': 'gestor_obra',
      'foto_url': 'assets/images/avatar-roberto.jpg',
    },
    {
      'id': 'user-001',
      'nome': 'João Silva',
      'email': 'joao@almoxarifado.com',
      'senha': 'joao123',
      'perfil': 'colaborador',
      'funcao': 'Eletricista',
      'matricula': '12345',
      'telefone': '(11) 91234-5678',
      'foto_url': 'assets/images/avatar-joao.jpg',
    },
  ];

  // Login
  static Future<Map<String, dynamic>?> login(String email, String senha) async {
    await Future.delayed(Duration(seconds: 1));

    try {
      var user = usuarios.firstWhere(
        (u) => u['email'] == email && u['senha'] == senha,
      );

      usuarioLogado = user;

      // Retornar com token fake
      return {
        'user': user,
        'token': 'fake-jwt-token-${user['id']}',
      };
    } catch (e) {
      return null;
    }
  }

  // Logout
  static Future<void> logout() async {
    await Future.delayed(Duration(milliseconds: 300));
    usuarioLogado = null;
  }

  // Obter usuário logado
  static Map<String, dynamic>? getUsuarioLogado() {
    return usuarioLogado;
  }

  // Verificar se está logado
  static bool isLogado() {
    return usuarioLogado != null;
  }
}
```

---

## 🔧 Exemplo 4: Service Unificado (Fácil trocar depois)

```dart
// lib/services/mock/mock_service.dart

import 'mock_items.dart';
import 'mock_requisicoes.dart';
import 'mock_usuarios.dart';

class MockService {
  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  Future<Map<String, dynamic>?> login(String email, String senha) {
    return MockUsuarios.login(email, senha);
  }

  Future<void> logout() {
    return MockUsuarios.logout();
  }

  Map<String, dynamic>? getUsuarioLogado() {
    return MockUsuarios.getUsuarioLogado();
  }

  bool isLogado() {
    return MockUsuarios.isLogado();
  }

  // ============================================
  // ITENS
  // ============================================

  Future<List<Map<String, dynamic>>> getItens() {
    return MockItems.getAll();
  }

  Future<Map<String, dynamic>?> getItemById(String id) {
    return MockItems.getById(id);
  }

  Future<Map<String, dynamic>?> getItemByQrCode(String qrCode) {
    return MockItems.getByQrCode(qrCode);
  }

  Future<List<Map<String, dynamic>>> searchItens(String query) {
    return MockItems.search(query);
  }

  Future<Map<String, dynamic>> addItem(Map<String, dynamic> item) {
    return MockItems.add(item);
  }

  Future<bool> updateItem(String id, Map<String, dynamic> data) {
    return MockItems.update(id, data);
  }

  Future<bool> deleteItem(String id) {
    return MockItems.delete(id);
  }

  // ============================================
  // REQUISIÇÕES
  // ============================================

  Future<List<Map<String, dynamic>>> getRequisicoes() {
    return MockRequisicoes.getAll();
  }

  Future<List<Map<String, dynamic>>> getRequisicoesByStatus(String status) {
    return MockRequisicoes.getByStatus(status);
  }

  Future<Map<String, dynamic>> createRequisicao(Map<String, dynamic> data) {
    return MockRequisicoes.create(data);
  }

  Future<bool> aprovarRequisicao(String id, String tipo) {
    return MockRequisicoes.aprovar(id, tipo);
  }

  Future<bool> rejeitarRequisicao(String id, String motivo) {
    return MockRequisicoes.rejeitar(id, motivo);
  }
}
```

---

## 📱 Exemplo 5: Usando no App (Tela de Lista)

```dart
// lib/screens/items_list_screen.dart

import 'package:flutter/material.dart';
import '../services/mock/mock_service.dart';

class ItemsListScreen extends StatefulWidget {
  @override
  _ItemsListScreenState createState() => _ItemsListScreenState();
}

class _ItemsListScreenState extends State<ItemsListScreen> {
  final MockService _service = MockService();
  List<Map<String, dynamic>> items = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    setState(() => loading = true);

    try {
      final data = await _service.getItens();
      setState(() {
        items = data;
        loading = false;
      });
    } catch (e) {
      setState(() => loading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erro ao carregar itens')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: Text('Itens')),
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Itens (${items.length})'),
        actions: [
          IconButton(
            icon: Icon(Icons.qr_code_scanner),
            onPressed: () {
              // TODO: Abrir scanner QR
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadItems,
        child: ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            return ListTile(
              leading: CircleAvatar(
                backgroundImage: AssetImage(
                  item['foto_url'] ?? 'assets/images/placeholder.jpg'
                ),
              ),
              title: Text(item['nome']),
              subtitle: Text(
                '${item['codigo']} • ${item['quantidade_total']} un'
              ),
              trailing: Icon(Icons.chevron_right),
              onTap: () {
                Navigator.pushNamed(
                  context,
                  '/item-details',
                  arguments: item['id'],
                );
              },
            );
          },
        ),
      ),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.add),
        onPressed: () {
          Navigator.pushNamed(context, '/item-add');
        },
      ),
    );
  }
}
```

---

## 🔄 Quando Migrar para API Real

Depois que o frontend estiver pronto, é só **trocar o MockService por APIService**:

```dart
// Antes (com dados falsos)
final MockService _service = MockService();

// Depois (com API real)
final APIService _service = APIService();
```

E criar o APIService:

```dart
// lib/services/api/api_service.dart

import 'package:dio/dio.dart';

class APIService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.seudominio.com',
  ));

  // Mesmos métodos do MockService, mas chamando API real

  Future<List<Map<String, dynamic>>> getItens() async {
    final response = await _dio.get('/items');
    return List<Map<String, dynamic>>.from(response.data);
  }

  Future<Map<String, dynamic>?> getItemById(String id) async {
    final response = await _dio.get('/items/$id');
    return response.data;
  }

  // ... outros métodos
}
```

---

## 🎯 Próximos Passos

### 1. Criar Projeto Flutter
```bash
flutter create almoxarifado_app
cd almoxarifado_app
```

### 2. Adicionar Dependências
```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter
  dio: ^5.0.0              # Para API depois
  hive: ^2.2.3             # Banco local
  provider: ^6.0.5         # Gerenciamento de estado
  qr_code_scanner: ^1.0.1  # Scanner QR
```

### 3. Criar Estrutura de Pastas
```bash
mkdir -p lib/models
mkdir -p lib/screens
mkdir -p lib/widgets
mkdir -p lib/services/mock
mkdir -p lib/services/api
mkdir -p assets/images
```

### 4. Copiar os Mocks Acima
- Criar os arquivos mock_items.dart, mock_requisicoes.dart, etc
- Copiar o código de exemplo

### 5. Criar as Telas
- Começar pela tela de login
- Depois home/dashboard
- Lista de itens
- Detalhes do item
- etc

### 6. Testar Tudo
- Testar todos os fluxos com dados falsos
- Validar UX/UI
- Ajustar conforme necessário

### 7. Conectar ao Backend
- Quando backend estiver pronto
- Trocar MockService por APIService
- Testar integração

---

## ✅ Checklist de Desenvolvimento

### Fase 1: Setup (1 dia)
- [ ] Criar projeto Flutter
- [ ] Configurar dependências
- [ ] Criar estrutura de pastas
- [ ] Adicionar assets (imagens, fontes)

### Fase 2: Mocks (2 dias)
- [ ] Criar mock_items.dart
- [ ] Criar mock_requisicoes.dart
- [ ] Criar mock_usuarios.dart
- [ ] Criar mock_service.dart
- [ ] Testar todos os métodos

### Fase 3: Telas Básicas (1 semana)
- [ ] Tela de login
- [ ] Home/Dashboard
- [ ] Lista de itens
- [ ] Detalhes do item
- [ ] Busca

### Fase 4: Requisições (1 semana)
- [ ] Lista de requisições
- [ ] Nova requisição (3 etapas)
- [ ] Aprovar/Rejeitar
- [ ] Detalhes da requisição

### Fase 5: Funcionalidades Avançadas (1 semana)
- [ ] Scanner QR Code
- [ ] Movimentações
- [ ] Notificações
- [ ] Perfil do usuário

### Fase 6: Polimento (3-5 dias)
- [ ] Animações
- [ ] Loading states
- [ ] Error handling
- [ ] Testes com usuários

### Fase 7: Integração Backend (1 semana)
- [ ] Criar APIService
- [ ] Trocar mocks por API
- [ ] Testar integração
- [ ] Corrigir bugs

---

## 💡 Dicas Importantes

### 1. Use Providers para Estado
```dart
// Facilita trocar de Mock para API depois
class ItemsProvider extends ChangeNotifier {
  final service = MockService(); // ou APIService()

  Future<void> loadItems() async {
    items = await service.getItens();
    notifyListeners();
  }
}
```

### 2. Simule Delays de Rede
```dart
await Future.delayed(Duration(milliseconds: 500));
// Isso faz o app parecer mais real
```

### 3. Teste Casos de Erro
```dart
// Simule erros às vezes
if (Random().nextBool()) {
  throw Exception('Erro de rede simulado');
}
```

### 4. Use Assets Locais
- Coloque imagens fake na pasta assets/
- Não dependa de URLs externas

---

## 🚀 Quer que eu crie o projeto inicial agora?

Posso criar:
1. ✅ Estrutura de pastas completa
2. ✅ Todos os mocks funcionais
3. ✅ 3-5 telas principais funcionando
4. ✅ Navegação entre telas
5. ✅ Pronto para testar no celular

É só falar! 😊
