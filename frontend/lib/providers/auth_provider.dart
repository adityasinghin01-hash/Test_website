import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/interceptors/auth_interceptor.dart';
import 'package:test_app/models/api_error.dart';
import 'package:test_app/models/user_model.dart';
import 'package:test_app/services/api_client.dart';
import 'package:test_app/services/token_storage.dart';

// ── Auth state ──────────────────────────────────────────

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    this.status = AuthStatus.unknown,
    this.user,
    this.isLoading = false,
    this.errorMessage,
  });

  final AuthStatus status;
  final UserModel? user;
  final bool isLoading;
  final String? errorMessage;

  AuthState copyWith({
    AuthStatus? status,
    UserModel? user,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
    bool clearUser = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: clearUser ? null : (user ?? this.user),
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}

// ── Auth notifier ───────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(Ref ref) : super(const AuthState()) {
    _tokenStorage = TokenStorage.instance;
    _dio = ApiClient.instance.dio;

    // Wire up force-logout callback from the interceptor
    final interceptor = _dio.interceptors.whereType<AuthInterceptor>().first;
    interceptor.onForceLogout = _handleForceLogout;
  }

  late final TokenStorage _tokenStorage;
  late final Dio _dio;

  // ── Check existing session (splash screen) ────────────
  //
  // Storage-only — NO network calls. Reads tokens from
  // [FlutterSecureStorage] and sets [AuthStatus.authenticated]
  // if they exist. The [AuthInterceptor] validates and refreshes
  // tokens lazily on the first real API call.

  Future<void> checkAuthStatus() async {
    state = state.copyWith(isLoading: true, clearError: true);

    final hasTokens = await _tokenStorage.hasTokens();

    if (!hasTokens) {
      state = state.copyWith(
        status: AuthStatus.unauthenticated,
        isLoading: false,
      );
      return;
    }

    // Prime the in-memory cache so the interceptor has the token
    await _tokenStorage.getAccessToken();

    // Tokens exist → trust them. The interceptor will handle
    // 401s and force-logout if they turn out to be expired.
    state = state.copyWith(
      status: AuthStatus.authenticated,
      isLoading: false,
    );
  }

  // ── Login ─────────────────────────────────────────────

  Future<void> login({
    required String email,
    required String password,
    required String recaptchaToken,
    bool rememberMe = false,
  }) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _dio.post(
        AppConfig.loginPath,
        data: {
          'email': email,
          'password': password,
          'recaptchaToken': recaptchaToken,
          'rememberMe': rememberMe,
        },
      );

      final accessToken = response.data['accessToken'] as String;
      final refreshToken = response.data['refreshToken'] as String;

      await _tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      await _tokenStorage.saveUserEmail(email);

      final user = UserModel.fromJson(response.data['user']);

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _extractErrorMessage(e),
      );
    }
  }

  // ── Signup ────────────────────────────────────────────

  Future<bool> signup({
    required String name,
    required String email,
    required String password,
    required String recaptchaToken,
  }) async {
    final trimmedName = name.trim();
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _dio.post(
        AppConfig.signupPath,
        data: {
          'name': trimmedName,
          'email': email,
          'password': password,
          'recaptchaToken': recaptchaToken,
        },
      );

      final accessToken = response.data['accessToken'] as String;
      final refreshToken = response.data['refreshToken'] as String;

      await _tokenStorage.saveAccessToken(accessToken);
      await _tokenStorage.saveRefreshToken(refreshToken);
      await _tokenStorage.saveIsVerified('false');
      await _tokenStorage.saveUserEmail(email);

      // Backend signup response may not include a 'user' object.
      // If absent, build a minimal unverified model from the email.
      UserModel user;
      if (response.data['user'] is Map<String, dynamic>) {
        user = UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
      } else {
        user = UserModel(
          id: '',
          email: email,
          isVerified: false,
          provider: 'local',
          createdAt: DateTime.now(),
        );
      }

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        isLoading: false,
      );
      return true;
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _extractErrorMessage(e),
      );
      return false;
    }
  }

  // ── Google Login ──────────────────────────────────────

  Future<void> googleLogin({required String idToken}) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final response = await _dio.post(
        AppConfig.googleLoginPath,
        data: {'idToken': idToken},
      );

      final accessToken = response.data['accessToken'] as String;
      final refreshToken = response.data['refreshToken'] as String;

      await _tokenStorage.saveTokens(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );

      // Backend google-login may omit fields — build safely.
      // Google users are always verified.
      UserModel user;
      if (response.data['user'] is Map<String, dynamic>) {
        user = UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
      } else {
        user = UserModel(
          id: '',
          email: '',
          isVerified: true,
          provider: 'google',
          createdAt: DateTime.now(),
        );
      }

      await _tokenStorage.saveUserEmail(user.email);

      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
        isLoading: false,
      );
    } on DioException catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _extractErrorMessage(e),
      );
    } catch (e) {
      // Catch parsing errors (TypeError etc.) so they don't crash silently
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Google Sign-In failed. Please try again.',
      );
    }
  }

  // ── Logout ────────────────────────────────────────────

  Future<void> logout() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final refreshToken = await _tokenStorage.getRefreshToken();
      if (refreshToken != null) {
        await _dio.post(
          AppConfig.logoutPath,
          data: {'refreshToken': refreshToken},
        );
      }
    } catch (_) {
      // Best effort — even if backend call fails, still clear local state
    } finally {
      await _tokenStorage.clearAll();
      await _tokenStorage.saveIsVerified('false');
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  // ── Force logout (called by interceptor on 403) ──────

  void _handleForceLogout() {
    _tokenStorage.clearAll();
    _tokenStorage.saveIsVerified('false');
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  // ── Update user after verification ────────────────────

  void updateUser(UserModel user) {
    state = state.copyWith(user: user);
  }

  // ── Clear error ───────────────────────────────────────

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  // ── Helpers ───────────────────────────────────────────

  String _extractErrorMessage(DioException e) {
    return ApiError.fromDioException(e).message;
  }
}

// ── Riverpod providers ──────────────────────────────────

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref);
});
