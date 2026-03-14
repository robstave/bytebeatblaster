import "./hud.css";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { ByteBeatOrbEntity, TargetEntity, TurretEntity } from "../entities/types";
import { GameState } from "../core/GameStateStore";

export interface HUDWorldSnapshot {
  worldHalfSize: number;
  playerPosition: Readonly<Vector3>;
  targets: readonly TargetEntity[];
  turrets: readonly TurretEntity[];
  byteBeatOrbs: readonly ByteBeatOrbEntity[];
  level: number;
  levelMessage: string;
  spreadShotsRemaining: number;
  crystalShotsRemaining: number;
}

/** Owns the overlay HUD and applies minimal DOM updates. */
export class HUDManager {
  private root: HTMLDivElement | null = null;
  private scoreEl: HTMLDivElement | null = null;
  private levelEl: HTMLDivElement | null = null;
  private bestEl: HTMLDivElement | null = null;
  private spreadEl: HTMLDivElement | null = null;
  private healthLabelEl: HTMLDivElement | null = null;
  private healthFillEl: HTMLDivElement | null = null;
  private stateTextEl: HTMLDivElement | null = null;
  private minimapCanvas: HTMLCanvasElement | null = null;
  private minimapContext: CanvasRenderingContext2D | null = null;

  public mount(): void {
    this.root = document.createElement("div");
    this.root.id = "hud-root";
    this.root.innerHTML = `
      <div class="hud-top hud-top-left">
        <div id="hud-score" class="hud-score">SCORE 000000</div>
        <div id="hud-level">LEVEL 1</div>
      </div>
      <div class="hud-top hud-top-right">
        <div id="hud-best">BEST 000000</div>
      </div>
      <div class="hud-bottom-left">
        <div id="hud-health-label">HEALTH 100</div>
        <div class="hud-health-bar"><div id="hud-health-fill"></div></div>
        <div id="hud-spread">SPREAD READY: 0</div>
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
    this.levelEl = this.root.querySelector("#hud-level");
    this.bestEl = this.root.querySelector("#hud-best");
    this.spreadEl = this.root.querySelector("#hud-spread");
    this.healthLabelEl = this.root.querySelector("#hud-health-label");
    this.healthFillEl = this.root.querySelector("#hud-health-fill");
    this.stateTextEl = this.root.querySelector("#hud-state");
    this.minimapCanvas = this.root.querySelector("#hud-minimap");
    this.minimapContext = this.minimapCanvas?.getContext("2d") ?? null;
  }

  public update(
    state: Readonly<GameState>,
    pointerLocked: boolean,
    worldSnapshot: HUDWorldSnapshot
  ): void {
    this.setText(this.scoreEl, `SCORE ${this.formatScore(state.score)}`);
    this.setText(this.levelEl, `LEVEL ${worldSnapshot.level}`);
    this.setText(this.bestEl, `BEST ${this.formatScore(state.bestScore)}`);
    this.setText(
      this.spreadEl,
      `SPREAD READY: ${worldSnapshot.spreadShotsRemaining}  CRYSTAL: ${worldSnapshot.crystalShotsRemaining}`
    );

    const healthValue = Math.ceil(state.playerHealth);
    this.setText(this.healthLabelEl, `HEALTH ${healthValue}`);
    this.setHealthBar(state.playerHealth);
    this.drawMinimap(worldSnapshot);

    const message =
      state.appState === "paused"
        ? "Paused - Press P to resume"
        : state.appState === "boot" || state.appState === "ready"
          ? "Click to start"
          : state.appState === "gameOver"
            ? "Game Over - Press R to restart"
            : pointerLocked
              ? ""
              : "Click to re-enter";
    this.setText(this.stateTextEl, worldSnapshot.levelMessage || message);
  }

  private setText(element: HTMLDivElement | null, value: string): void {
    if (element !== null && element.textContent !== value) {
      element.textContent = value;
    }
  }

  private setHealthBar(health: number): void {
    if (this.healthFillEl === null) {
      return;
    }

    const normalized = Math.max(0, Math.min(1, health / 100));
    this.healthFillEl.style.width = `${normalized * 100}%`;

    if (normalized > 0.6) {
      this.healthFillEl.style.background = "linear-gradient(90deg, #24c05a, #6df59b)";
      return;
    }
    if (normalized > 0.3) {
      this.healthFillEl.style.background = "linear-gradient(90deg, #cca312, #f0dd5f)";
      return;
    }

    this.healthFillEl.style.background = "linear-gradient(90deg, #b11f26, #ef4b53)";
  }

  private formatScore(value: number): string {
    return value.toString().padStart(6, "0");
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
      const x = center + turret.root.position.x * scale;
      const y = center + turret.root.position.z * scale;
      context.fillStyle = "#f2c172";
      context.fillRect(x - 3, y - 3, 6, 6);
    }

    for (const orb of worldSnapshot.byteBeatOrbs) {
      const x = center + orb.mesh.position.x * scale;
      const y = center + orb.mesh.position.z * scale;
      context.fillStyle = "#bb5df5";
      context.fillRect(x - 3, y - 3, 6, 6);
    }

    const playerX = center + worldSnapshot.playerPosition.x * scale;
    const playerY = center + worldSnapshot.playerPosition.z * scale;
    context.fillStyle = "#9be8ff";
    context.fillRect(playerX - 3, playerY - 3, 6, 6);
  }
}
