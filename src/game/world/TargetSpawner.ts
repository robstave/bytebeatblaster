import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { TargetEntity } from "../entities/types";

/** Spawns alien-bug enemies that chase the player. */
export class TargetSpawner {
  /* ── healthy materials ── */
  private readonly bodyMat: StandardMaterial;
  private readonly shellMat: StandardMaterial;
  private readonly headMat: StandardMaterial;
  private readonly eyeMat: StandardMaterial;
  private readonly legMat: StandardMaterial;

  /* ── damaged materials ── */
  private readonly bodyDmgMat: StandardMaterial;
  private readonly shellDmgMat: StandardMaterial;
  private readonly headDmgMat: StandardMaterial;
  private readonly legDmgMat: StandardMaterial;

  public constructor(private readonly scene: Scene) {
    /* --- healthy palette (dark crimson / chitinous) --- */
    this.bodyMat = this.mat("bug-body", 0.50, 0.08, 0.12, 0.16, 0.02, 0.03);
    this.shellMat = this.mat("bug-shell", 0.38, 0.06, 0.18, 0.10, 0.01, 0.05);
    this.headMat = this.mat("bug-head", 0.42, 0.06, 0.08, 0.11, 0.01, 0.02);
    this.legMat = this.mat("bug-leg", 0.28, 0.07, 0.06, 0.07, 0.02, 0.01);

    this.eyeMat = new StandardMaterial("bug-eye", scene);
    this.eyeMat.diffuseColor = new Color3(0.2, 1.0, 0.3);
    this.eyeMat.emissiveColor = new Color3(0.15, 0.7, 0.2);

    /* --- damaged palette (angry orange) --- */
    this.bodyDmgMat = this.mat("bug-body-d", 1.0, 0.42, 0.08, 0.32, 0.12, 0.02);
    this.shellDmgMat = this.mat("bug-shell-d", 0.85, 0.32, 0.06, 0.26, 0.10, 0.02);
    this.headDmgMat = this.mat("bug-head-d", 0.90, 0.35, 0.06, 0.28, 0.10, 0.02);
    this.legDmgMat = this.mat("bug-leg-d", 0.60, 0.20, 0.04, 0.18, 0.06, 0.01);
  }

  /** Spawn a bug at a safe distance from the player. */
  public spawn(playerPosition: Vector3): TargetEntity {
    const root = this.buildBugMesh();

    const radius =
      gameConfig.targetSafeRadius + Math.random() * (gameConfig.worldHalfSize * 0.7);
    const angle = Math.random() * Math.PI * 2;
    const x = playerPosition.x + Math.cos(angle) * radius;
    const z = playerPosition.z + Math.sin(angle) * radius;
    root.position.set(
      Math.max(-gameConfig.worldHalfSize + 2, Math.min(gameConfig.worldHalfSize - 2, x)),
      1.0,
      Math.max(-gameConfig.worldHalfSize + 2, Math.min(gameConfig.worldHalfSize - 2, z))
    );

    return {
      mesh: root,
      health: gameConfig.targetHealth,
      maxHealth: gameConfig.targetHealth,
      scoreValue: gameConfig.targetScore,
      damageState: "healthy",
    };
  }

  /** Apply damaged colour scheme to all sub-meshes. */
  public setDamagedAppearance(target: TargetEntity): void {
    const root = target.mesh;
    root.material = this.bodyDmgMat;
    for (const child of root.getChildMeshes(false)) {
      const n = child.name;
      if (n.startsWith("bug-shell") || n.startsWith("bug-ridge")) {
        child.material = this.shellDmgMat;
      } else if (n.startsWith("bug-head") || n.startsWith("bug-mandible")) {
        child.material = this.headDmgMat;
      } else if (n.startsWith("bug-leg")) {
        child.material = this.legDmgMat;
      }
      // eyes keep their glow
    }
    target.damageState = "damaged";
  }

