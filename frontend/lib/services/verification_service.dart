import 'package:dio/dio.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/services/api_client.dart';

/// API wrapper for email verification endpoints.
class VerificationService {
  VerificationService._();
  static final VerificationService instance = VerificationService._();

  Dio get _dio => ApiClient.instance.dio;

  /// `POST /api/resend-verification`
  /// Triggers a new verification email.
  Future<Response> resendVerification({required String email}) {
    return _dio.post(
      AppConfig.resendVerificationPath,
      data: {'email': email},
    );
  }

  /// `GET /api/check-verification-status?email=...`
  /// Returns `{ isVerified: true/false }`.
  Future<Response> checkVerificationStatus({required String email}) {
    return _dio.get(
      AppConfig.checkVerificationStatusPath,
      queryParameters: {'email': email},
    );
  }
}
