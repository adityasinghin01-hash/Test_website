import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:test_app/config/app_config.dart';
import 'package:test_app/models/api_error.dart';
import 'package:test_app/providers/auth_provider.dart';
import 'package:test_app/services/api_client.dart';
import 'package:test_app/services/token_storage.dart';
import 'package:test_app/services/verification_service.dart';

/// Verification pending screen — shown after signup.
///
/// • Polls `GET /api/check-verification-status` every 5 seconds.
/// • Allows the user to resend the verification email.
/// • Auto-navigates to `/dashboard` once verified.
class VerificationPendingScreen extends ConsumerStatefulWidget {
  const VerificationPendingScreen({super.key});

  @override
  ConsumerState<VerificationPendingScreen> createState() =>
      _VerificationPendingScreenState();
}

class _VerificationPendingScreenState
    extends ConsumerState<VerificationPendingScreen>
    with WidgetsBindingObserver {
  Timer? _pollTimer;
  bool _isResending = false;
  bool _resendSuccess = false;
  String? _userEmail;
  int _resendCooldown = 0;
  Timer? _cooldownTimer;

  bool _isInitialLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadEmailAndStartPolling();
    
    // Show the gorgeous loading state for 2.5 seconds
    Future.delayed(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() {
          _isInitialLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _pollTimer?.cancel();
    _cooldownTimer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      // App going to background — stop polling
      _pollTimer?.cancel();
      _pollTimer = null;
    } else if (state == AppLifecycleState.resumed) {
      // App coming back — restart polling
      if (_userEmail != null && _pollTimer == null) {
        _startPolling();
      }
    }
  }

  // ── Init ───────────────────────────────────────────────

  Future<void> _loadEmailAndStartPolling() async {
    // Get email from auth state or token storage
    final authState = ref.read(authProvider);
    _userEmail = authState.user?.email ??
        await TokenStorage.instance.getUserEmail();

    if (_userEmail == null) {
      // No email found — shouldn't happen, send back to login
      if (mounted) context.go('/login');
      return;
    }

    setState(() {});
    _startPolling();
  }

  // ── Polling ────────────────────────────────────────────

  void _startPolling() {
    // Poll immediately, then every 5 seconds
    _checkVerification();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      _checkVerification();
    });
  }

  Future<void> _checkVerification() async {
    if (_userEmail == null) return;

    try {
      final response = await VerificationService.instance
          .checkVerificationStatus(email: _userEmail!);

      final isVerified = response.data['isVerified'] as bool? ?? false;

      if (isVerified && mounted) {
        _pollTimer?.cancel();

        // 1. Silently get a fresh token containing isVerified: true
        //    Otherwise the router will block dashboard access with the old token
        final refreshToken = await TokenStorage.instance.getRefreshToken();
        if (refreshToken != null) {
          try {
            final refreshResponse = await ApiClient.instance.dio.post(
              AppConfig.refreshTokenPath,
              data: {'refreshToken': refreshToken},
            );

            await TokenStorage.instance.saveTokens(
              accessToken: refreshResponse.data['accessToken'],
              refreshToken: refreshResponse.data['refreshToken'],
            );
            await TokenStorage.instance.saveIsVerified('true');
          } catch (_) {
            // If refresh fails, they logged out elsewhere — go to login
            if (mounted) context.go('/login');
            return;
          }
        } else {
          if (mounted) context.go('/login');
          return;
        }

        if (!mounted) return;

        // 2. Update the user model in auth state
        final currentUser = ref.read(authProvider).user;
        if (currentUser != null) {
          ref
              .read(authProvider.notifier)
              .updateUser(currentUser.copyWith(isVerified: true));
        }

        // 3. Finally navigate to dashboard
        context.go('/dashboard');
      }
    } on DioException catch (_) {
      // Silently ignore polling network errors — will retry in 5 seconds
    }
  }

  // ── Resend ─────────────────────────────────────────────

  Future<void> _handleResend() async {
    if (_userEmail == null || _isResending || _resendCooldown > 0) return;

    setState(() {
      _isResending = true;
      _resendSuccess = false;
    });

    try {
      await VerificationService.instance
          .resendVerification(email: _userEmail!);

      if (mounted) {
        setState(() {
          _isResending = false;
          _resendSuccess = true;
          _resendCooldown = 60; // 60-second cooldown
        });
        _startCooldown();
      }
    } on DioException catch (e) {
      if (mounted) {
        setState(() => _isResending = false);
        final error = ApiError.fromDioException(e);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(error.message),
            backgroundColor: Colors.redAccent,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }
  }

  void _startCooldown() {
    _cooldownTimer?.cancel();
    _cooldownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) {
        setState(() {
          _resendCooldown--;
          if (_resendCooldown <= 0) {
            timer.cancel();
            _resendSuccess = false;
          }
        });
      } else {
        timer.cancel();
      }
    });
  }

  // ── Build ──────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF16213E),
              Color(0xFF0F3460),
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              children: [
                const Spacer(flex: 2),

                if (_isInitialLoading) ...[
                  // ── Sending Email Animation ─────────────────
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF3F8EFC)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withValues(alpha: 0.3),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 44,
                        height: 44,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ),
                  )
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .scaleXY(
                        begin: 0.8,
                        end: 1.0,
                        curve: Curves.easeOutBack,
                        duration: 600.ms,
                      ),

                  const SizedBox(height: 36),

                  Text(
                    'Sending Email...',
                    style: GoogleFonts.outfit(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 12),

                  Text(
                    'We\'re sending your verification email,\nplease wait...',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      color: Colors.white.withValues(alpha: 0.6),
                      height: 1.5,
                    ),
                  ).animate().fadeIn(delay: 300.ms),
                ] else ...[
                  // ── Mail Icon ────────────────────────────────
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6C63FF), Color(0xFF3F8EFC)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6C63FF).withValues(alpha: 0.3),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.mark_email_unread_rounded,
                      size: 44,
                      color: Colors.white,
                    ),
                  )
                      .animate(onPlay: (c) => c.repeat(reverse: true))
                      .scaleXY(
                        begin: 1.0,
                        end: 1.05,
                        duration: 2000.ms,
                        curve: Curves.easeInOut,
                      ),

                  const SizedBox(height: 36),

                  // ── Title ────────────────────────────────────
                  Text(
                    'Check Your Email',
                    style: GoogleFonts.outfit(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 12),

                  // ── Subtitle ─────────────────────────────────
                  Text(
                    _userEmail != null
                        ? 'We sent a verification link to\n$_userEmail'
                        : 'We sent a verification link to your email',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      color: Colors.white.withValues(alpha: 0.5),
                      height: 1.5,
                    ),
                  ).animate().fadeIn(delay: 100.ms),

                  const SizedBox(height: 40),

                  // ── Status Card ──────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.08),
                      ),
                    ),
                    child: Column(
                      children: [
                        // Polling indicator
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  const Color(0xFF6C63FF).withValues(alpha: 0.7),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Waiting for verification…',
                              style: GoogleFonts.inter(
                                fontSize: 14,
                                color: Colors.white.withValues(alpha: 0.6),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),

                        // Resend button
                        if (_resendSuccess && _resendCooldown > 0) ...[
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.check_circle_rounded,
                                color: Color(0xFF4CAF50),
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Email sent! Resend in ${_resendCooldown}s',
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  color: const Color(0xFF4CAF50),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ] else ...[
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: OutlinedButton(
                              onPressed: (_isResending || _resendCooldown > 0)
                                  ? null
                                  : _handleResend,
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF6C63FF),
                                side: BorderSide(
                                  color: const Color(0xFF6C63FF)
                                      .withValues(alpha: 0.3),
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(14),
                                ),
                              ),
                              child: _isResending
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          Color(0xFF6C63FF),
                                        ),
                                      ),
                                    )
                                  : Text(
                                      'Resend Verification Email',
                                      style: GoogleFonts.inter(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.1, end: 0),

                  const Spacer(flex: 2),

                  // ── Back to Login ────────────────────────────
                  TextButton(
                    onPressed: () async {
                      _pollTimer?.cancel();
                      await ref.read(authProvider.notifier).logout();
                      if (context.mounted) context.go('/login');
                    },
                    child: Text(
                      'Back to Login',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: Colors.white.withValues(alpha: 0.4),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
