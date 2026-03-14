import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { RawTexture } from "@babylonjs/core/Materials/Textures/rawTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";

/**
 * Build a checkerboard + grid RGBA buffer purely in JS.
 * Returns a Uint8Array of size*size*4 bytes.
 */
function buildGridBuffer(size: number): Uint8Array {
  const data = new Uint8Array(size * size * 4);
  const cell = size / 8; // 8×8 checker tiles

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      /* checkerboard base — two dark tones */
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      const dark = (cx + cy) % 2 === 0;
      const base = dark ? 14 : 33; // very subtle difference
      data[i] = base;
      data[i + 1] = base + 2;
      data[i + 2] = base + 6;
      data[i + 3] = 255;

      /* minor grid lines every cell/4 pixels */
      const minor = cell / 4;
      if (x % minor < 1 || y % minor < 1) {
        data[i] = base + 22;
        data[i + 1] = base + 18;
        data[i + 2] = base + 30;
      }

      /* major grid lines at tile boundaries */
      if (x % cell < 1 || y % cell < 1) {
        data[i] = base + 22;
        data[i + 1] = base + 32;
        data[i + 2] = base + 50;
      }
    }
  }
  return data;
}

/** Creates a large patterned ground plane for orientation. */
export function createGround(scene: Scene, worldHalfSize: number): void {
  const ground = MeshBuilder.CreateGround(
    "arena-ground",
    { width: worldHalfSize * 2, height: worldHalfSize * 2, subdivisions: 2 },
    scene
  );

  /* Generate a 256×256 RGBA grid texture */
  const texSize = 256;
  const buf = buildGridBuffer(texSize);
  const gridTexture = RawTexture.CreateRGBATexture(
    buf,
    texSize,
    texSize,
    scene,
    false,
    false,
    Texture.NEAREST_SAMPLINGMODE
  );
  gridTexture.wrapU = Texture.WRAP_ADDRESSMODE;
  gridTexture.wrapV = Texture.WRAP_ADDRESSMODE;
  gridTexture.uScale = 30;
  gridTexture.vScale = 30;

  const material = new StandardMaterial("ground-material", scene);
  material.specularColor = new Color3(0, 0, 0);
  material.diffuseTexture = gridTexture;
  material.emissiveTexture = gridTexture;
  material.emissiveColor = new Color3(0, 0, 0);
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
