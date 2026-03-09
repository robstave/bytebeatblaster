import "./hud.css";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { TargetEntity, TurretEntity } from "../entities/types";
import { GameState } from "../core/GameStateStore";

export interface HUDWorldSnapshot {
  worldHalfSize: number;
  playerPosition: Readonly<Vector3>;
  targets: readonly TargetEntity[];
  turrets: readonly TurretEntity[];
}

/** Owns the overlay HUD and applies minimal DOM updates. */
export class HUDManager {
  private root: HTMLDivElement | null = null;
  private scoreEl: HTMLDivElement | null = null;
  private bestEl: HTMLDivElement | null = null;
  private healthEl: HTMLDivElement | null = null;
  private stateTextEl: HTMLDivElement | null = null;
  private minimapCanvas: HTMLCanvasElement | null = null;
  private minimapContext: CanvasRenderingContext2D | null = null;

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
      <div class="hud-minimap-wrap">
        <canvas id="hud-minimap" width="170" height="170" aria-label="Playing field radar"></canvas>
      </div>
    `;
    document.body.appendChild(this.root);
    this.scoreEl = this.root.querySelector("#hud-score");
    this.bestEl = this.root.querySelector("#hud-best");
    this.healthEl = this.root.querySelector("#hud-health");
    this.stateTextEl = this.root.querySelector("#hud-state");
    this.minimapCanvas = this.root.querySelector("#hud-minimap");
    this.minimapContext = this.minimapCanvas?.getContext("2d") ?? null;
  }

  public update(
    state: Readonly<GameState>,
    pointerLocked: boolean,
    worldSnapshot: HUDWorldSnapshot
  ): void {
    this.setText(this.scoreEl, `Score: ${state.score}`);
    this.setText(this.bestEl, `Best: ${state.bestScore}`);
    this.setText(this.healthEl, `Health: ${Math.ceil(state.playerHealth)}`);
    this.drawMinimap(worldSnapshot);

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

  private drawMinimap(worldSnapshot: HUDWorldSnapshot): void {
    if (this.minimapCanvas === null || this.minimapContext === null) {
      return;
    }

    const context = this.minimapContext;
    const size = this.minimapCanvas.width;
    const center = size / 2;
    const usableRadius = center - 9;
    const scale = usableRadius / worldSnapshot.worldHalfSize;

    context.clearRect(0, 0, size, size);
    context.fillStyle = "rgba(8, 10, 16, 0.84)";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(196, 208, 240, 0.32)";
    context.lineWidth = 1;
    context.strokeRect(0.5, 0.5, size - 1, size - 1);

    context.strokeStyle = "rgba(128, 141, 168, 0.28)";
    context.beginPath();
    context.moveTo(center, 0);
    context.lineTo(center, size);
    context.moveTo(0, center);
    context.lineTo(size, center);
    context.stroke();

    for (const target of worldSnapshot.targets) {
      const x = center + target.mesh.position.x * scale;
      const y = center + target.mesh.position.z * scale;
      context.fillStyle = "#ff5f72";
      context.fillRect(x - 2.5, y - 2.5, 5, 5);
    }

    for (const turret of worldSnapshot.turrets) {
      const x = center + turret.mesh.position.x * scale;
      const y = center + turret.mesh.position.z * scale;
      context.fillStyle = "#c877ff";
      context.fillRect(x - 3, y - 3, 6, 6);
    }

    const playerX = center + worldSnapshot.playerPosition.x * scale;
    const playerY = center + worldSnapshot.playerPosition.z * scale;
    context.fillStyle = "#6fe8a8";
    context.beginPath();
    context.arc(playerX, playerY, 4, 0, Math.PI * 2);
    context.fill();
  }
}
