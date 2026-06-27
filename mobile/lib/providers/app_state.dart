import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';
import '../core/socket_service.dart';
import '../models/cyber_models.dart';

class AppState extends ChangeNotifier {
  final api = ApiClient.instance;
  final sockets = SocketService();
  String? token;
  Map<String, dynamic>? user;
  bool booted = false;
  bool loading = false;
  ThemeMode themeMode = ThemeMode.system;

  bool get loggedIn => token != null;
  String get userId => '${user?['id'] ?? user?['_id'] ?? ''}';

  Future<void> bootstrap() async {
    await api.init();
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token');
    final mode = prefs.getString('theme') ?? 'system';
    themeMode = mode == 'dark' ? ThemeMode.dark : mode == 'light' ? ThemeMode.light : ThemeMode.system;
    if (token != null) sockets.connect(token!);
    booted = true;
    notifyListeners();
  }

  Future<void> setTheme(ThemeMode mode) async {
    themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme', mode == ThemeMode.dark ? 'dark' : mode == ThemeMode.light ? 'light' : 'system');
    notifyListeners();
  }

  Future<String?> login(String email, String password) async {
    try {
      loading = true; notifyListeners();
      final res = await api.dio.post('/auth/login', data: {'email': email, 'password': password});
      token = res.data['token'];
      user = Map<String, dynamic>.from(res.data['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token!);
      sockets.connect(token!);
      return null;
    } catch (e) {
      return _message(e);
    } finally { loading = false; notifyListeners(); }
  }

  Future<String?> register(String email, String password) async {
    try {
      final res = await api.dio.post('/auth/register', data: {'email': email, 'password': password});
      token = res.data['token'];
      user = Map<String, dynamic>.from(res.data['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token!);
      sockets.connect(token!);
      notifyListeners();
      return null;
    } catch (e) { return _message(e); }
  }

  Future<void> logout() async {
    token = null; user = null; sockets.dispose();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }

  Future<Map<String, dynamic>> myProfile() async => Map<String, dynamic>.from((await api.dio.get('/profile/me')).data);
  Future<void> saveBasic(Map<String, dynamic> data) => api.dio.post('/profile/basic', data: data).then((_) {});
  Future<void> saveInterests(List<String> interests) => api.dio.post('/profile/interests', data: {'interests': interests}).then((_) {});
  Future<void> updateProfile(Map<String, dynamic> data) => api.dio.put('/profile/update', data: data).then((_) {});

  Future<List<Profile>> discovery({int page = 1}) async {
    final res = await api.dio.get('/discovery', queryParameters: {'page': page, 'limit': 20});
    return (res.data['profiles'] as List? ?? []).map((e) => Profile.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> like(String userId) async => Map<String, dynamic>.from((await api.dio.post('/like', data: {'toUser': userId})).data);
  Future<void> swipe(String userId, String action) => api.dio.post('/swipe', data: {'toUser': userId, 'action': action}).then((_) {});
  Future<void> rewind() => api.dio.delete('/swipe/rewind').then((_) {});
  Future<void> sendRequest(String userId) => api.dio.post('/connections', data: {'toUser': userId}).then((_) {});

  Future<Map<String, dynamic>> requests() async => Map<String, dynamic>.from((await api.dio.get('/connections')).data);
  Future<Map<String, dynamic>> respondRequest(String id, String status) async => Map<String, dynamic>.from((await api.dio.put('/connections/$id', data: {'status': status})).data);
  Future<Map<String, dynamic>> receivedLikes() async => Map<String, dynamic>.from((await api.dio.get('/likes/received')).data);
  Future<Map<String, dynamic>> acceptLike(String id) async => Map<String, dynamic>.from((await api.dio.post('/likes/accept/$id')).data);

  Future<List<MatchItem>> matches() async {
    final res = await api.dio.get('/matches');
    return (res.data['matches'] as List? ?? []).map((e) => MatchItem.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> messages(String conversationId) async => Map<String, dynamic>.from((await api.dio.get('/messages/$conversationId')).data);
  Future<void> sendMessage(Map<String, dynamic> data) => api.dio.post('/messages', data: data).then((_) {});
  Future<void> uploadChatMedia(String conversationId, List<File> files) => api.upload('/messages/media', {'conversationId': conversationId}, files).then((_) {});

  Future<Map<String, dynamic>> subscription() async => Map<String, dynamic>.from((await api.dio.get('/subscription/me')).data);
  Future<Map<String, dynamic>> premiumCheckout() async => Map<String, dynamic>.from((await api.dio.post('/payments/create-checkout-session')).data);
  Future<void> boost() => api.dio.post('/premium/boost').then((_) {});
  Future<void> report(String userId, String reason, String details, bool block) => api.dio.post('/safety/report', data: {'reportedUserId': userId, 'reason': reason, 'details': details, 'block': block}).then((_) {});
  Future<void> block(String userId) => api.dio.post('/safety/block', data: {'blockedUserId': userId}).then((_) {});

  String _message(Object e) {
    final data = e is DioException ? e.response?.data : null;
    return data is Map && data['message'] != null ? '${data['message']}' : e.toString();
  }
}
