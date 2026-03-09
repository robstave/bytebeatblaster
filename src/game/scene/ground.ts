import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";

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
  ctx.fillStyle = "#0f131a";
  ctx.fillRect(0, 0, textureSize, textureSize);
  const step = 16;
  for (let x = 0; x < textureSize; x += step) {
    const major = x % 64 === 0;
    ctx.strokeStyle = major ? "#5671a0" : "#31445f";
    ctx.lineWidth = major ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, textureSize);
    ctx.stroke();
  }
  for (let y = 0; y < textureSize; y += step) {
    const major = y % 64 === 0;
    ctx.strokeStyle = major ? "#5a6f97" : "#2d3d56";
    ctx.lineWidth = major ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(textureSize, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#66a8ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(textureSize / 2, 0);
  ctx.lineTo(textureSize / 2, textureSize);
  ctx.stroke();
  ctx.strokeStyle = "#90cf8d";
  ctx.beginPath();
  ctx.moveTo(0, textureSize / 2);
  ctx.lineTo(textureSize, textureSize / 2);
  ctx.stroke();
  gridTexture.update();

  const material = new StandardMaterial("ground-material", scene);
  material.diffuseTexture = gridTexture;
  material.specularColor.set(0, 0, 0);
  material.emissiveColor.set(0.05, 0.05, 0.08);
  gridTexture.uScale = 60;
  gridTexture.vScale = 60;
  ground.material = material;

  const edgeMaterial = new StandardMaterial("arena-edge-material", scene);
  edgeMaterial.diffuseColor = new Color3(0.22, 0.28, 0.35);
  edgeMaterial.emissiveColor = new Color3(0.09, 0.11, 0.16);

  const edgeWidth = worldHalfSize * 2 + 6;
  const edgeHeight = 6;
  const thickness = 2;
  const north = MeshBuilder.CreateBox("arena-edge-n", { width: edgeWidth, depth: thickness, height: edgeHeight }, scene);
  north.position.set(0, edgeHeight / 2, worldHalfSize + thickness / 2);
  north.material = edgeMaterial;
  const south = north.clone("arena-edge-s");
  if (south !== null) {
    south.position.z = -worldHalfSize - thickness / 2;
  }

  const west = MeshBuilder.CreateBox("arena-edge-w", { width: thickness, depth: edgeWidth, height: edgeHeight }, scene);
  west.position.set(-worldHalfSize - thickness / 2, edgeHeight / 2, 0);
  west.material = edgeMaterial;
  const east = west.clone("arena-edge-e");
  if (east !== null) {
    east.position.x = worldHalfSize + thickness / 2;
  }
}
