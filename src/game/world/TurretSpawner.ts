import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TurretEntity } from "../entities/types";

/** Spawns turret enemies positioned on top of cylindrical landmarks. */
export class TurretSpawner {
  private readonly bodyMaterial: StandardMaterial;
  private readonly headMaterial: StandardMaterial;

  public constructor(private readonly scene: Scene) {
    this.bodyMaterial = new StandardMaterial("turret-body-mat", scene);
    this.bodyMaterial.diffuseColor = new Color3(0.62, 0.28, 0.86);
    this.bodyMaterial.emissiveColor = new Color3(0.18, 0.05, 0.24);

    this.headMaterial = new StandardMaterial("turret-head-mat", scene);
    this.headMaterial.diffuseColor = new Color3(0.72, 0.34, 0.96);
    this.headMaterial.emissiveColor = new Color3(0.22, 0.08, 0.30);
  }

  public spawnAt(position: Readonly<Vector3>): TurretEntity {
    // Root node holds the whole turret at the spawn position
    const root = new TransformNode("turret-root", this.scene);
    root.position.copyFrom(position);

    // Static base cylinder
    const body = MeshBuilder.CreateCylinder("turret-body", { diameter: 2.9, height: 1.9, tessellation: 16 }, this.scene);
    body.parent = root;
    body.material = this.bodyMaterial;

    // Rotatable head group (dome + cannon) — pivots around the turret center
    const head = new TransformNode("turret-head", this.scene);
    head.parent = root;
    head.position.y = 1.05;

    const dome = MeshBuilder.CreateSphere("turret-dome", { diameter: 2.2, segments: 12 }, this.scene);
    dome.parent = head;
    dome.material = this.headMaterial;

    const cannon = MeshBuilder.CreateCylinder("turret-cannon", { diameter: 0.62, height: 1.9, tessellation: 12 }, this.scene);
    cannon.rotation.x = Math.PI * 0.5;
    cannon.position.set(0, 0, 1.65);
    cannon.parent = head;
    cannon.material = this.headMaterial;

    return {
      root,
      body,
      head,
      health: gameConfig.turretHealth,
      scoreValue: gameConfig.turretScore,
      fireTimerSeconds: Math.random() * gameConfig.turretFireIntervalSeconds
    };
  }
}
