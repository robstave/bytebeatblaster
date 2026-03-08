import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";

/** Creates a large patterned ground plane for orientation. */
export function createGround(scene: Scene, worldHalfSize: number): void {
  const ground = MeshBuilder.CreateGround(
    "arena-ground",
    { width: worldHalfSize * 2, height: worldHalfSize * 2, subdivisions: 2 },
    scene
  );

  const textureSize = 256;
  const gridTexture = new DynamicTexture("ground-grid", textureSize, scene, false);
  const ctx = gridTexture.getContext();
  ctx.fillStyle = "#10131a";
  ctx.fillRect(0, 0, textureSize, textureSize);
  ctx.strokeStyle = "#4a6288";
  ctx.lineWidth = 3;
  const step = 32;
  for (let x = 0; x < textureSize; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, textureSize);
    ctx.stroke();
  }
  for (let y = 0; y < textureSize; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(textureSize, y);
    ctx.stroke();
  }
  gridTexture.update();

  const material = new StandardMaterial("ground-material", scene);
  material.diffuseTexture = gridTexture;
  material.specularColor.set(0, 0, 0);
  material.emissiveColor.set(0.05, 0.05, 0.08);
  gridTexture.uScale = 60;
  gridTexture.vScale = 60;
  ground.material = material;
}
