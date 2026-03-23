/// Immutable model for the dashboard response.
///
/// Mirrors the backend `GET /api/dashboard` response:
/// ```json
/// {
///   "success": true,
///   "email": "user@example.com",
///   "isVerified": true,
///   "activeSessions": 2
/// }
/// ```
class DashboardModel {
  const DashboardModel({
    required this.email,
    required this.isVerified,
    required this.activeSessions,
  });

  /// User's email address.
  final String email;

  /// Whether the user has verified their email.
  final bool isVerified;

  /// Number of active refresh-token sessions across devices.
  final int activeSessions;

  // ── JSON serialisation ────────────────────────────────

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    return DashboardModel(
      email: json['email'] as String,
      isVerified: json['isVerified'] as bool? ?? false,
      activeSessions: json['activeSessions'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'isVerified': isVerified,
      'activeSessions': activeSessions,
    };
  }

  // ── copyWith ──────────────────────────────────────────

  DashboardModel copyWith({
    String? email,
    bool? isVerified,
    int? activeSessions,
  }) {
    return DashboardModel(
      email: email ?? this.email,
      isVerified: isVerified ?? this.isVerified,
      activeSessions: activeSessions ?? this.activeSessions,
    );
  }

  @override
  String toString() =>
      'DashboardModel(email: $email, isVerified: $isVerified, activeSessions: $activeSessions)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DashboardModel &&
          runtimeType == other.runtimeType &&
          email == other.email &&
          isVerified == other.isVerified &&
          activeSessions == other.activeSessions;

  @override
  int get hashCode => Object.hash(email, isVerified, activeSessions);
}
