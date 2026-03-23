import 'dart:async';

import 'dart:ui';
import 'package:dio/dio.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/services/token_storage.dart';

/// Dio [QueuedInterceptor] that:
/// 1. Attaches `Authorization: Bearer <accessToken>` to every request.
/// 2. On 401 → attempts a single token refresh → retries the original request.
/// 3. On refresh failure (403 / network error) → clears storage, forces re-login.
///
/// [QueuedInterceptor] serializes concurrent 401 retries so only ONE
/// refresh call is made even if 5 requests fail at the same time.
class AuthInterceptor extends QueuedInterceptor {
  AuthInterceptor({
    required this.dio,
    required this.tokenStorage,
    this.onForceLogout,
  });

  final Dio dio;
  final TokenStorage tokenStorage;

  /// Called when refresh fails — the app should navigate to the login screen.
  /// Wired up by the auth provider at startup.
  VoidCallback? onForceLogout;

  // ── Attach token on every request ─────────────────────
  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) {
    // Skip token for refresh-token endpoint itself to avoid loops
    if (options.path == AppConfig.refreshTokenPath) {
      handler.next(options);
      return;
    }

    final token = tokenStorage.cachedAccessToken;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  // ── Handle 401 → refresh → retry ─────────────────────
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // Only intercept 401s on non-refresh endpoints
    if (err.response?.statusCode != 401 ||
        err.requestOptions.path == AppConfig.refreshTokenPath) {
      handler.next(err);
      return;
    }

    try {
      // 1. Read stored refresh token
      final refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken == null) {
        await _forceLogout();
        handler.next(err);
        return;
      }

      // 2. Call /api/refresh-token with a FRESH Dio (no interceptor loop)
      final refreshDio = Dio(
        BaseOptions(
          baseUrl: AppConfig.baseUrl,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        ),
      );

      final response = await refreshDio.post(
        AppConfig.refreshTokenPath,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final newAccessToken = response.data['accessToken'] as String;
        final newRefreshToken = response.data['refreshToken'] as String;

        // 3. Save new token pair
        await tokenStorage.saveTokens(
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        );

        // 4. Retry the original request with the new token
        final retryOptions = err.requestOptions;
        retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';

        final retryResponse = await refreshDio.fetch(retryOptions);
        handler.resolve(retryResponse);
        return;
      }

      // Non-200 from refresh → force logout
      await _forceLogout();
      handler.next(err);
    } on DioException catch (refreshError) {
      // 403 = expired / token reuse detected → force logout
      if (refreshError.response?.statusCode == 403) {
        await _forceLogout();
      }
      handler.next(err);
    } catch (_) {
      handler.next(err);
    }
  }

  // ── Helpers ───────────────────────────────────────────

  Future<void> _forceLogout() async {
    await tokenStorage.clearAll();
    onForceLogout?.call();
  }

  /// Optional proactive check — returns true if the access token
  /// is expiring within [buffer]. Callers can trigger a pre-emptive refresh.
  bool isTokenExpiringSoon({Duration buffer = const Duration(minutes: 1)}) {
    final token = tokenStorage.cachedAccessToken;
    if (token == null) return true;
    try {
      return JwtDecoder.isExpired(token) ||
          JwtDecoder.getRemainingTime(token) < buffer;
    } catch (_) {
      return true;
    }
  }
}
