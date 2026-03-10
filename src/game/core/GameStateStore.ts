import { gameConfig } from "../config/gameConfig";

export type AppState = "boot" | "ready" | "playing" | "gameOver";

export interface GameState {
  appState: AppState;
  score: number;
  bestScore: number;
  playerHealth: number;
}

/** Central runtime state for score, health, and app flow. */
export class GameStateStore {
  private state: GameState;

  public constructor() {
    this.state = {
      appState: "boot",
      score: 0,
      bestScore: this.loadBestScore(),
      playerHealth: gameConfig.initialHealth
    };
  }

  public getState(): Readonly<GameState> {
    return this.state;
  }

  public setAppState(next: AppState): void {
    this.state = { ...this.state, appState: next };
  }

  public resetRun(): void {
    this.state = {
      ...this.state,
      appState: "playing",
      score: 0,
      playerHealth: gameConfig.initialHealth
    };
  }

  public addScore(points: number): void {
    const nextScore = this.state.score + points;
    const nextBest = Math.max(nextScore, this.state.bestScore);
    this.state = { ...this.state, score: nextScore, bestScore: nextBest };
    this.persistBestScore();
  }

  public applyDamage(amount: number): void {
    const nextHealth = Math.max(0, this.state.playerHealth - amount);
    this.state = {
      ...this.state,
      playerHealth: nextHealth,
      appState: nextHealth <= 0 ? "gameOver" : this.state.appState
    };
  }

  public healPlayer(amount: number): void {
    this.state = {
      ...this.state,
      playerHealth: Math.min(gameConfig.initialHealth, this.state.playerHealth + amount)
    };
  }

  private loadBestScore(): number {
    const raw = localStorage.getItem(gameConfig.bestScoreStorageKey);
    const parsed = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private persistBestScore(): void {
    localStorage.setItem(gameConfig.bestScoreStorageKey, String(this.state.bestScore));
  }
}
