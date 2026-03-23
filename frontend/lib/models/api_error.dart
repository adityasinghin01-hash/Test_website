import 'dart:io';

import 'package:dio/dio.dart';

/// Unified error model that every API call resolves to on failure.
///
/// Parses backend JSON errors like:
/// ```json
/// { "error": "Invalid credentials" }
/// { "error": "Validation failed", "details": { "email": "..." } }
/// ```
///
/// Also handles Dio-level failures (timeout, no internet, etc.)
/// so the UI never has to inspect raw [DioException]s.
class ApiError implements Exception {
  ApiError({
    required this.message,
    this.statusCode,
    this.details,
    this.type = ApiErrorType.unknown,
  });

  /// Human-readable message — safe to show in a SnackBar.
  final String message;

  /// HTTP status code (null for network-level errors).
  final int? statusCode;

  /// Optional field-level errors returned by the backend.
  /// e.g. `{ "email": "Already in use" }`
  final Map<String, dynamic>? details;

  /// Categorised error type for programmatic handling.
  final ApiErrorType type;

  // ── Factory: build from DioException ──────────────────

  /// The single entry point for converting any [DioException] into
  /// an [ApiError]. Call this in every service/provider catch block.
  factory ApiError.fromDioException(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiError(
          message: 'Connection timed out. Please try again.',
          type: ApiErrorType.timeout,
        );

      case DioExceptionType.connectionError:
        return ApiError(
          message: 'No internet connection. Check your network.',
          type: ApiErrorType.network,
        );

      case DioExceptionType.badResponse:
        return _parseResponse(e.response);

      case DioExceptionType.cancel:
        return ApiError(
          message: 'Request was cancelled.',
          type: ApiErrorType.cancelled,
        );

      case DioExceptionType.badCertificate:
        return ApiError(
          message: 'Security certificate error. Contact support.',
          type: ApiErrorType.network,
        );

      case DioExceptionType.unknown:
        // Catch SocketException wrapped inside DioException
        if (e.error is SocketException) {
          return ApiError(
            message: 'No internet connection. Check your network.',
            type: ApiErrorType.network,
          );
        }
        return ApiError(
          message: 'Something went wrong. Please try again.',
          type: ApiErrorType.unknown,
        );
    }
  }

  // ── Factory: build from generic exception ─────────────

  /// Fallback for non-Dio exceptions (should be rare).
  factory ApiError.fromException(Object e) {
    if (e is DioException) return ApiError.fromDioException(e);
    return ApiError(
      message: e.toString(),
      type: ApiErrorType.unknown,
    );
  }

  // ── Internal: parse a bad-response body ───────────────

  static ApiError _parseResponse(Response? response) {
    final statusCode = response?.statusCode;
    final data = response?.data;

    // Default message per status code
    String message = _defaultMessageForStatus(statusCode);

    Map<String, dynamic>? details;

    if (data is Map<String, dynamic>) {
      // Backend returns { "error": "..." } or { "message": "..." }
      message = (data['error'] ?? data['message'] ?? message) as String;
      // Optional field-level details
      if (data['details'] is Map<String, dynamic>) {
        details = data['details'] as Map<String, dynamic>;
      }
    } else if (data is String && data.isNotEmpty) {
      message = data;
    }

    return ApiError(
      message: message,
      statusCode: statusCode,
      details: details,
      type: _typeForStatus(statusCode),
    );
  }

  // ── Helpers ───────────────────────────────────────────

  static String _defaultMessageForStatus(int? code) {
    switch (code) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict — this resource already exists.';
      case 422:
        return 'Validation failed. Check your input.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  static ApiErrorType _typeForStatus(int? code) {
    switch (code) {
      case 401:
        return ApiErrorType.unauthorized;
      case 403:
        return ApiErrorType.forbidden;
      case 404:
        return ApiErrorType.notFound;
      case 409:
        return ApiErrorType.conflict;
      case 422:
        return ApiErrorType.validation;
      case 429:
        return ApiErrorType.rateLimited;
      case 500:
      case 503:
        return ApiErrorType.server;
      default:
        return ApiErrorType.unknown;
    }
  }

  @override
  String toString() => 'ApiError($statusCode): $message';
}

/// Categorised error types for programmatic handling in the UI.
///
/// Example usage:
/// ```dart
/// if (error.type == ApiErrorType.unauthorized) {
///   // force logout
/// }
/// ```
enum ApiErrorType {
  /// Network unreachable / no internet.
  network,

  /// Connect / send / receive timeout.
  timeout,

  /// 401 — token expired or invalid.
  unauthorized,

  /// 403 — forbidden (e.g. refresh token reuse).
  forbidden,

  /// 404 — endpoint or resource not found.
  notFound,

  /// 409 — duplicate resource (e.g. email already registered).
  conflict,

  /// 422 — validation errors with field-level details.
  validation,

  /// 429 — rate limited.
  rateLimited,

  /// 500 / 503 — server-side failure.
  server,

  /// Request was cancelled.
  cancelled,

  /// Anything else.
  unknown,
}
