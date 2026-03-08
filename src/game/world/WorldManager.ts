import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TargetEntity } from "../entities/types";
import { LandmarkSpawner } from "./LandmarkSpawner";
import { TargetSpawner } from "./TargetSpawner";

/** Owns landmarks, target spawning, and target movement updates. */
export class WorldManager {
  private readonly targetSpawner: TargetSpawner;
  private landmarks: Mesh[] = [];
  private readonly targets: TargetEntity[] = [];
  private spawnTimerSeconds = 0;

  public constructor(scene: Scene) {
    this.targetSpawner = new TargetSpawner(scene);
    this.landmarks = new LandmarkSpawner().spawn(scene);
  }

  public update(playerPosition: Vector3, deltaSeconds: number): void {
    this.spawnTimerSeconds -= deltaSeconds;
    if (this.spawnTimerSeconds <= 0 && this.targets.length < gameConfig.maxTargets) {
      this.targets.push(this.targetSpawner.spawn(playerPosition));
      this.spawnTimerSeconds = gameConfig.targetSpawnIntervalSeconds;
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

  public getTargets(): readonly TargetEntity[] {
    return this.targets;
  }

  public removeTarget(target: TargetEntity): void {
    const index = this.targets.indexOf(target);
    if (index >= 0) {
      this.targets[index].mesh.dispose();
      this.targets.splice(index, 1);
    }
  }

  public reset(): void {
    for (const target of this.targets) {
      target.mesh.dispose();
    }
    this.targets.length = 0;
    this.spawnTimerSeconds = 0;
  }

  public dispose(): void {
    this.reset();
    for (const landmark of this.landmarks) {
      landmark.dispose();
    }
    this.landmarks = [];
  }
}
