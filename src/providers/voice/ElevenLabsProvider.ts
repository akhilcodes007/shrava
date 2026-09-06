import { VoiceProvider } from "./types";

export class ElevenLabsProvider implements VoiceProvider {
  name = "ElevenLabs";
  private apiKey: string;
  private voiceId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || "";
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || "cgSgspJ2msm6clMCkdW9"; // Default voice ID
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async synthesizeSpeech(text: string): Promise<ArrayBuffer> {
    if (!this.isConfigured()) throw new Error("ElevenLabs API key missing");

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": this.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2_5", // Fast TTS model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs TTS failed: ${response.status}`);
    }

    return await response.arrayBuffer();
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    if (!this.isConfigured()) throw new Error("ElevenLabs API key missing");

    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model_id", "scribe_v1"); // Use scribe (or scribe_v1/v2 if available)

    // ElevenLabs Scribe v2 endpoint
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs STT failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || "";
  }
}
