import { AudioManager } from "./audio/AudioManager";
import { CollisionSystem } from "./combat/CollisionSystem";
import { DamageSystem } from "./combat/DamageSystem";
import { ProjectileSystem } from "./combat/ProjectileSystem";
import { WeaponController } from "./combat/WeaponController";
import { EngineManager } from "./core/EngineManager";
import { GameLoop } from "./core/GameLoop";
import { GameStateStore } from "./core/GameStateStore";
import { InputManager } from "./core/InputManager";
import { SceneManager } from "./core/SceneManager";
import { PlayerController } from "./player/PlayerController";
import { PlayerView } from "./player/PlayerView";
import { HUDManager } from "./ui/HUDManager";
import { WorldManager } from "./world/WorldManager";

/** Wires all runtime systems and drives the application lifecycle. */
export class GameBootstrap {
  private readonly engineManager: EngineManager;
  private readonly sceneManager: SceneManager;
  private readonly hudManager: HUDManager;
  private readonly gameStateStore: GameStateStore;
  private readonly audioManager: AudioManager;

  public constructor() {
    this.engineManager = new EngineManager();
    this.sceneManager = new SceneManager(this.engineManager);
    this.hudManager = new HUDManager();
    this.gameStateStore = new GameStateStore();
    this.audioManager = new AudioManager();
  }

  public start(): void {
    const scene = this.sceneManager.createMainScene();
    const canvas = this.engineManager.getCanvas();

    const inputManager = new InputManager(canvas);
    const playerController = new PlayerController();
    const playerView = new PlayerView(scene, canvas);
    const worldManager = new WorldManager(scene);
    const projectileSystem = new ProjectileSystem(scene);
    const weaponController = new WeaponController();
    const damageSystem = new DamageSystem(this.gameStateStore);
    const collisionSystem = new CollisionSystem(worldManager, projectileSystem, damageSystem);
    const loop = new GameLoop(
      inputManager,
      playerController,
      playerView,
      worldManager,
      projectileSystem,
      weaponController,
      collisionSystem,
      this.gameStateStore,
      this.hudManager,
      this.audioManager
    );

    this.hudManager.mount();
    this.gameStateStore.setAppState("ready");

    canvas.addEventListener("click", () => {
      inputManager.requestPointerLock();
      this.audioManager.initialize();
      if (this.gameStateStore.getState().appState !== "gameOver") {
        this.gameStateStore.resetRun();
      }
    });

    let lastTime = performance.now();
    this.engineManager.runRenderLoop(() => {
      const now = performance.now();
      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      loop.update(deltaSeconds);
      scene.render();
    });

    window.addEventListener("resize", () => {
      this.engineManager.resize();
    });
  }
}
