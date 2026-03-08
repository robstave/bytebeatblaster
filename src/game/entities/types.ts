import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type EntityKind = "player" | "projectile" | "target" | "enemy" | "landmark";

export interface ProjectileEntity {
  mesh: Mesh;
  direction: Vector3;
  speed: number;
  lifetimeSeconds: number;
  damage: number;
}

export interface TargetEntity {
  mesh: Mesh;
  health: number;
  scoreValue: number;
}
