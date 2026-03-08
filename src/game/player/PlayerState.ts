import { Vector3 } from "@babylonjs/core/Maths/math.vector";

/** Mutable player runtime state. */
export interface PlayerState {
  position: Vector3;
  yaw: number;
  pitch: number;
  health: number;
  fireCooldownSeconds: number;
}
