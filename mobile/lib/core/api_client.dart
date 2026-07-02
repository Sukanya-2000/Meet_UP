import 'dart:io';
import 'dart:developer' as developer;

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const defaultBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://meetup-production-9620.up.railway.app/api',
  );

  final Dio dio = Dio(BaseOptions(
    baseUrl: defaultBaseUrl,
    connectTimeout: const Duration(seconds: 15),
    sendTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 20),
  ));

  Future<void> init() async {
    dio.interceptors.clear();
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      developer.log('HTTP ${options.method} ${options.uri}', name: 'CyberNest.network');
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }, onResponse: (response, handler) {
      developer.log('HTTP ${response.statusCode} ${response.requestOptions.uri}', name: 'CyberNest.network');
      handler.next(response);
    }, onError: (error, handler) async {
      developer.log(
        'HTTP error type=${error.type.name} status=${error.response?.statusCode ?? 'none'} '
        'url=${error.requestOptions.uri} message=${error.message}',
        name: 'CyberNest.network',
        error: error.error,
      );
      final prefs = await SharedPreferences.getInstance();
      final status = error.response?.statusCode;
      final retryCount = error.requestOptions.extra['serviceRetry'] as int? ?? 0;
      if ((status == 502 || status == 503) && retryCount < 2) {
        await Future<void>.delayed(Duration(seconds: retryCount + 1));
        error.requestOptions.extra['serviceRetry'] = retryCount + 1;
        try { return handler.resolve(await dio.fetch(error.requestOptions)); } catch (_) { /* Use the normal error path below. */ }
      }
      final refresh = prefs.getString('refresh_token');
      final path = error.requestOptions.path;
      final isAuthenticationRequest = path.contains('/auth/login') || path.contains('/auth/register') || path.contains('/auth/refresh');
      if (error.response?.statusCode == 401 && refresh != null && error.requestOptions.extra['retried'] != true && !isAuthenticationRequest) {
        try {
          final plain = Dio(BaseOptions(baseUrl: defaultBaseUrl, connectTimeout: const Duration(seconds: 15)));
          final response = await plain.post('/auth/refresh', data: {'refreshToken': refresh, 'deviceName': Platform.operatingSystem});
          await prefs.setString('token', '${response.data['token']}'); await prefs.setString('refresh_token', '${response.data['refreshToken']}');
          error.requestOptions.headers['Authorization'] = 'Bearer ${response.data['token']}'; error.requestOptions.extra['retried'] = true;
          return handler.resolve(await dio.fetch(error.requestOptions));
        } catch (_) { await prefs.remove('token'); await prefs.remove('refresh_token'); }
      }
      handler.next(error);
    }));
  }

  String absoluteUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http')) return url;
    return defaultBaseUrl.replaceFirst('/api', '') + url;
  }

  Future<Response> upload(String path, Map<String, dynamic> fields, List<File> files, {String fieldName = 'media'}) async {
    final form = FormData.fromMap({
      ...fields,
      fieldName: [for (final file in files) await MultipartFile.fromFile(file.path, filename: file.uri.pathSegments.last)],
    });
    return dio.post(path, data: form);
  }
}
