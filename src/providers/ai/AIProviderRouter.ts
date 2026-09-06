import { AIProvider, AIRequestOptions, AIResponse, AIStreamEvent, Message, AIErrorType } from "./types";
import { AstraProvider } from "./providers/AstraProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";

export class AIProviderRouter {
  private primary: AIProvider;
  private fallback: AIProvider;

  constructor() {
    this.primary = new AstraProvider();
    this.fallback = new OpenAIProvider();
  }

  private isRecoverableError(error: unknown): boolean {
    const errType = (error as { type?: string })?.type as AIErrorType | undefined;
    return (
      errType === "RATE_LIMIT" ||
      errType === "CREDITS_EXHAUSTED" ||
      errType === "SERVER" ||
      errType === "NETWORK" ||
      errType === "TIMEOUT"
    );
  }

  async chat(messages: Message[], options?: AIRequestOptions): Promise<AIResponse> {
    try {
      if (this.primary.isConfigured()) {
        return await this.primary.chat(messages, options);
      } else {
        throw { type: "CONFIGURATION_ERROR", message: "Primary provider blocked/unconfigured" };
      }
    } catch (error: unknown) {
      const err = error as { type?: string };
      if (this.isRecoverableError(err) || err?.type === "CONFIGURATION_ERROR") {
        console.warn(`Primary provider failed (${err?.type}). Falling back...`);
        return await this.fallback.chat(messages, options);
      }
      throw error;
    }
  }

  async *stream(messages: Message[], options?: AIRequestOptions): AsyncIterable<AIStreamEvent> {
    if (!this.primary.isConfigured()) {
      // If primary is unconfigured, immediately fallback
      yield* this.fallback.stream(messages, options);
      return;
    }

    try {
      const stream = this.primary.stream(messages, options);
      let started = false;

      for await (const event of stream) {
        if (event.type === "error" && !started) {
          if (
            event.error === "RATE_LIMIT" ||
            event.error === "CREDITS_EXHAUSTED" ||
            event.error === "SERVER" ||
            event.error === "NETWORK" ||
            event.error === "TIMEOUT" ||
            event.error === "CONFIGURATION_ERROR"
          ) {
             // Fallback
             yield* this.fallback.stream(messages, options);
             return;
          } else {
             // Non-recoverable error
             yield event;
             return;
          }
        }
        
        started = true;
        yield event;
      }
    } catch (error: unknown) {
       // If an error is thrown before streaming starts
       if (this.isRecoverableError(error)) {
         yield* this.fallback.stream(messages, options);
       } else {
         yield { type: "error", error: "UNKNOWN", provider: "Router" };
       }
    }
  }
}
