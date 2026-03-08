import "./hud.css";
import { GameState } from "../core/GameStateStore";

/** Owns the overlay HUD and applies minimal DOM updates. */
export class HUDManager {
  private root: HTMLDivElement | null = null;
  private scoreEl: HTMLDivElement | null = null;
  private bestEl: HTMLDivElement | null = null;
  private healthEl: HTMLDivElement | null = null;
  private stateTextEl: HTMLDivElement | null = null;

  public mount(): void {
    this.root = document.createElement("div");
    this.root.id = "hud-root";
    this.root.innerHTML = `
      <div class="hud-top">
        <div id="hud-score">Score: 0</div>
        <div id="hud-best">Best: 0</div>
        <div id="hud-health">Health: 100</div>
      </div>
      <div class="hud-center">
        <div class="crosshair">+</div>
        <div id="hud-state" class="state-text"></div>
      </div>
    `;
    document.body.appendChild(this.root);
    this.scoreEl = this.root.querySelector("#hud-score");
    this.bestEl = this.root.querySelector("#hud-best");
    this.healthEl = this.root.querySelector("#hud-health");
    this.stateTextEl = this.root.querySelector("#hud-state");
  }

  public update(state: Readonly<GameState>, pointerLocked: boolean): void {
    this.setText(this.scoreEl, `Score: ${state.score}`);
    this.setText(this.bestEl, `Best: ${state.bestScore}`);
    this.setText(this.healthEl, `Health: ${Math.ceil(state.playerHealth)}`);

    const message =
      state.appState === "boot" || state.appState === "ready"
        ? "Click to start"
        : state.appState === "gameOver"
          ? "Game Over - Press R to restart"
          : pointerLocked
            ? ""
            : "Click to re-enter";
    this.setText(this.stateTextEl, message);
  }

  private setText(element: HTMLDivElement | null, value: string): void {
    if (element !== null && element.textContent !== value) {
      element.textContent = value;
    }
  }
}
