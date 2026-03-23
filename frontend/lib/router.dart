import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:test_app/providers/auth_provider.dart';
import 'package:test_app/screens/dashboard_screen.dart';
import 'package:test_app/services/token_storage.dart';
import 'package:test_app/screens/forgot_password_screen.dart';
import 'package:test_app/screens/login_screen.dart';
import 'package:test_app/screens/profile_screen.dart';
import 'package:test_app/screens/reset_password_screen.dart';
import 'package:test_app/screens/signup_screen.dart';
import 'package:test_app/screens/splash_screen.dart';
import 'package:test_app/screens/verification_pending_screen.dart';
import 'package:test_app/screens/otp_verification_screen.dart';

// ── Global Navigator Key ────────────────────────────────
final rootNavigatorKey = GlobalKey<NavigatorState>();

// ── Auth Listenable ─────────────────────────────────────
// Wraps authProvider so GoRouter can listen to it WITHOUT
// recreating the entire router on every state change.
class _AuthNotifierListenable extends ChangeNotifier {
  _AuthNotifierListenable(this.ref) {
    ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }
  final Ref ref;
  AuthState get authState => ref.read(authProvider);
}

final routerProvider = Provider<GoRouter>((ref) {
  final listenable = _AuthNotifierListenable(ref);

  return GoRouter(
    navigatorKey: rootNavigatorKey,
    initialLocation: '/',
    refreshListenable: listenable,

    // ── Redirect Logic ──────────────────────────────────
    redirect: (context, state) {
      final authState = listenable.authState;
      final isAuth = authState.status == AuthStatus.authenticated;
      final isUnauth = authState.status == AuthStatus.unauthenticated;
      final isUnknown = authState.status == AuthStatus.unknown;
      final isLoading = authState.isLoading;

      final path = state.uri.path;
      final isNavigatingToAuth = path == '/login' ||
          path == '/signup' ||
          path == '/forgot-password' ||
          path == '/reset-password' ||
          path == '/otp-verification' ||
          path == '/verification-pending';

      // 1. App is starting up OR loading → stay put, no redirect
      if (isUnknown || isLoading) return null;

      // 2. Unauthenticated → protect routes
      if (isUnauth && !isNavigatingToAuth && path != '/') {
        return '/login';
      }

      // 3. Authenticated user logic
      if (isAuth) {
        final bool userKnownUnverified =
            authState.user != null && authState.user!.isVerified == false;
        final bool userKnownVerified =
            authState.user != null && authState.user!.isVerified == true;

        // Unverified → lock to verification screen
        if (userKnownUnverified && path != '/verification-pending') {
          return '/verification-pending';
        }

        // Verified → kick off auth/splash screens to dashboard
        if (userKnownVerified &&
            (isNavigatingToAuth ||
                path == '/verification-pending' ||
                path == '/')) {
          return '/dashboard';
        }
      }

      return null;
    },

    // ── Routes ──────────────────────────────────────────
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),
      GoRoute(
        path: '/forgot-password',
        builder: (context, state) => const ForgotPasswordScreen(),
      ),
      GoRoute(
        path: '/reset-password',
        builder: (context, state) {
          // Accepts token from GoRouter extra (OTP flow) OR query param (deep link fallback)
          final token = (state.extra as String?) ??
              state.uri.queryParameters['token'] ??
              '';
          return ResetPasswordScreen(token: token);
        },
      ),
      GoRoute(
        path: '/otp-verification',
        builder: (context, state) {
          final email = (state.extra as String?) ?? '';
          return OtpVerificationScreen(email: email);
        },
      ),
      GoRoute(
        path: '/verification-pending',
        builder: (context, state) => const VerificationPendingScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
        redirect: (context, state) async {
          final token = await TokenStorage.instance.getAccessToken();
          if (token == null) return '/login';
          try {
            final decoded = JwtDecoder.decode(token);
            if (decoded['isVerified'] != true) return '/verification-pending';
          } catch (_) {
            return '/login';
          }
          return null;
        },
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
    ],
  );
});
