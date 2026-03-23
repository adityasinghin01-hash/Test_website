// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:test_app/main.dart';

void main() {
  testWidgets('App launches without crashing', (WidgetTester tester) async {
    // Build our app inside a ProviderScope and trigger a frame.
    // Note: Full integration tests should be done with flutter_test + mocked
    // services. This is just a smoke test that the widget tree mounts.
    await tester.pumpWidget(
      const ProviderScope(child: MainApp()),
    );
    // The app starts on the SplashScreen, so just verify it doesn't crash.
    expect(find.byType(MainApp), findsOneWidget);
  });
}
