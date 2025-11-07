export interface ErrorContext {
  [key: string]: unknown;
}

export const logError = (error: Error, context?: ErrorContext) => {
  if (process.env.NODE_ENV === "production") {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: context });
  } else {
    console.error("Error:", error, context);
  }
};

export const handleMutationError = (error: unknown): string => {
  if (error instanceof Error) {
    logError(error);
    return error.message;
  }
  return "An unexpected error occurred";
};

