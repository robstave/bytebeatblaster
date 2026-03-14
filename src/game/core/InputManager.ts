import { inputConfig } from "../config/inputConfig";

/** Gameplay-friendly input snapshot consumed by systems. */
export interface InputSnapshot {
  moveX: number;
  moveZ: number;
  lookDeltaX: number;
  lookDeltaY: number;
  wantsFire: boolean;
  wantsRestart: boolean;
  wantsPauseToggle: boolean;
  pointerLocked: boolean;
}

/** Collects DOM input and exposes semantic actions for gameplay systems. */
export class InputManager {
  private readonly keys = new Set<string>();
  private lookDeltaX = 0;
  private lookDeltaY = 0;
  private fireHeld = false;
  private firePressedThisFrame = false;
  private wantsRestart = false;
  private wantsPauseToggle = false;
  private pointerLocked = false;

  public constructor(private readonly canvas: HTMLCanvasElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("pointerlockchange", this.onPointerLockChanged);
  }

  public requestPointerLock(): void {
    void this.canvas.requestPointerLock();
  }

  public sample(): InputSnapshot {
    const snapshot: InputSnapshot = {
      moveX: Number(this.isPressed("KeyD")) - Number(this.isPressed("KeyA")),
      moveZ: Number(this.isPressed("KeyW")) - Number(this.isPressed("KeyS")),
      lookDeltaX: this.lookDeltaX,
      lookDeltaY: this.lookDeltaY,
      wantsFire: this.fireHeld || this.firePressedThisFrame || this.isPressed(inputConfig.fireKey),
      wantsRestart: this.wantsRestart,
      wantsPauseToggle: this.wantsPauseToggle,
      pointerLocked: this.pointerLocked
    };

    this.lookDeltaX = 0;
    this.lookDeltaY = 0;
    this.firePressedThisFrame = false;
    this.wantsRestart = false;
    this.wantsPauseToggle = false;

    return snapshot;
  }

  private isPressed(code: string): boolean {
    return this.keys.has(code);
  }

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    if (event.code === inputConfig.restartKey) {
      this.wantsRestart = true;
    }
    if (event.code === inputConfig.pauseKey) {
      this.wantsPauseToggle = true;
    }
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private readonly onMouseMove = (event: MouseEvent): void => {
    if (!this.pointerLocked) {
      return;
    }
    this.lookDeltaX += event.movementX;
    this.lookDeltaY += event.movementY;
  };

  private readonly onMouseDown = (event: MouseEvent): void => {
    if (event.button === 0 && this.pointerLocked) {
      this.fireHeld = true;
      this.firePressedThisFrame = true;
    }
  };

  private readonly onMouseUp = (event: MouseEvent): void => {
    if (event.button === 0) {
      this.fireHeld = false;
    }
  };

  private readonly onPointerLockChanged = (): void => {
    this.pointerLocked = document.pointerLockElement === this.canvas;
    if (!this.pointerLocked && this.keys.has(inputConfig.pointerUnlockKey)) {
      this.keys.delete(inputConfig.pointerUnlockKey);
    }
  };
}
