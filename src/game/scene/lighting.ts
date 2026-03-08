import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";

/** Creates simple high-readability lighting. */
export function createLighting(scene: Scene): void {
  const light = new HemisphericLight("world-light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.95;
}
