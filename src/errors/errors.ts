export class AppError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class CliConfigError extends AppError {}

export class NameParseError extends AppError {
  constructor(
    message: string,
    public readonly input: string,
  ) {
    super(message);
  }
}

export class FileAccessError extends AppError {
  constructor(
    public readonly operation: "read" | "write",
    public readonly path: string,
    cause?: unknown,
  ) {
    const baseMessage = `Failed to ${operation} file: ${path}`;
    super(cause instanceof Error ? `${baseMessage}. ${cause.message}` : baseMessage, {
      cause: cause instanceof Error ? cause : undefined,
    });
  }
}

export class RuntimeFailureError extends AppError {}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;

  const error = err instanceof Error ? err : new Error(String(err));
  return new RuntimeFailureError(error.message, { cause: error });
}
