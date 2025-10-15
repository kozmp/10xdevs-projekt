import { z } from "zod";
import { encrypt, decrypt } from "@/lib/encryption";
import {
  OpenRouterConfig,
  Message,
  ChatParams,
  ChatResponse,
  ResponseFormat,
  OpenRouterError,
  RateLimitError
} from "./openrouter.types";

// Validation schemas
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
  private async getEncryptedApiKey(): Promise<string> {
    return await encrypt(this.apiKey);
  }

  private async validateRequest(params: ChatParams): Promise<void> {
    try {
      await chatParamsSchema.parseAsync(params);
    } catch (error) {
      throw new OpenRouterError(
        "Invalid request parameters",
        "VALIDATION_ERROR",
        400
      );
    }
  }

  private formatMessages(messages: Message[]): Message[] {
    const formattedMessages = [...messages];
    
    if (this.systemMessage && !messages.some(msg => msg.role === "system")) {
      formattedMessages.unshift({
        role: "system",
        content: this.systemMessage
      });
    }

    return formattedMessages;
  }

  private async handleResponse(response: Response): Promise<ChatResponse> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "0");
        throw new RateLimitError(retryAfter);
      }

      throw new OpenRouterError(
        error.message || "API request failed",
        error.code || "API_ERROR",
        response.status
      );
    }

    return await response.json();
  }

  private async retryWithBackoff(
    fn: () => Promise<any>,
    attempt: number = 0
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (
        attempt >= this.maxRetries ||
        !(error instanceof OpenRouterError) ||
        error instanceof RateLimitError
      ) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.retryWithBackoff(fn, attempt + 1);
    }
  }
}
