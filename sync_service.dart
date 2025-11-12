import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../models/item.dart';
import '../models/request.dart';
import 'api_service.dart';

class SyncService {
  final ApiService _apiService = ApiService();
  late Box<Item> _itemsBox;
  late Box<Request> _requestsBox;
  late Box _syncQueueBox;
  bool _isOnline = false;

  Future<void> init() async {
    await Hive.initFlutter();
    
    // Registrar adapters
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(ItemAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(RequestAdapter());
    }

    // Abrir boxes
    _itemsBox = await Hive.openBox<Item>('items');
    _requestsBox = await Hive.openBox<Request>('requests');
    _syncQueueBox = await Hive.openBox('sync_queue');

    // Verificar conectividade
    await checkConnectivity();
    
    // Escutar mudanças de conectividade
    Connectivity().onConnectivityChanged.listen(_onConnectivityChanged);
  }

  Future<void> checkConnectivity() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    _isOnline = connectivityResult != ConnectivityResult.none;
    
    if (_isOnline) {
      await sync();
    }
  }

  void _onConnectivityChanged(ConnectivityResult result) {
    final wasOffline = !_isOnline;
    _isOnline = result != ConnectivityResult.none;
    
    // Se voltou a ter internet, sincronizar
    if (wasOffline && _isOnline) {
      sync();
    }
  }

  bool get isOnline => _isOnline;

  // ==================== ITEMS ====================

  Future<List<Item>> getItems({
    String? search,
    String? categoryId,
    String? status,
  }) async {
    if (_isOnline) {
      try {
        final response = await _apiService.getItems(
          search: search,
          categoryId: categoryId,
          status: status,
        );
        
        // Atualizar cache local
        final items = (response['items'] as List)
            .map((json) => Item.fromJson(json))
            .toList();
        
        for (final item in items) {
          await _itemsBox.put(item.id, item);
        }
        
        return items;
      } catch (e) {
        // Se falhar, retornar do cache
        return _getItemsFromCache(search: search, categoryId: categoryId, status: status);
      }
    } else {
      // Modo offline - retornar do cache
      return _getItemsFromCache(search: search, categoryId: categoryId, status: status);
    }
  }

  List<Item> _getItemsFromCache({
    String? search,
    String? categoryId,
    String? status,
  }) {
    var items = _itemsBox.values.toList();
    
    if (search != null && search.isNotEmpty) {
      items = items.where((item) {
        return item.name.toLowerCase().contains(search.toLowerCase()) ||
               item.itemCode.toLowerCase().contains(search.toLowerCase());
      }).toList();
    }
    
    if (categoryId != null) {
      items = items.where((item) => item.categoryId == categoryId).toList();
    }
    
    if (status != null) {
      items = items.where((item) => item.status == status).toList();
    }
    
    return items;
  }

  Future<Item?> getItemById(String id) async {
    if (_isOnline) {
      try {
        final response = await _apiService.getItemById(id);
        final item = Item.fromJson(response['item']);
        await _itemsBox.put(item.id, item);
        return item;
      } catch (e) {
        return _itemsBox.get(id);
      }
    } else {
      return _itemsBox.get(id);
    }
  }

  Future<Item?> getItemByCode(String code) async {
    if (_isOnline) {
      try {
        final response = await _apiService.getItemByCode(code);
        final item = Item.fromJson(response);
        await _itemsBox.put(item.id, item);
        return item;
      } catch (e) {
        // Buscar no cache
        return _itemsBox.values.firstWhere(
          (item) => item.itemCode == code,
          orElse: () => throw Exception('Item não encontrado'),
        );
      }
    } else {
      return _itemsBox.values.firstWhere(
        (item) => item.itemCode == code,
        orElse: () => throw Exception('Item não encontrado'),
      );
    }
  }

  // ==================== REQUESTS ====================

  Future<List<Request>> getRequests({String? status}) async {
    if (_isOnline) {
      try {
        final response = await _apiService.getRequests(status: status);
        
        final requests = (response['requests'] as List)
            .map((json) => Request.fromJson(json))
            .toList();
        
        for (final request in requests) {
          await _requestsBox.put(request.id, request);
        }
        
        return requests;
      } catch (e) {
        return _getRequestsFromCache(status: status);
      }
    } else {
      return _getRequestsFromCache(status: status);
    }
  }

  List<Request> _getRequestsFromCache({String? status}) {
    var requests = _requestsBox.values.toList();
    
    if (status != null) {
      requests = requests.where((req) => req.status == status).toList();
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    requests.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    
    return requests;
  }

  Future<Request> createRequest(Map<String, dynamic> data) async {
    if (_isOnline) {
      try {
        final response = await _apiService.createRequest(data);
        final request = Request.fromJson(response);
        await _requestsBox.put(request.id, request);
        return request;
      } catch (e) {
        // Adicionar à fila de sincronização
        await _addToSyncQueue('createRequest', data);
        throw Exception('Solicitação salva localmente. Será sincronizada quando houver conexão.');
      }
    } else {
      // Modo offline - salvar na fila
      await _addToSyncQueue('createRequest', data);
      throw Exception('Solicitação salva localmente. Será sincronizada quando houver conexão.');
    }
  }

  // ==================== SYNC ====================

  Future<void> _addToSyncQueue(String action, Map<String, dynamic> data) async {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    await _syncQueueBox.put('$action\_$timestamp', {
      'action': action,
      'data': data,
      'timestamp': timestamp,
    });
  }

  Future<void> sync() async {
    if (!_isOnline) return;

    try {
      // Sincronizar fila pendente
      final pendingItems = _syncQueueBox.values.toList();
      
      for (final item in pendingItems) {
        try {
          final action = item['action'];
          final data = item['data'];
          
          switch (action) {
            case 'createRequest':
              await _apiService.createRequest(data);
              break;
            // Adicionar outros casos conforme necessário
          }
          
          // Remover da fila após sincronizar
          final key = _syncQueueBox.keys.firstWhere(
            (k) => _syncQueueBox.get(k) == item,
          );
          await _syncQueueBox.delete(key);
        } catch (e) {
          // Se falhar, deixar na fila para próxima tentativa
          print('Erro ao sincronizar item: $e');
        }
      }

      // Atualizar cache local com dados do servidor
      await getItems();
      await getRequests();
    } catch (e) {
      print('Erro na sincronização: $e');
    }
  }

  Future<void> clearCache() async {
    await _itemsBox.clear();
    await _requestsBox.clear();
    await _syncQueueBox.clear();
  }

  int get pendingSyncCount => _syncQueueBox.length;
}
