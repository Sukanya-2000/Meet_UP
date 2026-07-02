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
  String accentColor = 'coral';
  String fontSize = 'medium';
  double textScale = 1;
  bool reducedMotion = false;
  bool highContrast = false;
  bool rtlPreview = false;
  bool showOnlineStatus = true;
  bool readReceipts = true;
  bool verifiedOnlyBrowsing = false;
  String localeCode = 'en';

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
    accentColor = prefs.getString('accent_color') ?? 'coral';
    fontSize = prefs.getString('font_size') ?? 'medium';
    textScale = prefs.getDouble('text_scale') ?? 1;
    reducedMotion = prefs.getBool('reduced_motion') ?? false;
    highContrast = prefs.getBool('high_contrast') ?? false;
    rtlPreview = prefs.getBool('rtl_preview') ?? false;
    showOnlineStatus = prefs.getBool('show_online_status') ?? true;
    readReceipts = prefs.getBool('read_receipts') ?? true;
    verifiedOnlyBrowsing = prefs.getBool('verified_only_browsing') ?? false;
    localeCode = prefs.getString('locale_code') ?? 'en';
    if (token != null) {
      if (showOnlineStatus) sockets.connect(token!);
      try {
        final remote = Map<String, dynamic>.from((await api.dio.get('/settings/appearance')).data['appearance']);
        appearanceMode = remote['theme'] == 'dark' ? ThemeMode.dark : remote['theme'] == 'light' ? ThemeMode.light : ThemeMode.system;
        accentColor = '${remote['accentColor'] ?? accentColor}'; fontSize = '${remote['fontSize'] ?? fontSize}';
        textScale = (remote['textScale'] as num?)?.toDouble() ?? textScale; reducedMotion = remote['reducedMotion'] ?? reducedMotion;
        highContrast = remote['highContrast'] ?? highContrast; rtlPreview = remote['rtlPreview'] ?? rtlPreview;
      } catch (_) { /* Device preferences remain authoritative while offline. */ }
    }
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
    await _syncAppearance();
  }

  Future<void> updateAppearance({String? accent, String? size, double? scale, bool? motion, bool? contrast, bool? rtl}) async {
    accentColor = accent ?? accentColor; fontSize = size ?? fontSize; textScale = scale ?? textScale;
    reducedMotion = motion ?? reducedMotion; highContrast = contrast ?? highContrast; rtlPreview = rtl ?? rtlPreview;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('accent_color', accentColor); await prefs.setString('font_size', fontSize); await prefs.setDouble('text_scale', textScale);
    await prefs.setBool('reduced_motion', reducedMotion); await prefs.setBool('high_contrast', highContrast); await prefs.setBool('rtl_preview', rtlPreview);
    notifyListeners(); await _syncAppearance();
  }

  Future<void> _syncAppearance() async {
    if (token == null) return;
    try { await api.dio.put('/settings/appearance', data: {'theme': appearanceMode == ThemeMode.dark ? 'dark' : appearanceMode == ThemeMode.light ? 'light' : 'system', 'accentColor': accentColor, 'fontSize': fontSize, 'textScale': textScale, 'reducedMotion': reducedMotion, 'highContrast': highContrast, 'rtlPreview': rtlPreview}); } catch (_) { /* Local persistence supports offline use. */ }
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
  Future<void> setLocaleCode(String value) async { localeCode = value; final prefs = await SharedPreferences.getInstance(); await prefs.setString('locale_code', value); notifyListeners(); }
  Future<Map<String, dynamic>> aiProfile(String capability) async => Map<String, dynamic>.from((await api.dio.post('/enterprise/ai/profile', data: {'capability': capability})).data);
  Future<Map<String, dynamic>> exportAccount() async => Map<String, dynamic>.from((await api.dio.post('/enterprise/privacy/export')).data);
  Future<void> updateConsent(String type, bool granted) => api.dio.post('/enterprise/privacy/consents', data: {'type': type, 'granted': granted}).then((_) {});
  Future<void> deleteAccount() => api.dio.delete('/enterprise/privacy/data', data: {'type': 'delete-account', 'confirmation': 'DELETE'}).then((_) {});

  Future<String?> login(String email, String password) async {
    try {
      loading = true; notifyListeners();
      final res = await api.dio.post('/auth/login', data: {'email': email, 'password': password});
      token = res.data['token'];
      user = Map<String, dynamic>.from(res.data['user']);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token!);
      if (res.data['refreshToken'] != null) await prefs.setString('refresh_token', '${res.data['refreshToken']}');
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
      if (res.data['refreshToken'] != null) await prefs.setString('refresh_token', '${res.data['refreshToken']}');
      if (showOnlineStatus) sockets.connect(token!);
      notifyListeners();
      return null;
    } catch (e) { return _message(e); }
  }

  Future<void> logout() async {
    token = null; user = null; sockets.dispose();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('refresh_token');
    notifyListeners();
  }

  Future<Map<String, dynamic>> myProfile() async => Map<String, dynamic>.from((await api.dio.get('/profile/me')).data);
  Future<void> saveBasic(Map<String, dynamic> data) => api.dio.post('/profile/basic', data: data).then((_) {});
  Future<void> saveInterests(List<String> interests) => api.dio.post('/profile/interests', data: {'interests': interests}).then((_) {});
  Future<void> updateProfile(Map<String, dynamic> data) => api.dio.put('/profile/update', data: data).then((_) {});
  Future<Map<String, dynamic>> prompts() async => Map<String, dynamic>.from((await api.dio.get('/profile/prompts')).data);
  Future<void> savePrompt(Map<String, dynamic> data) => api.dio.post('/profile/prompts', data: data).then((_) {});
  Future<Map<String, dynamic>> superLike(String userId, {String note = ''}) async => Map<String, dynamic>.from((await api.dio.post('/like', data: {'toUser': userId, 'kind': 'super-like', 'note': note})).data);
  Future<void> unmatch(String matchId, {String reason = ''}) => api.dio.delete('/matches/$matchId', data: {'reason': reason}).then((_) {});
  Future<void> setIncognito(bool enabled) => api.dio.put('/profile/privacy', data: {'incognitoEnabled': enabled}).then((_) {});
  Future<void> setTravel(Map<String, dynamic> travel) => api.dio.put('/profile/travel', data: travel).then((_) {});
  Future<Map<String, dynamic>> openingMoves() async => Map<String, dynamic>.from((await api.dio.get('/opening-moves')).data);
  Future<void> createOpeningMove(Map<String, dynamic> value) => api.dio.post('/opening-moves', data: value).then((_) {});
  Future<void> setSnooze(bool enabled, {int hours = 24, String reason = ''}) => api.dio.put('/lifecycle/snooze', data: {'enabled': enabled, 'hours': hours, 'reason': reason}).then((_) {});
  Future<Map<String, dynamic>> extendMatch(String id) async => Map<String, dynamic>.from((await api.dio.post('/lifecycle/matches/$id/extend')).data);
  Future<Map<String, dynamic>> rematch(String id) async => Map<String, dynamic>.from((await api.dio.post('/lifecycle/matches/$id/rematch')).data);
  Future<Map<String, dynamic>> startCall(String matchId, String type) async => Map<String, dynamic>.from((await api.dio.post('/interactions/calls', data: {'matchId': matchId, 'type': type})).data);
  Future<Map<String, dynamic>> startQuestionGame(String matchId) async => Map<String, dynamic>.from((await api.dio.post('/interactions/games', data: {'matchId': matchId})).data);
  Future<Map<String, dynamic>> answerQuestion(String gameId, String answer, {bool skip = false}) async => Map<String, dynamic>.from((await api.dio.post('/interactions/games/$gameId/answer', data: {'answer': answer, 'skip': skip})).data);
  Future<void> updateDatePlanStatus(String id, String status, {String note = ''}) => api.dio.post('/features/date-plans/$id/status', data: {'status': status, 'note': note}).then((_) {});
  Future<Map<String, dynamic>> verificationStatus() async => Map<String, dynamic>.from((await api.dio.get('/verifications')).data);
  Future<Map<String, dynamic>> curatedDiscovery() async => Map<String, dynamic>.from((await api.dio.get('/discovery/curated')).data);
  Future<Map<String, dynamic>> events({bool past = false}) async => Map<String, dynamic>.from((await api.dio.get('/community/events', queryParameters: {'past': past})).data);
  Future<void> eventAction(String id, String action, [Map<String, dynamic> values = const {}]) => api.dio.post('/community/events/$id/action', data: {'action': action, ...values}).then((_) {});
  Future<Map<String, dynamic>> doubleDateDiscovery() async => Map<String, dynamic>.from((await api.dio.get('/social/double-date/discovery')).data);
  Future<Map<String, dynamic>> doubleDateSwipe(String groupId, String action) async => Map<String, dynamic>.from((await api.dio.post('/social/double-date/swipe', data: {'toGroupId': groupId, 'action': action})).data);
  Future<Map<String, dynamic>> spotifyConnect() async => Map<String, dynamic>.from((await api.dio.get('/platform/music/spotify/start')).data);
  Future<Map<String, dynamic>> musicProfile() async => Map<String, dynamic>.from((await api.dio.get('/platform/music')).data);
  Future<void> disconnectMusic() => api.dio.delete('/platform/music').then((_) {});
  Future<Map<String, dynamic>> campusOverview() async => Map<String, dynamic>.from((await api.dio.get('/platform/campus')).data);
  Future<List<Map<String, dynamic>>> campusInstitutionSearch(String query) async => ((await api.dio.get('/platform/campus/institutions', queryParameters: {'q': query})).data['institutions'] as List? ?? []).map((item) => Map<String, dynamic>.from(item)).toList();
  Future<void> campusJoin(Map<String, dynamic> data) => api.dio.post('/platform/campus/join', data: data).then((_) {});
  Future<Map<String, dynamic>> campusDiscovery() async => Map<String, dynamic>.from((await api.dio.get('/platform/campus/discovery')).data);

  Future<List<Profile>> discovery({int page = 1, String mode = 'for-you', String myZodiac = 'Sagittarius', String compatibility = 'all', Map<String, dynamic> filters = const {}}) async {
    final res = await api.dio.get('/discovery', queryParameters: {
      'page': page, 'limit': 20, 'mode': mode,
      ...filters.map((key, value) => MapEntry(key, value is List ? value.join(',') : value)),
      if (mode == 'astrology') 'myZodiac': myZodiac,
      if (mode == 'astrology') 'compatibility': compatibility,
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
  Future<List<Map<String, dynamic>>> sentLikes() async {
    final data = (await api.dio.get('/likes/sent')).data;
    final items = data is List ? data : (data is Map ? data['likes'] ?? data['sent'] ?? data['data'] ?? [] : []);
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
  Future<Map<String, dynamic>> notificationPreferences() async => Map<String, dynamic>.from((await api.dio.get('/notifications/settings/preferences')).data);
  Future<void> updateNotificationPreferences(Map<String, dynamic> values) => api.dio.put('/notifications/settings/preferences', data: values).then((_) {});
  Future<Map<String, dynamic>> notifications() async => Map<String, dynamic>.from((await api.dio.get('/notifications')).data);
  Future<void> registerPushToken(String value, String platform) => api.dio.post('/notifications/devices', data: {'token': value, 'platform': platform}).then((_) {});
  Future<void> updateLocation(double latitude, double longitude) => api.dio.put('/profile/location', data: {'latitude': latitude, 'longitude': longitude, 'consent': true}).then((_) {});
  Future<Map<String, dynamic>> verifyStorePurchase(Map<String, dynamic> purchase) async => Map<String, dynamic>.from((await api.dio.post('/payments/store/verify', data: purchase)).data);
  Future<void> report(String userId, String reason, String details, bool block) => api.dio.post('/safety/report', data: {'reportedUserId': userId, 'reason': reason, 'details': details, 'block': block}).then((_) {});
  Future<void> block(String userId) => api.dio.post('/safety/block', data: {'blockedUserId': userId}).then((_) {});
  Future<Map<String, dynamic>> safetyTrust() async => Map<String, dynamic>.from((await api.dio.get('/safety/trust')).data);
  Future<Map<String, dynamic>> safetyCheckIns() async => Map<String, dynamic>.from((await api.dio.get('/safety/check-ins')).data);
  Future<void> createSafetyCheckIn(DateTime scheduledFor, String venue, {String matchId = '', String trustedContactName = '', String trustedContactPhone = ''}) => api.dio.post('/safety/check-ins', data: {
    'scheduledFor': scheduledFor.toUtc().toIso8601String(),
    'venue': venue,
    if (matchId.isNotEmpty) 'matchId': matchId,
    if (trustedContactName.isNotEmpty) 'trustedContactName': trustedContactName,
    if (trustedContactPhone.isNotEmpty) 'trustedContactPhone': trustedContactPhone,
  }).then((_) {});
  Future<void> updateSafetyCheckIn(String id, String status) => api.dio.put('/safety/check-ins/$id', data: {'status': status}).then((_) {});

  String _message(Object e) {
    if (e is DioException) {
      if (e.type == DioExceptionType.connectionTimeout) return 'Connection to CyberNest timed out.';
      if (e.type == DioExceptionType.sendTimeout) return 'Sending the request to CyberNest timed out.';
      if (e.type == DioExceptionType.receiveTimeout) return 'CyberNest took too long to respond.';
      if (e.type == DioExceptionType.badCertificate) return 'CyberNest returned an invalid HTTPS certificate.';
      if (e.type == DioExceptionType.connectionError) {
        return 'Cannot reach CyberNest (${e.requestOptions.uri.host}). Check your internet connection.';
      }
    }
    final data = e is DioException ? e.response?.data : null;
    return data is Map && data['message'] != null ? '${data['message']}' : e.toString();
  }
}
