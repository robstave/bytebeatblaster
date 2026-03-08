export type AppState = "boot" | "ready" | "playing" | "gameOver";

export interface GameState {
  appState: AppState;
  score: number;
  bestScore: number;
  playerHealth: number;
}

/** Central mutable runtime state for MVP. */
export class GameStateStore {
  private state: GameState = {
    appState: "boot",
    score: 0,
    bestScore: 0,
    playerHealth: 100
  };

  public getState(): GameState {
    return this.state;
  }

  public setState(next: GameState): void {
    this.state = next;
  }
}
