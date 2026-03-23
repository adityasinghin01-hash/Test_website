import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/interceptors/auth_interceptor.dart';
import 'package:test_app/services/token_storage.dart';

/// Creates and configures the singleton [Dio] instance used by all services.
///
/// • Base URL from [AppConfig]
/// • JSON content type
/// • Connect / receive timeouts
/// • [AuthInterceptor] for automatic Bearer token + 401 refresh
/// • Log interceptor in debug mode
class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  late final Dio dio;
  bool _initialized = false;

  /// Call once at app startup (after dotenv is loaded).
  void init() {
    if (_initialized) return;

    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Auth interceptor — attaches Bearer token, handles 401 refresh
    dio.interceptors.add(
      AuthInterceptor(
        dio: dio,
        tokenStorage: TokenStorage.instance,
      ),
    );

    // Log interceptor (debug builds only)
    assert(() {
      dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
          logPrint: (obj) => debugPrint('📡 $obj'),
        ),
      );
      return true;
    }());

    _initialized = true;
  }

  /// Pings the server to wake it up (Render free tier cold start fix).
  /// Call this at app startup — fire and forget.
  Future<void> warmUp() async {
    try {
      await dio.get(
        AppConfig.healthPath,
        options: Options(
          sendTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 60),
        ),
      );
      debugPrint('✅ Server warmed up');
    } catch (_) {
      debugPrint('⚠️ Server warm-up failed — may be cold starting');
    }
  }
}
