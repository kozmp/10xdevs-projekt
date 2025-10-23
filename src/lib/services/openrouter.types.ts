/**
 * @fileoverview Type definitions for OpenRouter API integration.
 * This module contains interfaces and types for communicating with the OpenRouter API,
 * which provides access to various AI language models through a unified interface.
 *
 * @module openrouter.types
 */

/**
 * Configuration options for OpenRouter API client.
 *
 * @interface OpenRouterConfig
 * @property {string} apiKey - OpenRouter API key (required, obtain from openrouter.ai)
 * @property {string} [baseUrl] - Custom API base URL (default: "https://openrouter.ai/api/v1")
 * @property {string} [defaultModel] - Default AI model to use (default: "openai/gpt-4o-mini")
 * @property {number} [maxRetries] - Maximum number of retry attempts for failed requests (default: 3)
 * @property {number} [timeout] - Request timeout in milliseconds (default: 30000)
 *
 * @example
 * ```typescript
 * const config: OpenRouterConfig = {
 *   apiKey: process.env.OPENROUTER_API_KEY,
 *   defaultModel: "openai/gpt-4o-mini",
 *   maxRetries: 3,
 *   timeout: 60000
 * };
 * ```
 */
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Chat message structure for conversation with AI models.
 *
 * @interface Message
 * @property {"system" | "user" | "assistant"} role - Message sender role
 *   - "system": Instructions and context for the AI
 *   - "user": Messages from the end user
 *   - "assistant": Responses from the AI
 * @property {string} content - The actual message text
 *
 * @example
 * ```typescript
 * const messages: Message[] = [
 *   { role: "system", content: "You are a helpful assistant." },
 *   { role: "user", content: "What is TypeScript?" },
 *   { role: "assistant", content: "TypeScript is a typed superset of JavaScript..." }
 * ];
 * ```
 */
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Parameters for chat completion API requests.
 *
 * @interface ChatParams
 * @property {Message[]} messages - Array of conversation messages (required)
 * @property {string} [model] - AI model to use (overrides default model if specified)
 * @property {number} [temperature] - Randomness in responses (0.0-2.0, default: 0.7)
 *   - Lower values (0.0-0.5): More focused and deterministic
 *   - Higher values (0.8-2.0): More creative and random
 * @property {number} [max_tokens] - Maximum tokens in response (default: 1000)
 *
 * @example
 * ```typescript
 * const params: ChatParams = {
 *   messages: [
 *     { role: "user", content: "Explain quantum computing" }
 *   ],
 *   temperature: 0.7,
 *   max_tokens: 500
 * };
 * ```
 */
export interface ChatParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Response structure from OpenRouter chat completion API.
 *
 * @interface ChatResponse
 * @property {string} id - Unique identifier for this completion
 * @property {Object[]} choices - Array of completion choices (typically one)
 * @property {Message} choices[].message - The AI-generated message
 * @property {string} choices[].finish_reason - Reason completion ended (e.g., "stop", "length")
 * @property {Object} usage - Token usage statistics for billing/monitoring
 * @property {number} usage.prompt_tokens - Tokens used in the prompt
 * @property {number} usage.completion_tokens - Tokens used in the completion
 * @property {number} usage.total_tokens - Total tokens used (prompt + completion)
 *
 * @example
 * ```typescript
 * const response: ChatResponse = {
 *   id: "gen-123abc",
 *   choices: [{
 *     message: { role: "assistant", content: "Here is my response..." },
 *     finish_reason: "stop"
 *   }],
 *   usage: {
 *     prompt_tokens: 20,
 *     completion_tokens: 150,
 *     total_tokens: 170
 *   }
 * };
 * ```
 */
export interface ChatResponse {
  id: string;
  choices: {
    message: Message;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Configuration for structured JSON responses using JSON Schema.
 *
 * @interface ResponseFormat
 * @property {Object} response_format - Format configuration object
 * @property {"json_schema"} response_format.type - Response type (currently only "json_schema")
 * @property {Object} response_format.json_schema - JSON Schema definition
 * @property {string} response_format.json_schema.name - Schema name/identifier
 * @property {boolean} response_format.json_schema.strict - Enable strict schema validation
 * @property {Record<string, unknown>} response_format.json_schema.schema - JSON Schema object
 *
 * @remarks
 * Use this to enforce structured output from AI models, ensuring responses
 * match a specific format for easier parsing and validation.
 *
 * @example
 * ```typescript
 * const format: ResponseFormat = {
 *   response_format: {
 *     type: "json_schema",
 *     json_schema: {
 *       name: "product_description",
 *       strict: true,
 *       schema: {
 *         type: "object",
 *         properties: {
 *           title: { type: "string" },
 *           description: { type: "string" },
 *           price: { type: "number" }
 *         },
 *         required: ["title", "description"]
 *       }
 *     }
 *   }
 * };
 * ```
 */
export interface ResponseFormat {
  response_format: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

/**
 * Custom error class for OpenRouter API errors.
 *
 * @class OpenRouterError
 * @extends Error
 *
 * @property {string} name - Error name ("OpenRouterError")
 * @property {string} message - Error description
 * @property {string} code - Error code for programmatic handling
 * @property {number} [status] - HTTP status code if applicable
 *
 * @example
 * ```typescript
 * throw new OpenRouterError(
 *   "Invalid API key",
 *   "AUTH_ERROR",
 *   401
 * );
 * ```
 *
 * @remarks
 * Common error codes:
 * - VALIDATION_ERROR: Request parameters validation failed
 * - API_ERROR: General API error
 * - AUTH_ERROR: Authentication failed
 * - RATE_LIMIT: Rate limit exceeded (use RateLimitError instead)
 */
export class OpenRouterError extends Error {
  /**
   * Creates a new OpenRouterError instance.
   *
   * @constructor
   * @param {string} message - Human-readable error description
   * @param {string} code - Machine-readable error code
   * @param {number} [status] - HTTP status code (e.g., 400, 401, 500)
   */
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Specialized error for API rate limiting.
 *
 * @class RateLimitError
 * @extends OpenRouterError
 *
 * @property {number} [retryAfter] - Seconds to wait before retrying
 * @property {string} code - Always "RATE_LIMIT"
 * @property {number} status - Always 429
 *
 * @example
 * ```typescript
 * try {
 *   await service.chat(params);
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
 *     // Implement backoff strategy
 *   }
 * }
 * ```
 *
 * @remarks
 * When this error is thrown, the service's retry mechanism will NOT
 * automatically retry. You must handle rate limiting in your application code.
 * The retryAfter value comes from the "Retry-After" HTTP header if available.
 */
export class RateLimitError extends OpenRouterError {
  /**
   * Creates a new RateLimitError instance.
   *
   * @constructor
   * @param {number} [retryAfter] - Recommended wait time in seconds from API
   */
  constructor(public retryAfter?: number) {
    super("Rate limit exceeded", "RATE_LIMIT", 429);
  }
}
