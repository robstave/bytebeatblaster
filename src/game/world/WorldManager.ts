import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TargetEntity, TurretEntity } from "../entities/types";
import { LandmarkSpawner } from "./LandmarkSpawner";
import { TargetSpawner } from "./TargetSpawner";
import { TurretSpawner } from "./TurretSpawner";

/** Owns landmarks, target/turret spawning, and world-level enemy updates. */
export class WorldManager {
  private readonly targetSpawner: TargetSpawner;
  private readonly turretSpawner: TurretSpawner;
  private landmarks: Mesh[] = [];
  private readonly cylinderTopPoints: Vector3[] = [];
  private readonly targets: TargetEntity[] = [];
  private readonly turrets: TurretEntity[] = [];
  private spawnTimerSeconds = 0;

  public constructor(scene: Scene) {
    this.targetSpawner = new TargetSpawner(scene);
    this.turretSpawner = new TurretSpawner(scene);
    const landmarkResult = new LandmarkSpawner().spawn(scene);
    this.landmarks = landmarkResult.meshes;
    this.cylinderTopPoints.push(...landmarkResult.cylinderTopPoints);
    this.rebuildTurrets();
  }

  public update(playerPosition: Vector3, deltaSeconds: number): void {
    this.spawnTimerSeconds -= deltaSeconds;
    if (this.spawnTimerSeconds <= 0 && this.targets.length < gameConfig.maxTargets) {
      this.targets.push(this.targetSpawner.spawn(playerPosition));
      this.spawnTimerSeconds = gameConfig.targetSpawnIntervalSeconds;
    }

    for (const turret of this.turrets) {
      turret.fireTimerSeconds -= deltaSeconds;
    }

    for (const target of this.targets) {
      const move = playerPosition.subtract(target.mesh.position);
      move.y = 0;
      if (move.lengthSquared() > 0.0001) {
        move.normalize();
        target.mesh.position.addInPlace(move.scale(gameConfig.targetMoveSpeed * deltaSeconds));
      }
    }
  }

  public collectTurretShots(playerPosition: Readonly<Vector3>): Array<{ origin: Vector3; direction: Vector3 }> {
    const shotData: Array<{ origin: Vector3; direction: Vector3 }> = [];

    for (const turret of this.turrets) {
      if (turret.fireTimerSeconds > 0) {
        continue;
      }

      const direction = playerPosition.subtract(turret.mesh.position);
      direction.y = 0;
      if (direction.lengthSquared() <= 0.001) {
        turret.fireTimerSeconds = gameConfig.turretFireIntervalSeconds;
        continue;
      }

      shotData.push({
        origin: turret.mesh.position.clone(),
        direction: direction.normalize()
      });
      turret.fireTimerSeconds = gameConfig.turretFireIntervalSeconds;
    }

    return shotData;
  }

  public getTargets(): readonly TargetEntity[] {
    return this.targets;
  }

  public getTurrets(): readonly TurretEntity[] {
    return this.turrets;
  }

  public removeTarget(target: TargetEntity): void {
    const index = this.targets.indexOf(target);
    if (index >= 0) {
      this.targets[index].mesh.dispose();
      this.targets.splice(index, 1);
    }
  }

  public removeTurret(turret: TurretEntity): void {
    const index = this.turrets.indexOf(turret);
    if (index >= 0) {
      this.turrets[index].mesh.dispose();
      this.turrets.splice(index, 1);
    }
  }

  public reset(): void {
    for (const target of this.targets) {
      target.mesh.dispose();
    }
    this.targets.length = 0;
    this.spawnTimerSeconds = 0;
    this.rebuildTurrets();
  }

  public dispose(): void {
    this.reset();
    for (const turret of this.turrets) {
      turret.mesh.dispose();
    }
    this.turrets.length = 0;

    for (const landmark of this.landmarks) {
      landmark.dispose();
    }
    this.landmarks = [];
  }

  private rebuildTurrets(): void {
    for (const turret of this.turrets) {
      turret.mesh.dispose();
    }
    this.turrets.length = 0;

    for (const topPoint of this.cylinderTopPoints) {
      this.turrets.push(this.turretSpawner.spawnAt(topPoint));
    }
  }
}
