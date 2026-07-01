import 'dart:io';

import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  static const defaultBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api',
  );

  final Dio dio = Dio(BaseOptions(baseUrl: defaultBaseUrl, connectTimeout: const Duration(seconds: 15), receiveTimeout: const Duration(seconds: 20)));

  Future<void> init() async {
    dio.interceptors.clear();
    dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) async {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('token');
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    }, onError: (error, handler) async {
      final prefs = await SharedPreferences.getInstance();
      final refresh = prefs.getString('refresh_token');
      if (error.response?.statusCode == 401 && refresh != null && error.requestOptions.extra['retried'] != true && !error.requestOptions.path.contains('/auth/refresh')) {
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
