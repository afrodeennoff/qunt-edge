export interface SanitizedAiError {
  code: string | null;
  statusCode: number | null;
  type: string | null;
  message: string;
}

function toStringOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

export function getAiErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;
  const maybeCode = (error as { code?: unknown }).code;
  return toStringOrNull(maybeCode);
}

export function sanitizeAiError(error: unknown): SanitizedAiError {
  if (!error || typeof error !== "object") {
    return {
      code: null,
      statusCode: null,
      type: null,
      message: "Unknown error",
    };
  }

  const maybeError = error as {
    code?: unknown;
    status?: unknown;
    statusCode?: unknown;
    type?: unknown;
    message?: unknown;
  };

  const rawMessage = toStringOrNull(maybeError.message) ?? "Unknown error";

  return {
    code: toStringOrNull(maybeError.code),
    statusCode: toNumberOrNull(maybeError.statusCode) ?? toNumberOrNull(maybeError.status),
    type: toStringOrNull(maybeError.type),
    message: rawMessage.slice(0, 240),
  };
}

export function logAiError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  console.error(context, {
    ...(metadata ?? {}),
    error: sanitizeAiError(error),
  });
}

export function logAiWarn(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  console.warn(context, {
    ...(metadata ?? {}),
    error: sanitizeAiError(error),
  });
}

export function estimateTokenCountFromText(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateTokenCountFromMessages(
  messages: Array<{ content: string }>,
  completionText = "",
): number {
  const promptLength = messages.reduce((acc, message) => acc + (message.content?.length ?? 0), 0);
  return Math.max(1, Math.ceil((promptLength + completionText.length) / 4));
}
