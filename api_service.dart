import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api'; // Altere para sua URL de produção
  
  late Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    // Interceptor para adicionar token JWT
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expirado - fazer logout
            await _storage.delete(key: 'token');
          }
          return handler.next(error);
        },
      ),
    );
  }

  // ==================== AUTH ====================
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      
      if (response.data['success']) {
        final token = response.data['data']['token'];
        await _storage.write(key: 'token', value: token);
        await _storage.write(key: 'user', value: response.data['data']['user']['id']);
        return response.data['data'];
      }
      throw Exception(response.data['message']);
    } catch (e) {
      throw Exception('Erro ao fazer login: ${e.toString()}');
    }
  }

  Future<void> logout() async {
    await _storage.deleteAll();
  }

  Future<Map<String, dynamic>> getMe() async {
    try {
      final response = await _dio.get('/auth/me');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar dados do usuário: ${e.toString()}');
    }
  }

  // ==================== ITEMS ====================
  
  Future<Map<String, dynamic>> getItems({
    int page = 1,
    int limit = 20,
    String? search,
    String? categoryId,
    String? status,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'limit': limit,
        if (search != null) 'search': search,
        if (categoryId != null) 'categoryId': categoryId,
        if (status != null) 'status': status,
      };

      final response = await _dio.get('/items', queryParameters: queryParams);
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar itens: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> getItemById(String id) async {
    try {
      final response = await _dio.get('/items/$id');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar item: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> getItemByCode(String code) async {
    try {
      final response = await _dio.get('/items/code/$code');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar item por código: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> createItem(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/items', data: data);
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao criar item: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> updateItem(String id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/items/$id', data: data);
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao atualizar item: ${e.toString()}');
    }
  }

  // ==================== REQUESTS ====================
  
  Future<Map<String, dynamic>> getRequests({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      final queryParams = {
        'page': page,
        'limit': limit,
        if (status != null) 'status': status,
      };

      final response = await _dio.get('/requests', queryParameters: queryParams);
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar solicitações: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> getRequestById(String id) async {
    try {
      final response = await _dio.get('/requests/$id');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar solicitação: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> createRequest(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/requests', data: data);
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao criar solicitação: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> approveRequest(String id, String? notes) async {
    try {
      final response = await _dio.put('/requests/$id/approve', data: {
        'approvalNotes': notes,
      });
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao aprovar solicitação: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> rejectRequest(String id, String reason) async {
    try {
      final response = await _dio.put('/requests/$id/reject', data: {
        'rejectionReason': reason,
      });
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao rejeitar solicitação: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> completeRequest(String id, String? notes) async {
    try {
      final response = await _dio.put('/requests/$id/complete', data: {
        'notes': notes,
      });
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao completar entrega: ${e.toString()}');
    }
  }

  Future<Map<String, dynamic>> cancelRequest(String id) async {
    try {
      final response = await _dio.put('/requests/$id/cancel');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao cancelar solicitação: ${e.toString()}');
    }
  }

  // ==================== DASHBOARD ====================
  
  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final response = await _dio.get('/items/dashboard');
      return response.data['data'];
    } catch (e) {
      throw Exception('Erro ao buscar dashboard: ${e.toString()}');
    }
  }
}
