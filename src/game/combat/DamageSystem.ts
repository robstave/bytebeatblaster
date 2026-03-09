import { GameStateStore } from "../core/GameStateStore";

/** Applies damage and score changes to central game state. */
export class DamageSystem {
  public constructor(private readonly gameStateStore: GameStateStore) {}

  public damagePlayer(amount: number): void {
    this.gameStateStore.applyDamage(amount);
  }

  public awardScore(points: number): void {
    this.gameStateStore.addScore(points);
  }

  public healPlayer(amount: number): void {
    this.gameStateStore.healPlayer(amount);
  }
}
