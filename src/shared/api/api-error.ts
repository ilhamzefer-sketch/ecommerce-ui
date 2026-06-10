export type ApiErrorDetails = Record<string, string>;

export class ApiError extends Error {
  readonly status: number;
  readonly details?: ApiErrorDetails;
  readonly isNetworkError: boolean;

  constructor(message: string, status = 0, details?: ApiErrorDetails, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.isNetworkError = isNetworkError;
  }
}

export function getFriendlyErrorMessage(error: unknown, fallback = "Əməliyyatı tamamlamaq mümkün olmadı.") {
  if (error instanceof ApiError) {
    if (error.isNetworkError) {
      return "Serverlə əlaqə qurmaq mümkün olmadı. Zəhmət olmasa bir az sonra yenidən cəhd edin.";
    }
    if (error.status === 401) {
      return "Sessiyanız bitib. Zəhmət olmasa yenidən daxil olun.";
    }
    if (error.status === 403) {
      return "Bu səhifəyə giriş icazəniz yoxdur.";
    }
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
