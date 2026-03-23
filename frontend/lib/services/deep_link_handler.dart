import 'dart:async';
import 'package:app_links/app_links.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:test_app/router.dart';
import 'package:test_app/services/token_storage.dart';

/// Service to handle incoming deep links using the `app_links` package.
///
/// This listens for URIs like `myapp://reset-password?token=XYZ` or
/// web links (if configured on iOS/Android).
/// It forwards the URI to the `GoRouter` instance so the app can navigate.
class DeepLinkHandler {
  DeepLinkHandler._();
  static final DeepLinkHandler instance = DeepLinkHandler._();

  late AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;

  /// Call this once at app startup, after `router.dart` is initialised.
  void init(ProviderContainer container) {
    _appLinks = AppLinks();

    // 1. Handle any link that opened the app (Cold start)
    _handleInitialUri(container);

    // 2. Listen for deep links while the app is in the background/foreground
    _linkSubscription = _appLinks.uriLinkStream.listen((Uri? uri) {
      if (uri != null) {
        _handleUri(uri, container);
      }
    }, onError: (err) {
      debugPrint('Deep link error: $err');
    });
  }

  void dispose() {
    _linkSubscription?.cancel();
  }

  Future<void> _handleInitialUri(ProviderContainer container) async {
    try {
      final initialUri = await _appLinks.getInitialLink();
      if (initialUri != null) {
        // Slight delay ensures the router is fully mounted on cold starts
        Future.delayed(const Duration(milliseconds: 500), () {
          _handleUri(initialUri, container);
        });
      }
    } catch (err) {
      debugPrint('Failed to get initial deep link: $err');
    }
  }

  void _handleUri(Uri uri, ProviderContainer container) {
    debugPrint('Received deep link: $uri');

    // For custom schemes (myapp://), the first segment is parsed as the host.
    // For universal links (https://myapp.com/path), it's in the path.
    String routePath = uri.path;
    if (uri.scheme == 'myapp' && uri.host.isNotEmpty) {
      routePath = '/${uri.host}$routePath';
    }

    final query = uri.query;

    // Construct the GoRouter path: e.g. "/reset-password?token=123"
    final fullPath = query.isEmpty ? routePath : '$routePath?$query';

    // Guard against empty paths from weird link formatting
    if (fullPath.isEmpty || fullPath == '/') return;

    // Use the global navigator key configured in router.dart to navigate
    final router = container.read(routerProvider);

    // Handle verification redirects
    if (fullPath.startsWith('/reset-password')) {
      final token = uri.queryParameters['token'] ?? '';
      if (token.isNotEmpty) {
        router.go('/reset-password?token=$token');
      }
      return;
    }

    if (fullPath.startsWith('/dashboard')) {
      TokenStorage.instance.saveIsVerified('true').then((_) {
        router.go('/dashboard');
      });
      return;
    }
    
    if (fullPath.startsWith('/verification-pending')) {
      router.go('/verification-pending');
      return;
    }

    router.go(fullPath);
  }
}
