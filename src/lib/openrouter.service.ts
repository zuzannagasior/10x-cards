import { OPENROUTER_BASE_URL } from "astro:env/server";
import fetch from "node-fetch";

import {
  AuthenticationError,
  NetworkError,
  RateLimitError,
  ResponseFormatError,
  ServerError,
} from "./openrouter.types";

import type {
  ChatResponse,
  Message,
  ModelParams,
  OpenRouterConfig,
  ResponseFormat,
  ResponseFormatSchema,
} from "./openrouter.types";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private defaultModel: string;
  private defaultParams: ModelParams;
  private systemMessage: string;
  private responseFormat: ResponseFormatSchema;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 second

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new AuthenticationError("API key is required");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel || "gpt-4o-mini";
    this.defaultParams = config.defaultParams || {
      temperature: 0.7,
      max_tokens: 1024,
    };
    this.systemMessage = "";
    this.responseFormat = {
      name: "name",
      schema: {},
    };
  }

  // Public methods
  public async sendChat(message: string): Promise<ChatResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const payload = this.buildPayload(message);
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            // TODO: Remove this once we have a proper domain
            // "HTTP-Referer": "https://10xcards.com",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return this.validateResponse(data);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on authentication errors or invalid requests
        if (lastError.message.includes("401") || lastError.message.includes("400")) {
          this.handleError(lastError);
        }

        // Only retry on network errors or server errors
        if (
          attempt < this.maxRetries - 1 &&
          (lastError.message.includes("Failed to fetch") ||
            lastError.message.includes("Network") ||
            lastError.message.includes("5"))
        ) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay * Math.pow(2, attempt)));
          continue;
        }

        this.handleError(lastError);
      }
    }

    // This should never be reached due to handleError throwing, but TypeScript needs it
    throw lastError || new Error("Unknown error occurred");
  }

  // Public setter methods
  public setSystemMessage(message: string): void {
    this.systemMessage = message;
  }

  public setModel(model: string, parameters?: ModelParams): void {
    if (!model) {
      throw new Error("Model name is required");
    }
    this.defaultModel = model;
    if (parameters) {
      this.defaultParams = parameters;
    }
  }

  public getModel(): { model: string; parameters: ModelParams } {
    return {
      model: this.defaultModel || "gpt-4o-mini",
      parameters: this.defaultParams,
    };
  }

  public setResponseFormat(format: ResponseFormatSchema): void {
    if (!format) {
      throw new ResponseFormatError("Invalid response format");
    }
    this.responseFormat = format;
  }

  private buildPayload(message: string): {
    messages: Message[];
    model: string;
    parameters: ModelParams;
    response_format: ResponseFormat;
  } {
    const messages: Message[] = [];

    if (this.systemMessage) {
      messages.push({
        role: "system",
        content: this.systemMessage,
      });
    }

    messages.push({
      role: "user",
      content: message,
    });

    const responseFormat = {
      type: "json_schema" as const,
      json_schema: this.responseFormat,
    };

    return {
      messages,
      model: this.defaultModel,
      parameters: this.defaultParams,
      response_format: responseFormat,
    };
  }

  private validateResponse(data: unknown): ChatResponse {
    if (!data || typeof data !== "object") {
      throw new ResponseFormatError("Response must be an object");
    }

    const response = data as Record<string, unknown>;

    if (!response.choices || !Array.isArray(response.choices) || !response.choices[0]) {
      throw new ResponseFormatError("Response must contain choices array");
    }

    const choice = response.choices[0] as Record<string, unknown>;

    if (!choice.message || typeof choice.message !== "object") {
      throw new ResponseFormatError("Response must contain a message object");
    }

    const message = choice.message as Record<string, unknown>;

    if (!message.content || typeof message.content !== "string") {
      throw new ResponseFormatError("Message must contain content string");
    }

    return {
      message: message.content,
    };
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      if (error.message.includes("401")) {
        throw new AuthenticationError("Invalid API key");
      }
      if (error.message.includes("429")) {
        throw new RateLimitError();
      }
      if (error.message.includes("5")) {
        throw new ServerError();
      }
      if (error.message.includes("Failed to fetch") || error.message.includes("Network")) {
        throw new NetworkError();
      }
      if (error instanceof ResponseFormatError) {
        throw error;
      }
    }

    throw new Error("An unexpected error occurred");
  }
}
