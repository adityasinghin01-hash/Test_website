# Test App — Flutter Frontend

Flutter frontend for the TestApp full-stack auth system.

## Prerequisites

- Flutter 3.24+
- Dart 3.5+
- Android Studio or VS Code
- Android/iOS device or emulator

## Installation

```bash
git clone https://github.com/adityasinghin01-hash/Test_app.git
cd Test_app/frontend
flutter pub get
```

## Configuration

Create a `.env` file in `frontend/`:

```dotenv
BASE_URL=https://backend-z6cy.onrender.com
```

All API endpoints are defined in `lib/config/app_config.dart`.

## Running the App

```bash
# Development
flutter run

# Build APK
flutter build apk --release

# Build iOS
flutter build ios --release
```

## Project Structure

```text
lib/
├── config/         # App config, theme, endpoints
├── interceptors/   # Auth interceptor (token refresh)
├── models/         # Data models
├── providers/      # Riverpod state management
├── router.dart     # GoRouter navigation
├── screens/        # All app screens
├── services/       # API service classes
└── utils/          # Validators and helpers
```

## Dependencies

See `pubspec.yaml`. Key packages:

- `flutter_riverpod` — state management
- `dio` — HTTP client
- `go_router` — navigation
- `flutter_secure_storage` — token storage
- `google_sign_in` — Google OAuth

## Testing

```bash
flutter test
```
