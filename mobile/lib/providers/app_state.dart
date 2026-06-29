import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../core/api_client.dart';
import '../core/app_theme.dart';
import '../core/socket_service.dart';
import '../models/cyber_models.dart';

class AppState extends ChangeNotifier {
  final api = ApiClient.instance;
  final sockets = SocketService();
  String? token;
  Map<String, dynamic>? user;
  bool booted = false;
  bool loading = false;
  CyberTheme selectedTheme = CyberTheme.sunset;
  ThemeMode appearanceMode = ThemeMode.system;
  bool showOnlineStatus = true;
  bool readReceipts = true;
  bool verifiedOnlyBrowsing = false;

  bool get loggedIn => token != null;
  String get userId => '${user?['id'] ?? user?['_id'] ?? ''}';

  Future<void> bootstrap() async {
    await api.init();
    final prefs = await SharedPreferences.getInstance();
    token = prefs.getString('token');
    final savedTheme = prefs.getString('cyber_theme') ?? 'sunset';
    selectedTheme = CyberTheme.values.firstWhere((theme) => theme.name == savedTheme, orElse: () => CyberTheme.sunset);
    final appearance = prefs.getString('appearance') ?? 'system';
    appearanceMode = appearance == 'dark' ? ThemeMode.dark : appearance == 'light' ? ThemeMode.light : ThemeMode.system;
    showOnlineStatus = prefs.getBool('show_online_status') ?? true;
    readReceipts = prefs.getBool('read_receipts') ?? true;
    verifiedOnlyBrowsing = prefs.getBool('verified_only_browsing') ?? false;
    if (token != null && showOnlineStatus) sockets.connect(token!);
    booted = true;
    notifyListeners();
  }

  Future<void> setTheme(CyberTheme theme) async {
    selectedTheme = theme;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('cyber_theme', theme.name);
    notifyListeners();
  }

  Future<void> setAppearance(ThemeMode mode) async {
    appearanceMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('appearance', mode == ThemeMode.dark ? 'dark' : mode == ThemeMode.light ? 'light' : 'system');
    notifyListeners();
  }

  Future<void> setShowOnlineStatus(bool enabled) async {
    showOnlineStatus = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('show_online_status', enabled);
    if (enabled && token != null) {
      sockets.connect(token!);
    } else {
      sockets.dispose();
    }
    notifyListeners();
  }

  Future<void> setReadReceipts(bool enabled) async {
    readReceipts = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('read_receipts', enabled);
    notifyListeners();
  }

