import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";

interface ImpactEffect {
  mesh: Mesh;
  material: StandardMaterial;
  lifetimeSeconds: number;
  ageSeconds: number;
}

/** Renders quick retro flash/smoke effects for destruction feedback. */
export class ImpactEffectSystem {
  private readonly effects: ImpactEffect[] = [];

  public constructor(private readonly scene: Scene) {}

  public spawnTargetDestroyEffect(position: Readonly<Vector3>): void {
    const flashMaterial = new StandardMaterial("target-hit-flash", this.scene);
    flashMaterial.diffuseColor = new Color3(1, 0.75, 0.15);
    flashMaterial.emissiveColor = new Color3(0.5, 0.3, 0.08);
    const flash = MeshBuilder.CreateBox("target-flash", { size: 2.8 }, this.scene);
    flash.position.copyFrom(position);
    flash.material = flashMaterial;
    this.effects.push({ mesh: flash, material: flashMaterial, lifetimeSeconds: 0.11, ageSeconds: 0 });

    const smokeMaterial = new StandardMaterial("target-hit-smoke", this.scene);
    smokeMaterial.diffuseColor = new Color3(0.4, 0.4, 0.45);
    smokeMaterial.emissiveColor = new Color3(0.06, 0.06, 0.06);
    smokeMaterial.alpha = 0.7;
    const smoke = MeshBuilder.CreateSphere("target-smoke", { diameter: 1.4 }, this.scene);
    smoke.position.copyFrom(position);
    smoke.position.y += 0.5;
    smoke.material = smokeMaterial;
    this.effects.push({ mesh: smoke, material: smokeMaterial, lifetimeSeconds: 0.32, ageSeconds: 0 });
  }

  public update(deltaSeconds: number): void {
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];
      effect.ageSeconds += deltaSeconds;
      const t = effect.ageSeconds / effect.lifetimeSeconds;
      effect.mesh.scaling.setAll(1 + t * 0.9);
      effect.mesh.position.y += deltaSeconds * 1.8;
      effect.material.alpha = Math.max(0, 1 - t);
      if (effect.ageSeconds >= effect.lifetimeSeconds) {
        effect.mesh.dispose();
        effect.material.dispose();
        this.effects.splice(i, 1);
      }
    }
  }

  public clear(): void {
    for (const effect of this.effects) {
      effect.mesh.dispose();
      effect.material.dispose();
    }
    this.effects.length = 0;
  }
}
