import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
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
    const body = MeshBuilder.CreateCylinder("turret-body", { diameter: 2.9, height: 1.9, tessellation: 16 }, this.scene);
    const dome = MeshBuilder.CreateSphere("turret-dome", { diameter: 2.2, segments: 12 }, this.scene);
    dome.position.y = 1.05;

    const cannon = MeshBuilder.CreateCylinder("turret-cannon", { diameter: 0.62, height: 1.9, tessellation: 12 }, this.scene);
    cannon.rotation.z = Math.PI * 0.5;
    cannon.position.set(0, 0.15, 1.65);

    const mesh = Mesh.MergeMeshes([body, dome, cannon], true, true);
    if (!mesh) {
      throw new Error("Failed to create turret mesh");
    }
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
