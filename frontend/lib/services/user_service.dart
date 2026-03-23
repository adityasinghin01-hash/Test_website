import 'package:dio/dio.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/services/api_client.dart';

/// API wrapper for protected user endpoints.
class UserService {
  UserService._();
  static final UserService instance = UserService._();

  Dio get _dio => ApiClient.instance.dio;

  /// `GET /api/profile`
  /// Returns `{ user: { id, email, name, picture, isVerified, provider, createdAt } }`.
  Future<Response> getProfile() {
    return _dio.get(AppConfig.profilePath);
  }

  /// `GET /api/dashboard`
  /// Returns `{ email, isVerified, activeSessions }`.
  Future<Response> getDashboard() {
    return _dio.get(AppConfig.dashboardPath);
  }

  /// `GET /api/health`
  /// Quick backend connectivity check.
  Future<Response> healthCheck() {
    return _dio.get(AppConfig.healthPath);
  }
}
