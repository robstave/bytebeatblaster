import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

export interface LandmarkSpawnResult {
  meshes: Mesh[];
  cylinderTopPoints: Vector3[];
}

/** Creates sparse crystal-spire landmark meshes for orientation cues. */
export class LandmarkSpawner {
  public spawn(scene: Scene): LandmarkSpawnResult {
    const bedrockMaterial = new StandardMaterial("landmark-bedrock-material", scene);
    bedrockMaterial.diffuseColor = new Color3(0.2, 0.29, 0.46);

    const crystalMaterial = new StandardMaterial("landmark-crystal-material", scene);
    crystalMaterial.diffuseColor = new Color3(0.46, 0.88, 1);
    crystalMaterial.emissiveColor = new Color3(0.06, 0.2, 0.28);
    crystalMaterial.alpha = 0.92;

    const meshes: Mesh[] = [];
    const cylinderTopPoints: Vector3[] = [];
    const positions = [
      [-65, -40],
      [75, -60],
      [60, 70],
      [-75, 80]
    ];

    for (let i = 0; i < positions.length; i += 1) {
      const [x, z] = positions[i];
      const root = new TransformNode(`landmark-root-${i}`, scene);
      root.position.set(x, 0, z);

      const base = MeshBuilder.CreateCylinder(
        `landmark-base-${i}`,
        { diameterTop: 6.6, diameterBottom: 8.4, height: 8, tessellation: 6 },
        scene
      );
      base.parent = root;
      base.position.y = 4;
      base.material = bedrockMaterial;
      meshes.push(base);

      const spire = MeshBuilder.CreateCylinder(
        `landmark-spire-${i}`,
        { diameterTop: 0.5, diameterBottom: 5.8, height: 12, tessellation: 6 },
        scene
      );
      spire.parent = root;
      spire.position.y = 14;
      spire.material = crystalMaterial;
      meshes.push(spire);

      const shardOffsets: Array<{ x: number; y: number; z: number; h: number; w: number }> = [
        { x: -2.8, y: 6.2, z: 1.1, h: 5.3, w: 1.4 },
        { x: 2.4, y: 6.8, z: -1.2, h: 4.8, w: 1.2 },
        { x: 0.8, y: 8.1, z: 2.6, h: 4.2, w: 1.15 },
        { x: -1.6, y: 7.1, z: -2.5, h: 3.8, w: 1.05 }
      ];

      for (let s = 0; s < shardOffsets.length; s += 1) {
        const shardData = shardOffsets[s];
        const shard = MeshBuilder.CreateCylinder(
          `landmark-shard-${i}-${s}`,
          {
            diameterTop: shardData.w * 0.25,
            diameterBottom: shardData.w,
            height: shardData.h,
            tessellation: 6
          },
          scene
        );
        shard.parent = root;
        shard.position.set(shardData.x, shardData.y, shardData.z);
        shard.rotation.x = -0.22 + s * 0.09;
        shard.rotation.z = 0.18 - s * 0.08;
        shard.material = crystalMaterial;
        meshes.push(shard);
      }

      cylinderTopPoints.push(new Vector3(x, 20.5, z));
    }

    return { meshes, cylinderTopPoints };
  }
}
