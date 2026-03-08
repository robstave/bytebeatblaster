import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TargetEntity } from "../entities/types";

/** Spawns simple target dummies with safe-radius placement. */
export class TargetSpawner {
  private readonly targetMaterial: StandardMaterial;

  public constructor(private readonly scene: Scene) {
    this.targetMaterial = new StandardMaterial("target-material", scene);
    this.targetMaterial.diffuseColor = new Color3(0.85, 0.2, 0.28);
    this.targetMaterial.emissiveColor = new Color3(0.15, 0.02, 0.02);
  }

  public spawn(playerPosition: Vector3): TargetEntity {
    const mesh = MeshBuilder.CreateBox("target", { size: 2.6 }, this.scene);

    const radius = gameConfig.targetSafeRadius + Math.random() * (gameConfig.worldHalfSize * 0.7);
    const angle = Math.random() * Math.PI * 2;
    const x = playerPosition.x + Math.cos(angle) * radius;
    const z = playerPosition.z + Math.sin(angle) * radius;
    mesh.position.set(
      Math.max(-gameConfig.worldHalfSize + 2, Math.min(gameConfig.worldHalfSize - 2, x)),
      1.3,
      Math.max(-gameConfig.worldHalfSize + 2, Math.min(gameConfig.worldHalfSize - 2, z))
    );
    mesh.material = this.targetMaterial;

    return {
      mesh,
      health: gameConfig.targetHealth,
      scoreValue: gameConfig.targetScore
    };
  }
}