  /* ================================================================
   * Alien bug mesh assembly — all primitives parented to the body
   * ================================================================ */
  private buildBugMesh(): Mesh {
    const s = this.scene;

    // ── body (thorax): squat ellipsoid ──
    const body = MeshBuilder.CreateSphere(
      "bug-body",
      { diameterX: 2.0, diameterY: 1.2, diameterZ: 2.4, segments: 10 },
      s,
    );
    body.material = this.bodyMat;

    // ── abdomen: larger bulbous segment behind the thorax ──
    const abdomen = MeshBuilder.CreateSphere(
      "bug-shell-abdomen",
      { diameterX: 2.4, diameterY: 1.5, diameterZ: 2.2, segments: 10 },
      s,
    );
    abdomen.position.set(0, 0.05, -1.5);
    abdomen.parent = body;
    abdomen.material = this.shellMat;

    // ── shell ridges (3 carapace plates on the abdomen) ──
    for (let i = 0; i < 3; i++) {
      const ridge = MeshBuilder.CreateCylinder(
        `bug-ridge-${i}`,
        { diameter: 2.0 - i * 0.35, height: 0.06, tessellation: 12 },
        s,
      );
      ridge.position.set(0, 0.6 + i * 0.04, -1.2 - i * 0.5);
      ridge.parent = body;
      ridge.material = this.shellMat;
    }

    // ── head ──
    const head = MeshBuilder.CreateSphere(
      "bug-head",
      { diameterX: 1.2, diameterY: 1.0, diameterZ: 1.0, segments: 8 },
      s,
    );
    head.position.set(0, 0.1, 1.45);
    head.parent = body;
    head.material = this.headMat;

    // ── compound eyes (bright green) ──
    for (const side of [-1, 1]) {
      const eye = MeshBuilder.CreateSphere(
        `bug-eye-${side < 0 ? "l" : "r"}`,
        { diameter: 0.4, segments: 8 },
        s,
      );
      eye.position.set(side * 0.38, 0.22, 1.82);
      eye.parent = body;
      eye.material = this.eyeMat;
    }

    // ── mandibles (small tapering cones) ──
    for (const side of [-1, 1]) {
      const m = MeshBuilder.CreateCylinder(
        `bug-mandible-${side < 0 ? "l" : "r"}`,
        { diameterTop: 0.04, diameterBottom: 0.15, height: 0.6, tessellation: 6 },
        s,
      );
      m.position.set(side * 0.3, -0.15, 2.05);
      m.rotation.set(0.6, side * -0.35, 0);
      m.parent = body;
      m.material = this.headMat;
    }

    // ── antennae (thin forward-reaching feelers) ──
    for (const side of [-1, 1]) {
      const ant = MeshBuilder.CreateCylinder(
        `bug-leg-ant-${side < 0 ? "l" : "r"}`,
        { diameterTop: 0.03, diameterBottom: 0.06, height: 1.1, tessellation: 6 },
        s,
      );
      ant.position.set(side * 0.25, 0.45, 1.9);
      ant.rotation.set(-0.7, side * 0.3, side * 0.15);
      ant.parent = body;
      ant.material = this.legMat;
    }

    // ── legs: 3 pairs, angled outward ──
    const legDefs = [
      { z: 0.55, xOff: 1.05, tilt: 0.65 },
      { z: -0.05, xOff: 1.15, tilt: 0.55 },
      { z: -0.65, xOff: 1.05, tilt: 0.65 },
    ];
    for (let i = 0; i < legDefs.length; i++) {
      const lp = legDefs[i];
      for (const side of [-1, 1]) {
        const leg = MeshBuilder.CreateCylinder(
          `bug-leg-${side < 0 ? "l" : "r"}${i}`,
          { diameter: 0.12, height: 1.5, tessellation: 6 },
          s,
        );
        leg.position.set(side * lp.xOff, -0.35, lp.z);
        leg.rotation.z = side * -lp.tilt;
        leg.parent = body;
        leg.material = this.legMat;
      }
    }

    return body;
  }

  /* ── helper: create a StandardMaterial with diffuse + emissive ── */
  private mat(
    name: string,
    dr: number, dg: number, db: number,
    er: number, eg: number, eb: number,
  ): StandardMaterial {
    const m = new StandardMaterial(name, this.scene);
    m.diffuseColor = new Color3(dr, dg, db);
    m.emissiveColor = new Color3(er, eg, eb);
    return m;
  }
}
