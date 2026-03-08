import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";

/** Owns the first-person camera presentation. */
export class PlayerView {
  public readonly camera: UniversalCamera;

  public constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new UniversalCamera("player-camera", new Vector3(0, 1.6, 0), scene);
    this.camera.fov = 1.05;
    this.camera.minZ = 0.1;
    this.camera.attachControl(canvas, false);
  }

  public sync(position: Vector3, yaw: number, pitch: number): void {
    this.camera.position.copyFrom(position);
    this.camera.rotation.y = yaw;
    this.camera.rotation.x = pitch;
  }
}
