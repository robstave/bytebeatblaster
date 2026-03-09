import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { DamageSystem } from "./DamageSystem";
import { ImpactEffectSystem } from "./ImpactEffectSystem";
import { ProjectileSystem } from "./ProjectileSystem";
import { WorldManager } from "../world/WorldManager";

/** Processes projectile collisions and contact damage outcomes. */
export class CollisionSystem {
  public constructor(
    private readonly worldManager: WorldManager,
    private readonly projectileSystem: ProjectileSystem,
    private readonly damageSystem: DamageSystem,
    private readonly impactEffectSystem: ImpactEffectSystem
  ) {}

  public process(playerPosition: Vector3, deltaSeconds: number): void {
    const targets = this.worldManager.getTargets();
    const turrets = this.worldManager.getTurrets();
    const projectiles = this.projectileSystem.getProjectiles();

    for (const projectile of [...projectiles]) {
      if (projectile.owner === "player") {
        let consumed = false;

        for (const target of [...targets]) {
          const distance = Vector3.Distance(projectile.mesh.position, target.mesh.position);
          if (distance <= gameConfig.targetCollisionRadius) {
            this.projectileSystem.removeProjectile(projectile);
            const destroyed = this.worldManager.applyTargetHit(target, projectile.damage);
            if (destroyed) {
              this.impactEffectSystem.spawnTargetDestroyEffect(target.mesh.position);
              this.damageSystem.awardScore(target.scoreValue);
            }
            consumed = true;
            break;
          }
        }

        if (consumed) {
          continue;
        }

        for (const turret of [...turrets]) {
          const distance = Vector3.Distance(projectile.mesh.position, turret.root.position);
          if (distance <= gameConfig.turretCollisionRadius) {
            turret.health -= projectile.damage;
            this.projectileSystem.removeProjectile(projectile);
            if (turret.health <= 0) {
              this.impactEffectSystem.spawnTurretDestroyEffect(turret.root.position);
              this.worldManager.removeTurret(turret);
              this.damageSystem.awardScore(turret.scoreValue);
            }
            break;
          }
        }
      } else {
        const playerHitDistance = Vector3.Distance(projectile.mesh.position, playerPosition);
        if (playerHitDistance <= gameConfig.targetCollisionRadius * 0.9) {
          this.projectileSystem.removeProjectile(projectile);
          this.damageSystem.damagePlayer(projectile.damage);
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
