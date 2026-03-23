import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wraps [FlutterSecureStorage] with app-specific keys.
///
/// • iOS  → Keychain (hardware-encrypted)
/// • Android → EncryptedSharedPreferences (AES-256)
///
/// Also keeps an **in-memory cache** of the access token so the
/// [AuthInterceptor] can read it synchronously on every request
/// without hitting the native bridge each time.
class TokenStorage {
  TokenStorage._();
  static final TokenStorage instance = TokenStorage._();

  final FlutterSecureStorage _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  // ── Storage keys ──────────────────────────────────────
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _userEmailKey = 'user_email';

  // ── In-memory cache ───────────────────────────────────
  String? _cachedAccessToken;

  /// Returns the cached access token **synchronously**.
  /// Call [getAccessToken] at least once (e.g. on app start) to prime the cache.
  String? get cachedAccessToken => _cachedAccessToken;

  // ── Tokens ────────────────────────────────────────────

  /// Persist both tokens and update the in-memory cache.
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    _cachedAccessToken = accessToken;
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }

  Future<void> saveAccessToken(String token) async {
    _cachedAccessToken = token;
    await _storage.write(key: _accessTokenKey, value: token);
  }

  Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _refreshTokenKey, value: token);
  }

  Future<void> saveIsVerified(String value) async {
    await _storage.write(key: 'isVerified', value: value);
  }

  Future<String?> getIsVerified() async {
    return await _storage.read(key: 'isVerified');
  }

  /// Read the access token from secure storage and prime the cache.
  Future<String?> getAccessToken() async {
    _cachedAccessToken = await _storage.read(key: _accessTokenKey);
    return _cachedAccessToken;
  }

  /// Read the refresh token from secure storage.
  Future<String?> getRefreshToken() async {
    return _storage.read(key: _refreshTokenKey);
  }

  /// Quick check — do we have stored tokens?
  Future<bool> hasTokens() async {
    final access = await _storage.read(key: _accessTokenKey);
    final refresh = await _storage.read(key: _refreshTokenKey);
    return access != null && refresh != null;
  }

  // ── User email (for UX — e.g. verification screen) ───

  Future<void> saveUserEmail(String email) async {
    await _storage.write(key: _userEmailKey, value: email);
  }

  Future<String?> getUserEmail() async {
    return _storage.read(key: _userEmailKey);
  }

  // ── Logout ────────────────────────────────────────────

  /// Wipe everything — tokens + cached email. Called on logout
  /// and on "token reuse detected" (403).
  Future<void> clearAll() async {
    _cachedAccessToken = null;
    await _storage.deleteAll();
  }
}
