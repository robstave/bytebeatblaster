import { Scene } from "@babylonjs/core/scene";
import { EngineManager } from "./EngineManager";
import { createMainScene } from "../scene/createMainScene";

/** Creates and owns game scenes. */
export class SceneManager {
  public constructor(private readonly engineManager: EngineManager) {}

  public createMainScene(): Scene {
    return createMainScene(this.engineManager.getEngine());
  }
}
