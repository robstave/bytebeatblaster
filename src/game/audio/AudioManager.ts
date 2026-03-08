/** Plays lightweight synthesized feedback sounds. */
export class AudioManager {
  private context: AudioContext | null = null;

  public initialize(): void {
    if (this.context !== null) {
      return;
    }
    try {
      this.context = new AudioContext();
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
}
