import { Scene } from "@babylonjs/core/scene";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createLighting } from "./lighting";
import { configureFog } from "./fog";
import { createGround } from "./ground";
import { gameConfig } from "../config/gameConfig";

/** Creates the base scene resources and static arena shell. */
export function createMainScene(engine: Engine): Scene {
  const scene = new Scene(engine);
  configureFog(scene);
  createLighting(scene);
  createGround(scene, gameConfig.worldHalfSize);
  return scene;
}
