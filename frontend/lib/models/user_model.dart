/// Immutable model representing the authenticated user.
///
/// Mirrors the backend `user` object returned by:
/// • `POST /api/signup`   → `response.data['user']`
/// • `POST /api/login`    → `response.data['user']`
/// • `POST /api/google-login` → `response.data['user']`
/// • `GET  /api/profile`  → `response.data['user']`
class UserModel {
  const UserModel({
    required this.id,
    required this.email,
    this.name,
    this.picture,
    required this.isVerified,
    required this.provider,
    required this.createdAt,
  });

  /// Unique user ID (MongoDB ObjectId string).
  final String id;

  /// User's email address.
  final String email;

  /// Display name (nullable — email/password users may not set one).
  final String? name;

  /// Profile picture URL (nullable — Google users get one automatically).
  final String? picture;

  /// Whether the user has verified their email.
  final bool isVerified;

  /// Auth provider: `'local'` or `'google'`.
  final String provider;

  /// Account creation timestamp.
  final DateTime createdAt;

  // ── JSON serialisation ────────────────────────────────

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? json['_id'] as String? ?? '',
      email: json['email'] as String,
      name: json['name'] as String?,
      picture: json['picture'] as String?,
      isVerified: json['isVerified'] as bool? ?? false,
      provider: json['provider'] as String? ?? 'local',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'picture': picture,
      'isVerified': isVerified,
      'provider': provider,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  // ── copyWith — handy for updating isVerified after verification ─

  UserModel copyWith({
    String? id,
    String? email,
    String? name,
    String? picture,
    bool? isVerified,
    String? provider,
    DateTime? createdAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      name: name ?? this.name,
      picture: picture ?? this.picture,
      isVerified: isVerified ?? this.isVerified,
      provider: provider ?? this.provider,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  String toString() =>
      'UserModel(id: $id, email: $email, isVerified: $isVerified, provider: $provider)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserModel && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode;
}
