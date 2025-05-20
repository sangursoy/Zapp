export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred');
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof Error && (
    error.message.includes('network') ||
    error.message.includes('Network') ||
    error.message.includes('Failed to fetch')
  );
}

export function formatErrorMessage(error: unknown): string {
  const appError = handleError(error);
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  return appError.message;
}