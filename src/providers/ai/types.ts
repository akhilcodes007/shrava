export type AIErrorType =
  | "AUTHENTICATION"
  | "CREDITS_EXHAUSTED"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "NETWORK"
  | "SERVER"
  | "INVALID_REQUEST"
  | "CONFIGURATION_ERROR"
  | "UNKNOWN";

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export interface AIStreamEvent {
  type: "start" | "chunk" | "done" | "error";
  content?: string;
  error?: AIErrorType;
  provider?: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  isConfigured(): boolean;
  chat(messages: Message[], options?: AIRequestOptions): Promise<AIResponse>;
  stream(messages: Message[], options?: AIRequestOptions): AsyncIterable<AIStreamEvent>;
}
