import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { InputSnapshot } from "../core/InputManager";
import { PlayerController } from "../player/PlayerController";
import { ProjectileSystem } from "./ProjectileSystem";

/** Owns player firing cadence and projectile spawning. */
export class WeaponController {
  private spreadShotsRemaining = 0;
  private crystalShotsRemaining = 0;

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
    const useCrystalShot = this.crystalShotsRemaining > 0;
    const spawned = projectileSystem.spawn(spawnOrigin, forward, useCrystalShot ? "playerCrystal" : "player");

    if (spawned && useCrystalShot) {
      this.crystalShotsRemaining = Math.max(0, this.crystalShotsRemaining - 1);
    }

    if (spawned && this.spreadShotsRemaining > 0 && !useCrystalShot) {
      const spreadAngle = (gameConfig.spreadShotAngleDegrees * Math.PI) / 180;
      const leftDirection = this.rotateAroundYaw(forward, -spreadAngle);
      const rightDirection = this.rotateAroundYaw(forward, spreadAngle);
      projectileSystem.spawn(spawnOrigin, leftDirection);
      projectileSystem.spawn(spawnOrigin, rightDirection);
      this.spreadShotsRemaining = Math.max(0, this.spreadShotsRemaining - 1);
    }

    if (spawned) {
      playerController.state.fireCooldownSeconds = gameConfig.weaponCooldownSeconds;
    }
    return spawned;
  }

  /** Activates spread shots for the next number of primary fired shots. */
  public activateSpreadShots(shots: number): void {
    this.spreadShotsRemaining = Math.max(this.spreadShotsRemaining, shots);
  }

  /** Clears temporary firing power-up state. */
  public reset(): void {
    this.spreadShotsRemaining = 0;
    this.crystalShotsRemaining = 0;
  }

  /** Returns remaining spread-charged shots. */
  public getSpreadShotsRemaining(): number {
    return this.spreadShotsRemaining;
  }

  /** Activates crystal rounds that fire stronger red diamond shots. */
  public activateCrystalShots(shots: number): void {
    this.crystalShotsRemaining = Math.max(this.crystalShotsRemaining, shots);
  }

  /** Returns remaining crystal shots. */
  public getCrystalShotsRemaining(): number {
    return this.crystalShotsRemaining;
  }

  private rotateAroundYaw(direction: Readonly<Vector3>, angleRadians: number): Vector3 {
    const cosAngle = Math.cos(angleRadians);
    const sinAngle = Math.sin(angleRadians);
    const rotated = new Vector3(
      direction.x * cosAngle + direction.z * sinAngle,
      direction.y,
      -direction.x * sinAngle + direction.z * cosAngle
    );

    return rotated.normalize();
  }
}
