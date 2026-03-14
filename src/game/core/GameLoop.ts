import { gameConfig } from "../config/gameConfig";
import { AudioManager } from "../audio/AudioManager";
import { WeaponController } from "../combat/WeaponController";
import { ProjectileSystem } from "../combat/ProjectileSystem";
import { CollisionSystem } from "../combat/CollisionSystem";
import { ImpactEffectSystem } from "../combat/ImpactEffectSystem";
import { GameStateStore } from "./GameStateStore";
import { InputManager } from "./InputManager";
import { PlayerController } from "../player/PlayerController";
import { PlayerView } from "../player/PlayerView";
import { HUDManager } from "../ui/HUDManager";
import { WorldManager } from "../world/WorldManager";

/** Fixed-order update runner for core gameplay systems. */
export class GameLoop {
  private lastAppState: string = "boot";

  public constructor(
    private readonly inputManager: InputManager,
    private readonly playerController: PlayerController,
    private readonly playerView: PlayerView,
    private readonly worldManager: WorldManager,
    private readonly projectileSystem: ProjectileSystem,
    private readonly impactEffectSystem: ImpactEffectSystem,
    private readonly weaponController: WeaponController,
    private readonly collisionSystem: CollisionSystem,
    private readonly gameStateStore: GameStateStore,
    private readonly hudManager: HUDManager,
    private readonly audioManager: AudioManager
  ) {}

  public update(deltaSeconds: number): void {
    const input = this.inputManager.sample();
    const state = this.gameStateStore.getState();

    if (input.wantsRestart && state.appState === "gameOver") {
      this.restartRun();
    }

    if (state.appState !== "playing") {
      this.audioManager.updateByteBeatProximity(null);
      this.playerView.sync(
        this.playerController.state.position,
        this.playerController.state.yaw,
        this.playerController.state.pitch
      );
      this.hudManager.update(this.gameStateStore.getState(), input.pointerLocked, {
        worldHalfSize: gameConfig.worldHalfSize,
        playerPosition: this.playerController.state.position,
        targets: this.worldManager.getTargets(),
        turrets: this.worldManager.getTurrets(),
        byteBeatOrbs: this.worldManager.getByteBeatOrbs(),
        level: this.worldManager.getLevel(),
        levelMessage: this.worldManager.getLevelMessage(),
        spreadShotsRemaining: this.weaponController.getSpreadShotsRemaining(),
        crystalShotsRemaining: this.weaponController.getCrystalShotsRemaining()
      });
      this.lastAppState = state.appState;
      return;
    }

    this.playerController.update(input, deltaSeconds);
    this.playerView.sync(
      this.playerController.state.position,
      this.playerController.state.yaw,
      this.playerController.state.pitch
    );

    const fired = this.weaponController.update(input, this.playerController, this.projectileSystem);
    if (fired) {
      this.audioManager.playShot();
    }

    this.worldManager.update(this.playerController.state.position, deltaSeconds);
    const nearestByteBeatOrbDistance = this.worldManager.getNearestByteBeatOrbDistance(
      this.playerController.state.position
    );
    this.audioManager.setByteBeatFormulaIndex(this.worldManager.getByteBeatFormulaIndex());
    this.audioManager.updateByteBeatProximity(nearestByteBeatOrbDistance);

    const turretShots = this.worldManager.collectTurretShots(this.playerController.state.position);
    for (const shot of turretShots) {
      const muzzleOrigin = shot.origin.add(shot.direction.scale(2));
      this.projectileSystem.spawn(muzzleOrigin, shot.direction, "enemy");
    }

    const ufoShots = this.worldManager.collectUfoShots(this.playerController.state.position);
    for (const shot of ufoShots) {
      const muzzleOrigin = shot.origin.add(shot.direction.scale(2.2));
      this.projectileSystem.spawn(muzzleOrigin, shot.direction, "enemy");
    }

    this.projectileSystem.update(deltaSeconds);
    this.impactEffectSystem.update(deltaSeconds);
    const beforeScore = this.gameStateStore.getState().score;
    this.collisionSystem.process(this.playerController.state.position, deltaSeconds);
    if (this.gameStateStore.getState().score > beforeScore) {
      this.audioManager.playHit();
    }

    const nextState = this.gameStateStore.getState().appState;
    if (nextState === "gameOver" && this.lastAppState !== "gameOver") {
      this.audioManager.playGameOver();
    }

    this.hudManager.update(this.gameStateStore.getState(), input.pointerLocked, {
      worldHalfSize: gameConfig.worldHalfSize,
      playerPosition: this.playerController.state.position,
      targets: this.worldManager.getTargets(),
      turrets: this.worldManager.getTurrets(),
      byteBeatOrbs: this.worldManager.getByteBeatOrbs(),
      level: this.worldManager.getLevel(),
      levelMessage: this.worldManager.getLevelMessage(),
      spreadShotsRemaining: this.weaponController.getSpreadShotsRemaining(),
      crystalShotsRemaining: this.weaponController.getCrystalShotsRemaining()
    });
    this.lastAppState = nextState;
  }

  private restartRun(): void {
    this.worldManager.reset();
    this.projectileSystem.clear();
    this.impactEffectSystem.clear();
    this.playerController.state.position.set(0, 1.6, 0);
    this.playerController.state.yaw = 0;
    this.playerController.state.pitch = 0;
    this.playerController.state.fireCooldownSeconds = 0;
    this.gameStateStore.resetRun();
    this.weaponController.reset();
    this.lastAppState = "playing";
  }
}
