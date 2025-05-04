export interface ModelParams {
  temperature?: number;
  max_tokens?: number;
  // Add other model parameters as needed
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: ModelParams;
}

export interface ResponseFormatSchema {
  name: string;
  schema: Record<string, unknown>;
}

export interface ResponseFormat {
  type: "json_schema";
  json_schema: ResponseFormatSchema;
}

export interface Message {
  role: "system" | "user";
  content: string;
}

export interface ChatResponse {
  message: string;
  // Add other response fields as needed
}

// Custom error types
export class ServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceError";
  }
}

export class AuthenticationError extends ServiceError {
  constructor(message = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends ServiceError {
  constructor(message = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class NetworkError extends ServiceError {
  constructor(message = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ResponseFormatError extends ServiceError {
  constructor(message = "Invalid response format") {
    super(message);
    this.name = "ResponseFormatError";
  }
}

export class ServerError extends ServiceError {
  constructor(message = "Server error occurred") {
    super(message);
    this.name = "ServerError";
  }
}
