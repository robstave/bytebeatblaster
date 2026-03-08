import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { EngineManager } from "./EngineManager";

/** Creates and owns game scenes. */
export class SceneManager {
  public constructor(private readonly engineManager: EngineManager) {}

  public createMainScene(): Scene {
    const scene = new Scene(this.engineManager.getEngine());
    scene.clearColor.set(0.02, 0.02, 0.03, 1);

    const camera = new ArcRotateCamera(
      "bootstrap-camera",
      Math.PI / 4,
      Math.PI / 3,
      40,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(this.engineManager.getCanvas(), true);

    new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
    const groundMaterial = new StandardMaterial("ground-material", scene);
    groundMaterial.diffuseColor = new Color3(0.15, 0.15, 0.18);
    ground.material = groundMaterial;

    const landmark = MeshBuilder.CreateBox("landmark-box", { size: 5 }, scene);
    landmark.position.y = 2.5;
    landmark.position.z = 10;

    return scene;
  }
}
