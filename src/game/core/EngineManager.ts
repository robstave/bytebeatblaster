import { Engine } from "@babylonjs/core/Engines/engine";

/** Owns the canvas and Babylon engine instance. */
export class EngineManager {
  private readonly canvas: HTMLCanvasElement;
  private readonly engine: Engine;

  public constructor() {
    this.canvas = this.createCanvas();
    this.engine = new Engine(this.canvas, true);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getEngine(): Engine {
    return this.engine;
  }

  public runRenderLoop(render: () => void): void {
    this.engine.runRenderLoop(render);
  }

  public resize(): void {
    this.engine.resize();
  }

  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.id = "game-canvas";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.display = "block";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";
    document.body.appendChild(canvas);
    return canvas;
  }
}
