import { AIProvider, AIRequestOptions, AIResponse, AIStreamEvent, Message, AIErrorType } from "../types";

export class AstraProvider implements AIProvider {
  name = "Astra";
  private apiKey: string;
  private defaultModel = "gpt-6-astra";

  constructor() {
    this.apiKey = process.env.ASTRA_API_KEY || "";
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private mapError(status: number): AIErrorType {
    if (status === 401 || status === 403) return "AUTHENTICATION";
    if (status === 429) return "RATE_LIMIT";
    if (status === 400 || status === 404) return "INVALID_REQUEST";
    if (status >= 500) return "SERVER";
    return "UNKNOWN";
  }

  async chat(messages: Message[], options?: AIRequestOptions): Promise<AIResponse> {
    if (!this.isConfigured()) {
      const err = new Error("Astra API key missing") as Error & { type: AIErrorType };
      err.type = "CONFIGURATION_ERROR";
      throw err;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens
      })
    });

    if (!response.ok) {
      const err = new Error(`Astra HTTP error ${response.status}`) as Error & { type: AIErrorType };
      err.type = this.mapError(response.status);
      throw err;
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content || "",
      provider: this.name,
      model: data.model
    };
  }

  async *stream(messages: Message[], options?: AIRequestOptions): AsyncIterable<AIStreamEvent> {
    if (!this.isConfigured()) {
      yield { type: "error", error: "CONFIGURATION_ERROR", provider: this.name };
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      yield { type: "error", error: this.mapError(response.status), provider: this.name };
      return;
    }

    yield { type: "start", provider: this.name };

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      yield { type: "error", error: "UNKNOWN", provider: this.name };
      return;
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n").filter(line => line.trim().startsWith("data: "));
        
        for (const line of lines) {
          const data = line.replace("data: ", "").trim();
          if (data === "[DONE]") {
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield { type: "chunk", content, provider: this.name };
            }
          } catch (_e) {
            // Ignore parse errors on partial streams
          }
        }
      }
      yield { type: "done", provider: this.name };
    } catch (_error) {
      yield { type: "error", error: "NETWORK", provider: this.name };
    }
  }
}
