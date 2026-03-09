import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TurretEntity } from "../entities/types";

/** Spawns turret enemies positioned on top of cylindrical landmarks. */
export class TurretSpawner {
  private readonly turretMaterial: StandardMaterial;

  public constructor(private readonly scene: Scene) {
    this.turretMaterial = new StandardMaterial("turret-material", scene);
    this.turretMaterial.diffuseColor = new Color3(0.62, 0.28, 0.86);
    this.turretMaterial.emissiveColor = new Color3(0.18, 0.05, 0.24);
  }

  public spawnAt(position: Readonly<Vector3>): TurretEntity {
    const mesh = MeshBuilder.CreateBox("turret", { width: 2.7, depth: 2.7, height: 1.8 }, this.scene);
    mesh.position.copyFrom(position);
    mesh.material = this.turretMaterial;

    return {
      mesh,
      health: gameConfig.turretHealth,
      scoreValue: gameConfig.turretScore,
      fireTimerSeconds: Math.random() * gameConfig.turretFireIntervalSeconds
    };
  }
}
