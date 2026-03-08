import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { ProjectileEntity } from "../entities/types";

/** Owns active projectile entities, updates, and lifecycle cleanup. */
export class ProjectileSystem {
  private readonly projectiles: ProjectileEntity[] = [];
  private readonly projectileMaterial: StandardMaterial;

  public constructor(private readonly scene: Scene) {
    this.projectileMaterial = new StandardMaterial("projectile-material", scene);
    this.projectileMaterial.emissiveColor = new Color3(0.3, 1, 0.8);
  }

  public spawn(origin: Vector3, direction: Vector3): boolean {
    if (this.projectiles.length >= gameConfig.maxProjectiles) {
      return false;
    }

    const mesh = MeshBuilder.CreateSphere("projectile", { diameter: gameConfig.projectileRadius * 2 }, this.scene);
    mesh.position.copyFrom(origin);
    mesh.material = this.projectileMaterial;

    this.projectiles.push({
      mesh,
      direction: direction.normalizeToNew(),
      speed: gameConfig.projectileSpeed,
      lifetimeSeconds: gameConfig.projectileLifetimeSeconds,
      damage: gameConfig.projectileDamage
    });
    return true;
  }

  public update(deltaSeconds: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.lifetimeSeconds -= deltaSeconds;
      projectile.mesh.position.addInPlace(projectile.direction.scale(projectile.speed * deltaSeconds));

      const half = gameConfig.worldHalfSize;
      const outOfBounds =
        Math.abs(projectile.mesh.position.x) > half || Math.abs(projectile.mesh.position.z) > half;

      if (projectile.lifetimeSeconds <= 0 || outOfBounds) {
        projectile.mesh.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  public getProjectiles(): readonly ProjectileEntity[] {
    return this.projectiles;
  }

  public removeProjectile(projectile: ProjectileEntity): void {
    const index = this.projectiles.indexOf(projectile);
    if (index >= 0) {
      this.projectiles[index].mesh.dispose();
      this.projectiles.splice(index, 1);
    }
  }

  public clear(): void {
    for (const projectile of this.projectiles) {
      projectile.mesh.dispose();
    }
    this.projectiles.length = 0;
  }
}
