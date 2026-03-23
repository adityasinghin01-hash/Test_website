import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:test_app/config/theme.dart';
import 'package:test_app/router.dart';
import 'package:test_app/services/api_client.dart';
import 'package:test_app/services/deep_link_handler.dart';

void main() async {
  // 1. Ensure Flutter binding is initialized before async setup
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Lock orientation to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  // 3. Load environment variables
  await dotenv.load(fileName: ".env");

  // 4. Initialize API singletons
  ApiClient.instance.init();
  unawaited(ApiClient.instance.warmUp());

  // 5. Create the Riverpod container to manually manage some early state
  final container = ProviderContainer();

  // 6. Initialize AppLinks listening for deep links
  DeepLinkHandler.instance.init(container);

  // 7. Run the app, injecting the ProviderContainer
  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const MainApp(),
    ),
  );
}

class MainApp extends ConsumerWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch the router provider so it updates automatically when auth state changes
    final goRouter = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Test App',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      
      // GoRouter Configuration
      routerConfig: goRouter,
      
      // Allow builder if we needed global overlays later
      builder: (context, child) {
        return child ?? const SizedBox.shrink();
      },
    );
  }
}