  Future<void> setVerifiedOnlyBrowsing(bool enabled) async {
    verifiedOnlyBrowsing = enabled;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('verified_only_browsing', enabled);
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
      if (showOnlineStatus) sockets.connect(token!);
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
      if (showOnlineStatus) sockets.connect(token!);
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

  Future<List<Profile>> discovery({int page = 1, int ageMin = 18, int ageMax = 60, String? gender, String mode = 'for-you', String myZodiac = 'Sagittarius', String compatibility = 'all'}) async {
    final res = await api.dio.get('/discovery', queryParameters: {
      'page': page, 'limit': 20, 'ageMin': ageMin, 'ageMax': ageMax, 'mode': mode,
      if (mode == 'astrology') 'myZodiac': myZodiac,
      if (mode == 'astrology') 'compatibility': compatibility,
      if (gender != null && gender.isNotEmpty) 'gender': gender,
      if (verifiedOnlyBrowsing) 'verifiedOnly': true,
    });
    return (res.data['profiles'] as List? ?? []).map((e) => Profile.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> like(String userId) async => Map<String, dynamic>.from((await api.dio.post('/like', data: {'toUser': userId})).data);
  Future<void> swipe(String userId, String action) => api.dio.post('/swipe', data: {'toUser': userId, 'action': action}).then((_) {});
  Future<void> rewind() => api.dio.delete('/swipe/rewind').then((_) {});
  Future<void> sendRequest(String userId) => api.dio.post('/connections', data: {'toUser': userId}).then((_) {});
  Future<Map<String, dynamic>> doubleDateGroup() async => Map<String, dynamic>.from((await api.dio.get('/features/double-date')).data);
  Future<Map<String, dynamic>> saveDoubleDateGroup(Map<String, dynamic> data) async => Map<String, dynamic>.from((await api.dio.put('/features/double-date', data: data)).data);
  Future<Map<String, dynamic>> createMatchmakerSession() async => Map<String, dynamic>.from((await api.dio.post('/features/matchmaker')).data);
  Future<Map<String, dynamic>> matchmakerSession() async => Map<String, dynamic>.from((await api.dio.get('/features/matchmaker')).data);
  Future<Map<String, dynamic>> datePlans() async => Map<String, dynamic>.from((await api.dio.get('/features/date-plans')).data);
  Future<Map<String, dynamic>> createDatePlan(Map<String, dynamic> data) async => Map<String, dynamic>.from((await api.dio.post('/features/date-plans', data: data)).data);

  Future<Map<String, dynamic>> requests() async => Map<String, dynamic>.from((await api.dio.get('/connections')).data);
  Future<Map<String, dynamic>> respondRequest(String id, String status) async => Map<String, dynamic>.from((await api.dio.put('/connections/$id', data: {'status': status})).data);
  Future<List<Map<String, dynamic>>> receivedLikes() async {
    final data = (await api.dio.get('/likes/received')).data;
    final items = data is List ? data : (data is Map ? data['likes'] ?? data['received'] ?? data['data'] ?? [] : []);
    return (items as List).map((item) => Map<String, dynamic>.from(item)).toList();
  }
  Future<Map<String, dynamic>> acceptLike(String id) async => Map<String, dynamic>.from((await api.dio.post('/likes/accept/$id')).data);
  Future<void> passLike(String id) => api.dio.post('/likes/pass/$id').then((_) {});

  Future<List<MatchItem>> matches() async {
    final res = await api.dio.get('/matches');
    return (res.data['matches'] as List? ?? []).map((e) => MatchItem.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  Future<Map<String, dynamic>> messages(String conversationId) async => Map<String, dynamic>.from((await api.dio.get('/messages/$conversationId')).data);
  Future<void> sendMessage(Map<String, dynamic> data) => api.dio.post('/messages', data: data).then((_) {});
  Future<void> uploadChatMedia(String conversationId, List<File> files) => api.upload('/messages/media', {'conversationId': conversationId}, files).then((_) {});

  Future<Map<String, dynamic>> subscription() async => Map<String, dynamic>.from((await api.dio.get('/subscription/me')).data);
  Future<Map<String, dynamic>> premiumCheckout() async => Map<String, dynamic>.from((await api.dio.post('/payments/create-checkout-session')).data);
  Future<Map<String, dynamic>> boost() async => Map<String, dynamic>.from((await api.dio.post('/premium/boost')).data);
  Future<void> report(String userId, String reason, String details, bool block) => api.dio.post('/safety/report', data: {'reportedUserId': userId, 'reason': reason, 'details': details, 'block': block}).then((_) {});
  Future<void> block(String userId) => api.dio.post('/safety/block', data: {'blockedUserId': userId}).then((_) {});
  Future<Map<String, dynamic>> safetyTrust() async => Map<String, dynamic>.from((await api.dio.get('/safety/trust')).data);
  Future<Map<String, dynamic>> safetyCheckIns() async => Map<String, dynamic>.from((await api.dio.get('/safety/check-ins')).data);
  Future<void> createSafetyCheckIn(DateTime scheduledFor, String venue) => api.dio.post('/safety/check-ins', data: {'scheduledFor': scheduledFor.toUtc().toIso8601String(), 'venue': venue}).then((_) {});
  Future<void> updateSafetyCheckIn(String id, String status) => api.dio.put('/safety/check-ins/$id', data: {'status': status}).then((_) {});

  String _message(Object e) {
    final data = e is DioException ? e.response?.data : null;
    return data is Map && data['message'] != null ? '${data['message']}' : e.toString();
  }
}
