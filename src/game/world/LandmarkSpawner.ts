import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Mesh } from "@babylonjs/core/Meshes/mesh";

/** Creates sparse landmark meshes for orientation cues. */
export class LandmarkSpawner {
  public spawn(scene: Scene): Mesh[] {
    const material = new StandardMaterial("landmark-material", scene);
    material.diffuseColor = new Color3(0.36, 0.3, 0.65);

    const meshes: Mesh[] = [];
    const positions = [
      [-65, -40],
      [75, -60],
      [60, 70],
      [-75, 80]
    ];

    for (let i = 0; i < positions.length; i += 1) {
      const [x, z] = positions[i];
      const mesh = i % 2 === 0
        ? MeshBuilder.CreateCylinder(`landmark-${i}`, { diameter: 6, height: 20 }, scene)
        : MeshBuilder.CreateBox(`landmark-${i}`, { width: 8, depth: 8, height: 16 }, scene);
      mesh.position.set(x, mesh.getBoundingInfo().boundingBox.extendSize.y, z);
      mesh.material = material;
      meshes.push(mesh);
    }

    return meshes;
  }
}
