import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type EntityKind = "player" | "projectile" | "target" | "enemy" | "landmark";
export type ProjectileOwner = "player" | "enemy";

export interface ProjectileEntity {
  mesh: Mesh;
  direction: Vector3;
  speed: number;
  lifetimeSeconds: number;
  damage: number;
  owner: ProjectileOwner;
}

export interface TargetEntity {
  mesh: Mesh;
  health: number;
  scoreValue: number;
}

export interface TurretEntity {
  mesh: Mesh;
  health: number;
  scoreValue: number;
  fireTimerSeconds: number;
}
