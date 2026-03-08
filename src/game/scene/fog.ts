import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Scene } from "@babylonjs/core/scene";

/** Configures distance fog for horizon compression and bounds readability. */
export function configureFog(scene: Scene): void {
  scene.clearColor.set(0.03, 0.04, 0.06, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.006;
  scene.fogColor = new Color3(0.03, 0.04, 0.06);
}
