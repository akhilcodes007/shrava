export interface VoiceProvider {
  name: string;
  isConfigured(): boolean;
  synthesizeSpeech(text: string): Promise<ArrayBuffer>;
  transcribeAudio(audioBuffer: Blob): Promise<string>;
}
