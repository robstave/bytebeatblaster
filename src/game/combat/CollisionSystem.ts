import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { DamageSystem } from "./DamageSystem";
import { ProjectileSystem } from "./ProjectileSystem";
import { WorldManager } from "../world/WorldManager";

/** Processes projectile-target and target-player collision outcomes. */
export class CollisionSystem {
  public constructor(
    private readonly worldManager: WorldManager,
    private readonly projectileSystem: ProjectileSystem,
    private readonly damageSystem: DamageSystem
  ) {}

  public process(playerPosition: Vector3, deltaSeconds: number): void {
    const targets = this.worldManager.getTargets();
    const projectiles = this.projectileSystem.getProjectiles();

    for (const projectile of [...projectiles]) {
      for (const target of [...targets]) {
        const distance = Vector3.Distance(projectile.mesh.position, target.mesh.position);
        if (distance <= gameConfig.targetCollisionRadius) {
          target.health -= projectile.damage;
          this.projectileSystem.removeProjectile(projectile);
          if (target.health <= 0) {
            this.worldManager.removeTarget(target);
            this.damageSystem.awardScore(target.scoreValue);
          }
          break;
        }
      }
    }

    let contactDamage = 0;
    for (const target of this.worldManager.getTargets()) {
      const distance = Vector3.Distance(playerPosition, target.mesh.position);
      if (distance <= gameConfig.targetCollisionRadius + 0.75) {
        contactDamage += gameConfig.targetContactDamagePerSecond * deltaSeconds;
      }
    }

    if (contactDamage > 0) {
      this.damageSystem.damagePlayer(contactDamage);
    }
  }
}
