import { EngineManager } from "./core/EngineManager";
import { SceneManager } from "./core/SceneManager";
import { HUDManager } from "./ui/HUDManager";

/** Wires together the initial engine, scene, and HUD shell. */
export class GameBootstrap {
  private readonly engineManager: EngineManager;
  private readonly sceneManager: SceneManager;
  private readonly hudManager: HUDManager;

  public constructor() {
    this.engineManager = new EngineManager();
    this.sceneManager = new SceneManager(this.engineManager);
    this.hudManager = new HUDManager();
  }

  public start(): void {
    const scene = this.sceneManager.createMainScene();
    this.hudManager.mount();

    this.engineManager.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener("resize", () => {
      this.engineManager.resize();
    });
  }
}
