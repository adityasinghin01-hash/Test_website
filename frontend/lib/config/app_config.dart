import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Central configuration — every API path lives here.
/// The base URL comes from .env so it's never hardcoded.
class AppConfig {
  AppConfig._();

  // ── Base URL ──────────────────────────────────────────
  static String get baseUrl =>
      dotenv.env['BASE_URL'] ?? 'https://backend-z6cy.onrender.com';

  // ── Auth endpoints ────────────────────────────────────
  static const String signupPath = '/api/signup';
  static const String loginPath = '/api/login';
  static const String logoutPath = '/api/logout';
  static const String refreshTokenPath = '/api/refresh-token';
  static const String googleLoginPath = '/api/google-login';

  // ── Email verification ────────────────────────────────
  static const String verifyEmailPath = '/api/verify-email';
  static const String resendVerificationPath = '/api/resend-verification';
  static const String checkVerificationStatusPath =
      '/api/check-verification-status';

  // ── Password reset ────────────────────────────────────
  static const String forgotPasswordPath = '/api/forgot-password';
  static const String resetPasswordPath = '/api/reset-password';
  static const String sendOtpPath = '/api/send-otp';
  static const String verifyOtpPath = '/api/verify-otp';

  // ── Protected resources ───────────────────────────────
  static const String profilePath = '/api/profile';
  static const String dashboardPath = '/api/dashboard';

  // ── Health ────────────────────────────────────────────
  static const String healthPath = '/api/health';

  // ── Deep link scheme ──────────────────────────────────
  static const String deepLinkScheme = 'myapp';

  // ── reCAPTCHA ─────────────────────────────────────────
  /// Test site key — always passes. Swap for production key later.
  static const String recaptchaSiteKey =
      '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  // ── Timeouts ──────────────────────────────────────────
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
