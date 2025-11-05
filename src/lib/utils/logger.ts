/**
 * Structured Logger for AI Product Description Generator
 *
 * Security-focused logging utility that:
 * - Prevents credential leakage in production
 * - Sanitizes sensitive data (API keys, tokens, passwords)
 * - Supports different log levels
 * - Integrates with monitoring systems (Sentry)
 * - Disables debug/info logs in production
 *
 * Usage:
 * ```ts
 * import { logger } from '@/lib/utils/logger';
 *
 * logger.debug('Debug info', { userId: 123 });
 * logger.info('Operation completed');
 * logger.warn('Warning message', { context: 'details' });
 * logger.error('Error occurred', error);
 * ```
 */

/**
 * Sensitive keys that should be redacted from logs
 */
const SENSITIVE_KEYS = [
  "password",
  "token",
  "apiKey",
  "api_key",
  "secret",
  "authorization",
  "cookie",
  "session",
  "credentials",
  "accessToken",
  "refreshToken",
  "shopify_access_token",
  "openrouter_api_key",
  "encryption_key",
  "supabase_key",
];

/**
 * Sanitizes objects by redacting sensitive information
 */
function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Check if string looks like a token/key
    if (data.length > 20 && /^[A-Za-z0-9_-]+$/.test(data)) {
      return "[REDACTED]";
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitize(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Format log message with timestamp and context
 */
function formatMessage(level: string, message: string, context?: unknown): string {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitize(context) : undefined;
  const contextStr = sanitizedContext ? ` ${JSON.stringify(sanitizedContext)}` : "";
  return `[${timestamp}] [${level}] ${message}${contextStr}`;
}

/**
 * Check if we're in development environment
 */
function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.MODE === "development";
}

/**
 * Check if we're in test environment
 */
function isTest(): boolean {
  return import.meta.env.MODE === "test" || process?.env?.NODE_ENV === "test";
}

/**
 * Structured Logger Interface
 */
export const logger = {
  /**
   * Debug: Detailed information for debugging (disabled in production)
   */
  debug: (message: string, context?: unknown): void => {
    if (isDevelopment() || isTest()) {
      const formatted = formatMessage("DEBUG", message, context);
      console.log(formatted);
    }
  },

  /**
   * Info: General informational messages (disabled in production)
   */
  info: (message: string, context?: unknown): void => {
    if (isDevelopment() || isTest()) {
      const formatted = formatMessage("INFO", message, context);
      console.info(formatted);
    }
  },

  /**
   * Warn: Warning messages that should be investigated
   */
  warn: (message: string, context?: unknown): void => {
    const formatted = formatMessage("WARN", message, context);
    console.warn(formatted);

    // TODO: Send to Sentry in production
    // if (!isDevelopment() && !isTest()) {
    //   Sentry.captureMessage(formatted, 'warning');
    // }
  },

  /**
   * Error: Error messages that require attention
   */
  error: (message: string, error?: Error | unknown, context?: unknown): void => {
    const formatted = formatMessage("ERROR", message, { error, ...context });
    console.error(formatted);

    // TODO: Send to Sentry in production
    // if (!isDevelopment() && !isTest()) {
    //   if (error instanceof Error) {
    //     Sentry.captureException(error, { extra: context });
    //   } else {
    //     Sentry.captureMessage(formatted, 'error');
    //   }
    // }
  },

  /**
   * Metric: Log performance metrics (for monitoring)
   */
  metric: (metricName: string, value: number, context?: unknown): void => {
    if (isDevelopment() || isTest()) {
      const formatted = formatMessage("METRIC", `${metricName}=${value}`, context);
      console.log(formatted);
    }

    // TODO: Send to monitoring system (Supabase Metrics)
    // if (!isDevelopment() && !isTest()) {
    //   // Send to Supabase Metrics or similar
    // }
  },

  /**
   * Audit: Log security-relevant events (always logged)
   */
  audit: (event: string, userId?: string, context?: unknown): void => {
    const formatted = formatMessage("AUDIT", event, { userId, ...context });
    console.log(formatted);

    // TODO: Persist to database for audit trail (FR-048: System logs all operations)
    // Always log audit events to database, never just to console
  },
};

/**
 * Export sanitize function for testing
 */
export { sanitize };
