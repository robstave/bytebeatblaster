import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { InputSnapshot } from "../core/InputManager";
import { PlayerController } from "../player/PlayerController";
import { ProjectileSystem } from "./ProjectileSystem";

/** Owns player firing cadence and projectile spawning. */
export class WeaponController {
  public update(
    input: InputSnapshot,
    playerController: PlayerController,
    projectileSystem: ProjectileSystem
  ): boolean {
    if (!input.wantsFire || !input.pointerLocked) {
      return false;
    }
    if (playerController.state.fireCooldownSeconds > 0) {
      return false;
    }

    const forward = new Vector3(
      Math.sin(playerController.state.yaw) * Math.cos(playerController.state.pitch),
      -Math.sin(playerController.state.pitch),
      Math.cos(playerController.state.yaw) * Math.cos(playerController.state.pitch)
    );

    const spawnOrigin = playerController.state.position.add(forward.scale(1.1));
    const spawned = projectileSystem.spawn(spawnOrigin, forward);
    if (spawned) {
      playerController.state.fireCooldownSeconds = gameConfig.weaponCooldownSeconds;
    }
    return spawned;
  }
}
