export interface AudioReactiveState {
  amplitude: number;
}

export class AudioAnalyzer {
  private context: AudioContext | null = null;
  private analyzer: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrameId: number | null = null;
  private callbacks: Set<(state: AudioReactiveState) => void> = new Set();
  private audioElement: HTMLAudioElement | null = null;

  constructor() {}

  public connect(audioElement: HTMLAudioElement) {
    if (this.audioElement === audioElement) return;
    this.audioElement = audioElement;

    // We must instantiate AudioContext after user interaction usually, 
    // but assuming it's allowed here since it's an audio element play
    if (!this.context) {
      this.context = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    if (!this.analyzer) {
      this.analyzer = this.context.createAnalyser();
      this.analyzer.fftSize = 256;
      const bufferLength = this.analyzer.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
    }

    // Connect source to analyzer and analyzer to destination
    // If it's already connected to another source, we might need to disconnect, but simplified here
    if (!this.source) {
       this.source = this.context.createMediaElementSource(audioElement);
       this.source.connect(this.analyzer);
       this.analyzer.connect(this.context.destination);
    }

    this.startLoop();
  }

  public disconnect() {
    this.stopLoop();
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.audioElement = null;
  }

  public subscribe(callback: (state: AudioReactiveState) => void): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private startLoop() {
    if (this.animationFrameId) return;

    const loop = () => {
      if (!this.analyzer || !this.dataArray) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.analyzer.getByteFrequencyData(this.dataArray as any);
      
      let sum = 0;
      for (let i = 0; i < this.dataArray.length; i++) {
        sum += this.dataArray[i];
      }
      const average = sum / this.dataArray.length;
      const amplitude = Math.min(average / 128.0, 1.0); // Normalize roughly 0-1

      for (const cb of this.callbacks) {
        cb({ amplitude });
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  private stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // send 0 amplitude
    for (const cb of this.callbacks) {
      cb({ amplitude: 0 });
    }
  }

  public getContext() {
    return this.context;
  }
}

// Singleton instance
export const audioAnalyzer = new AudioAnalyzer();
