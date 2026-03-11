import { gameConfig } from "../config/gameConfig";

/** Plays lightweight synthesized feedback sounds. */
export class AudioManager {
  private context: AudioContext | null = null;
  private byteBeatGain: GainNode | null = null;
  private byteBeatEnabled = false;
  private byteBeatT = 0;

  public initialize(): void {
    if (this.context !== null) {
      return;
    }
    try {
      this.context = new AudioContext();
      this.setupByteBeatBus(this.context);
    } catch {
      this.context = null;
    }
  }

  public playShot(): void {
    this.playTone(760, 0.04, "square", 0.045);
  }

  public playHit(): void {
    this.playTone(210, 0.08, "sawtooth", 0.04);
  }

  public playGameOver(): void {
    this.playTone(110, 0.25, "triangle", 0.05);
  }

  /** Enables/disables bytebeat synthesis and applies proximity gain. */
  public updateByteBeatProximity(distanceToNearestOrb: number | null): void {
    const gainNode = this.byteBeatGain;
    if (gainNode === null || this.context === null) {
      return;
    }

    const hasOrb = distanceToNearestOrb !== null;
    this.byteBeatEnabled = hasOrb;
    const targetGain = hasOrb ? this.computeByteBeatGain(distanceToNearestOrb) : 0;
    gainNode.gain.setTargetAtTime(targetGain, this.context.currentTime, 0.04);
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    type: OscillatorType,
    gainValue: number
  ): void {
    const context = this.context;
    if (context === null) {
      return;
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(gainValue, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + durationSeconds);
  }

  private setupByteBeatBus(context: AudioContext): void {
    const processor = context.createScriptProcessor(1024, 0, 1);
    const gainNode = context.createGain();
    gainNode.gain.value = 0;

    processor.onaudioprocess = (event: AudioProcessingEvent): void => {
      const output = event.outputBuffer.getChannelData(0);
      if (!this.byteBeatEnabled) {
        output.fill(0);
        return;
      }

      const sampleRate = gameConfig.byteBeatAudioSampleRate;
      const tIncrement = sampleRate / context.sampleRate;
      let t = this.byteBeatT;

      for (let i = 0; i < output.length; i += 1) {
        const raw = this.byteBeatFormula(t | 0);
        output[i] = ((raw & 255) / 127.5) - 1;
        t += tIncrement;
      }

      this.byteBeatT = t;
    };

    processor.connect(gainNode);
    gainNode.connect(context.destination);
    this.byteBeatGain = gainNode;
  }

  private byteBeatFormula(t: number): number {
    return t * ((t ^ t + ((t >> 15) | 1) ^ (((t - 1280) ^ t) >> 10)) & 255);
  }

  private computeByteBeatGain(distanceToNearestOrb: number): number {
    const near = gameConfig.byteBeatAudioNearRadius;
    const far = gameConfig.byteBeatAudioAudibleRadius;
    if (distanceToNearestOrb >= far) {
      return 0;
    }

    if (distanceToNearestOrb <= near) {
      return gameConfig.byteBeatAudioMaxGain;
    }

    const t = 1 - (distanceToNearestOrb - near) / (far - near);
    const shaped = t * t;
    return gameConfig.byteBeatAudioBaseGain +
      (gameConfig.byteBeatAudioMaxGain - gameConfig.byteBeatAudioBaseGain) * shaped;
  }
}
