import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export type EntityKind = "player" | "projectile" | "target" | "enemy" | "landmark";
export type ProjectileOwner = "player" | "enemy";

export interface ByteBeatOrbEntity {
  mesh: Mesh;
  health: number;
  scoreValue: number;
  sampleTime: number;
}


export interface SpreadPickupEntity {
  mesh: Mesh;
  spinRate: number;
  pulseTime: number;
}

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
  maxHealth: number;
  scoreValue: number;
  damageState: "healthy" | "damaged";
}

export interface TurretEntity {
  /** Root transform positioned at the turret world location. */
  root: TransformNode;
  /** Static base cylinder — used for collision / position queries. */
  body: Mesh;
  /** Rotatable head node (dome + cannon) that tracks the player. */
  head: TransformNode;
  health: number;
  scoreValue: number;
  fireTimerSeconds: number;
}
