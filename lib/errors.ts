export interface ErrorContext {
  [key: string]: unknown;
}

export const logError = (error: Error, context?: ErrorContext) => {
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: context });
    console.error("Error:", error.message, context);
  } else {
    console.error("Error:", error, context);
  }
};

export const handleMutationError = (error: unknown): string => {
  if (error instanceof Error) {
    logError(error);
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

