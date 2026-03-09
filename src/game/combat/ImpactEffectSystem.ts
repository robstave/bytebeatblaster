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

  /** Big purple/orange explosion for destroyed turrets. */
  public spawnTurretDestroyEffect(position: Readonly<Vector3>): void {
    // Bright flash
    const flashMat = new StandardMaterial("turret-flash-mat", this.scene);
    flashMat.diffuseColor = new Color3(1, 0.6, 0.1);
    flashMat.emissiveColor = new Color3(1, 0.45, 0.05);
    const flash = MeshBuilder.CreateSphere("turret-flash", { diameter: 4.5, segments: 8 }, this.scene);
    flash.position.copyFrom(position);
    flash.material = flashMat;
    this.effects.push({ mesh: flash, material: flashMat, lifetimeSeconds: 0.15, ageSeconds: 0 });

    // Debris shards flying outward
    const shardCount = 8;
    for (let i = 0; i < shardCount; i += 1) {
      const angle = (Math.PI * 2 * i) / shardCount;
      const shardMat = new StandardMaterial(`turret-shard-mat-${i}`, this.scene);
      shardMat.diffuseColor = new Color3(0.62, 0.28, 0.86);
      shardMat.emissiveColor = new Color3(0.35, 0.12, 0.5);
      const shard = MeshBuilder.CreateBox(`turret-shard-${i}`, { width: 0.5, height: 0.4, depth: 0.3 }, this.scene);
      shard.position.copyFrom(position);
      shard.position.x += Math.cos(angle) * 0.5;
      shard.position.z += Math.sin(angle) * 0.5;
      shard.rotation.set(Math.random() * Math.PI, angle, Math.random() * Math.PI);
      shard.material = shardMat;
      // Store velocity in metadata via a custom sub-interface
      const fx: ImpactEffect & { vx: number; vy: number; vz: number } = {
        mesh: shard, material: shardMat, lifetimeSeconds: 0.55, ageSeconds: 0,
        vx: Math.cos(angle) * 12, vy: 6 + Math.random() * 5, vz: Math.sin(angle) * 12
      };
      this.effects.push(fx);
    }

    // Lingering smoke cloud
    const smokeMat = new StandardMaterial("turret-smoke-mat", this.scene);
    smokeMat.diffuseColor = new Color3(0.3, 0.3, 0.35);
    smokeMat.emissiveColor = new Color3(0.05, 0.05, 0.05);
    smokeMat.alpha = 0.6;
    const smoke = MeshBuilder.CreateSphere("turret-smoke", { diameter: 3.2, segments: 8 }, this.scene);
    smoke.position.copyFrom(position);
    smoke.position.y += 0.8;
    smoke.material = smokeMat;
    this.effects.push({ mesh: smoke, material: smokeMat, lifetimeSeconds: 0.5, ageSeconds: 0 });
  }

  public update(deltaSeconds: number): void {
    for (let i = this.effects.length - 1; i >= 0; i -= 1) {
      const effect = this.effects[i];
      effect.ageSeconds += deltaSeconds;
      const t = effect.ageSeconds / effect.lifetimeSeconds;
      // Apply velocity for shard debris particles
      const fx = effect as ImpactEffect & { vx?: number; vy?: number; vz?: number };
      if (fx.vx !== undefined) {
        effect.mesh.position.x += fx.vx * deltaSeconds;
        effect.mesh.position.y += fx.vy! * deltaSeconds;
        effect.mesh.position.z += fx.vz! * deltaSeconds;
        fx.vy! -= 18 * deltaSeconds; // gravity
        effect.mesh.rotation.x += deltaSeconds * 8;
        effect.mesh.rotation.z += deltaSeconds * 6;
        effect.mesh.scaling.setAll(1 - t * 0.6);
      } else {
        effect.mesh.scaling.setAll(1 + t * 0.9);
        effect.mesh.position.y += deltaSeconds * 1.8;
      }
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
