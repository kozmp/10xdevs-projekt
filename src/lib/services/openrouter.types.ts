export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: Message[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

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

export interface ResponseFormat {
  response_format: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, any>;
    };
  };
}

// Custom error classes
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class RateLimitError extends OpenRouterError {
  constructor(public retryAfter?: number) {
    super("Rate limit exceeded", "RATE_LIMIT", 429);
  }
}
