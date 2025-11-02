/**
 * @fileoverview OpenRouter API service for AI chat completions.
 * Provides a robust client for interacting with OpenRouter's AI models with
 * automatic retries, validation, and error handling.
 *
 * @module openrouter.service
 */

import { z } from "zod";
import {
  OpenRouterConfig,
  Message,
  ChatParams,
  ChatResponse,
  ResponseFormat,
  OpenRouterError,
  RateLimitError,
} from "./openrouter.types";

/**
 * Zod schema for validating chat parameters.
 * @internal
 */
const chatParamsSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    })
  ),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().positive().optional(),
});

/**
 * Service for communicating with OpenRouter API.
 *
 * This service provides a high-level interface for AI chat completions with:
 * - Automatic request validation using Zod schemas
 * - Exponential backoff retry mechanism for failed requests
 * - Rate limit handling with retry-after support
 * - System message and response format configuration
 * - Comprehensive error handling and logging
 *
 * @class OpenRouterService
 *
 * @example
 * ```typescript
 * const service = new OpenRouterService({
 *   apiKey: process.env.OPENROUTER_API_KEY,
 *   defaultModel: "openai/gpt-4o-mini",
 *   maxRetries: 3,
 *   timeout: 60000
 * });
 *
 * // Set system instructions
 * service.setSystemMessage("You are a helpful coding assistant.");
 *
 * // Make a chat request
 * const response = await service.chat({
 *   messages: [
 *     { role: "user", content: "Explain TypeScript interfaces" }
 *   ],
 *   temperature: 0.7
 * });
 *
 * console.log(response.choices[0].message.content);
 * ```
 *
 * @see {@link OpenRouterConfig} for configuration options
 * @see {@link ChatParams} for request parameters
 * @see {@link ChatResponse} for response structure
 */
export class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private maxRetries: number;
  private timeout: number;
  private systemMessage?: string;
  private responseFormat?: ResponseFormat["response_format"];

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini";
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 30000;
  }

  // Public configuration methods
  public setModel(model: string): void {
    this.defaultModel = model;
  }

  public setSystemMessage(message: string): void {
    this.systemMessage = message;
  }

  public setResponseFormat(format: ResponseFormat["response_format"]): void {
    this.responseFormat = format;
  }

  // Private helper methods
  private async validateRequest(params: ChatParams): Promise<void> {
    try {
      await chatParamsSchema.parseAsync(params);
    } catch {
      throw new OpenRouterError("Invalid request parameters", "VALIDATION_ERROR", 400);
    }
  }

  private formatMessages(messages: Message[]): Message[] {
    const formattedMessages = [...messages];

    if (this.systemMessage && !messages.some((msg) => msg.role === "system")) {
      formattedMessages.unshift({
        role: "system",
        content: this.systemMessage,
      });
    }

    return formattedMessages;
  }

  private async handleResponse(response: Response): Promise<ChatResponse> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error,
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "0");
        throw new RateLimitError(retryAfter);
      }

      throw new OpenRouterError(error.message || "API request failed", error.code || "API_ERROR", response.status);
    }

    return await response.json();
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries || !(error instanceof OpenRouterError) || error instanceof RateLimitError) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this.retryWithBackoff(fn, attempt + 1);
    }
  }

  public async chat(params: ChatParams): Promise<ChatResponse> {
    await this.validateRequest(params);

    const messages = this.formatMessages(params.messages);
    const requestBody = {
      messages,
      model: params.model || this.defaultModel,
      temperature: params.temperature || 0.7,
      max_tokens: params.max_tokens || 1000,
      response_format: this.responseFormat,
    };

    return this.retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      return this.handleResponse(response);
    });
  }
}
