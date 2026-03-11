import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { gameConfig } from "../config/gameConfig";
import { ByteBeatOrbEntity, TargetEntity, TurretEntity } from "../entities/types";
import { LandmarkSpawner } from "./LandmarkSpawner";
import { TargetSpawner } from "./TargetSpawner";
import { TurretSpawner } from "./TurretSpawner";

interface UfoPass {
  root: TransformNode;
  start: Vector3;
  end: Vector3;
  progress: number;
  distance: number;
  fireTimerSeconds: number;
}

interface HealthPickup {
  mesh: Mesh;
  spinRate: number;
}

/** Owns landmarks, target/turret spawning, and world-level enemy updates. */
export class WorldManager {
  private readonly scene: Scene;
  private readonly targetSpawner: TargetSpawner;
  private readonly turretSpawner: TurretSpawner;
  private landmarks: Mesh[] = [];
  private readonly targets: TargetEntity[] = [];
  private readonly turrets: TurretEntity[] = [];
  private readonly byteBeatOrbs: ByteBeatOrbEntity[] = [];
  private spawnTimerSeconds = 0;
  private level = 1;
  private levelMessageSeconds = 0;
  private readonly ufoMaterial: StandardMaterial;
  private readonly byteBeatOrbMaterial: StandardMaterial;
  private activeUfo: UfoPass | null = null;
  private ufoSpawnTimerSeconds: number = gameConfig.ufoSpawnMinDelaySeconds;
  private readonly ufoTravel = new Vector3();
  private healthPickup: HealthPickup | null = null;
  private readonly healthPickupMaterial: StandardMaterial;
  private regularEnemyKillCount = 0;
  private byteBeatSpawnTimerSeconds: number = gameConfig.byteBeatOrbSpawnIntervalSeconds;

  public constructor(scene: Scene) {
    this.scene = scene;
    this.targetSpawner = new TargetSpawner(scene);
    this.turretSpawner = new TurretSpawner(scene);
    const landmarkResult = new LandmarkSpawner().spawn(scene);
    this.landmarks = landmarkResult.meshes;
    this.ufoMaterial = new StandardMaterial("ufo-material", scene);
    this.ufoMaterial.diffuseColor = new Color3(0.4, 0.88, 1);
    this.ufoMaterial.emissiveColor = new Color3(0.06, 0.2, 0.26);

    this.byteBeatOrbMaterial = new StandardMaterial("bytebeat-orb-material", scene);
    this.byteBeatOrbMaterial.diffuseColor = new Color3(0.85, 0.22, 1);
    this.byteBeatOrbMaterial.emissiveColor = new Color3(0.26, 0.06, 0.38);

    this.healthPickupMaterial = new StandardMaterial("health-pickup-material", scene);
    this.healthPickupMaterial.diffuseColor = new Color3(0.12, 1, 0.18);
    this.healthPickupMaterial.emissiveColor = new Color3(0.08, 0.6, 0.12);
    this.rebuildTurrets();
  }

  public update(playerPosition: Vector3, deltaSeconds: number): void {
    this.levelMessageSeconds = Math.max(0, this.levelMessageSeconds - deltaSeconds);

    this.spawnTimerSeconds -= deltaSeconds;
    if (this.spawnTimerSeconds <= 0 && this.targets.length < gameConfig.maxTargets) {
      this.targets.push(this.targetSpawner.spawn(playerPosition));
      this.spawnTimerSeconds = gameConfig.targetSpawnIntervalSeconds;
    }

    for (const turret of this.turrets) {
      turret.fireTimerSeconds -= deltaSeconds;

      const dx = playerPosition.x - turret.root.position.x;
      const dz = playerPosition.z - turret.root.position.z;
      turret.head.rotation.y = Math.atan2(dx, dz);
    }

    for (const target of this.targets) {
      const move = playerPosition.subtract(target.mesh.position);
      move.y = 0;
      if (move.lengthSquared() > 0.0001) {
        move.normalize();
        target.mesh.position.addInPlace(move.scale(gameConfig.targetMoveSpeed * deltaSeconds));
      }
    }

    this.updateByteBeatOrbs(playerPosition, deltaSeconds);
    this.updateUfo(playerPosition, deltaSeconds);
    if (this.healthPickup !== null) {
      this.healthPickup.mesh.rotation.y += this.healthPickup.spinRate * deltaSeconds;
    }

    if (this.turrets.length === 0) {
      this.level += 1;
      this.levelMessageSeconds = 2.2;
      this.rebuildTurrets();
    }
  }

  public collectTurretShots(playerPosition: Readonly<Vector3>): Array<{ origin: Vector3; direction: Vector3 }> {
    const shotData: Array<{ origin: Vector3; direction: Vector3 }> = [];

    for (const turret of this.turrets) {
      if (turret.fireTimerSeconds > 0) {
        continue;
      }

      const turretPos = turret.root.position;
      const direction = playerPosition.subtract(turretPos);
      if (direction.lengthSquared() <= 0.001) {
        turret.fireTimerSeconds = gameConfig.turretFireIntervalSeconds;
        continue;
      }

      shotData.push({
        origin: turretPos.clone(),
        direction: direction.normalize()
      });
      turret.fireTimerSeconds = gameConfig.turretFireIntervalSeconds;
    }

    return shotData;
  }

  public collectUfoShots(playerPosition: Readonly<Vector3>): Array<{ origin: Vector3; direction: Vector3 }> {
    if (this.activeUfo === null) {
      return [];
    }

    const ufo = this.activeUfo;
    if (ufo.fireTimerSeconds > 0) {
      return [];
    }

    ufo.fireTimerSeconds = gameConfig.ufoFireIntervalSeconds;
    const targetDirection = playerPosition.subtract(ufo.root.position);
    if (targetDirection.lengthSquared() <= 0.001) {
      return [];
    }

    const scatterYaw = (Math.random() * 2 - 1) * gameConfig.ufoShotScatterRadians;
    const scatterPitch = (Math.random() * 2 - 1) * gameConfig.ufoShotScatterRadians * 0.5;
    const direction = targetDirection.normalize();
    direction.x += Math.sin(scatterYaw) * 0.3;
    direction.y += scatterPitch;
    direction.z += Math.cos(scatterYaw) * 0.3 - 0.3;
    direction.normalize();

    return [{
      origin: ufo.root.position.clone(),
      direction
    }];
  }

  public getTargets(): readonly TargetEntity[] {
    return this.targets;
  }

  public getTurrets(): readonly TurretEntity[] {
    return this.turrets;
  }

  public getByteBeatOrbs(): readonly ByteBeatOrbEntity[] {
    return this.byteBeatOrbs;
  }

  public getNearestByteBeatOrbDistance(playerPosition: Readonly<Vector3>): number | null {
    if (this.byteBeatOrbs.length === 0) {
      return null;
    }

    let nearest = Number.POSITIVE_INFINITY;
    for (const orb of this.byteBeatOrbs) {
      const dist = Vector3.Distance(orb.mesh.position, playerPosition);
      if (dist < nearest) {
        nearest = dist;
      }
    }

    return nearest;
  }

  public removeTarget(target: TargetEntity): void {
    const index = this.targets.indexOf(target);
    if (index >= 0) {
      this.targets[index].mesh.dispose();
      this.targets.splice(index, 1);
    }
  }

  public applyTargetHit(target: TargetEntity, damage: number): boolean {
    target.health -= damage;
    if (target.health > 0 && target.damageState === "healthy") {
      this.targetSpawner.setDamagedAppearance(target);
    }
    if (target.health <= 0) {
      this.removeTarget(target);
      this.regularEnemyKillCount += 1;
      if (this.regularEnemyKillCount % gameConfig.regularKillsPerHealthPickup === 0) {
        this.spawnHealthPickup();
      }
      return true;
    }
    return false;
  }

  public applyByteBeatOrbHit(orb: ByteBeatOrbEntity, damage: number): boolean {
    orb.health -= damage;
    if (orb.health <= 0) {
      this.removeByteBeatOrb(orb);
      return true;
    }

    const healthRatio = Math.max(0.2, orb.health / gameConfig.byteBeatOrbHealth);
    orb.mesh.scaling.setAll(0.8 + healthRatio * 0.4);
    return false;
  }

  public tryCollectHealthPickup(playerPosition: Readonly<Vector3>): number {
    if (this.healthPickup === null) {
      return 0;
    }
    const distance = Vector3.Distance(playerPosition, this.healthPickup.mesh.position);
    if (distance > gameConfig.healthPickupCollisionRadius) {
      return 0;
    }

    this.healthPickup.mesh.dispose();
    this.healthPickup = null;
    return gameConfig.healthPickupValue;
  }

  public removeTurret(turret: TurretEntity): void {
    const index = this.turrets.indexOf(turret);
    if (index >= 0) {
      this.turrets[index].root.dispose(false, true);
      this.turrets.splice(index, 1);
    }
  }

  public reset(): void {
    for (const target of this.targets) {
      target.mesh.dispose();
    }
    this.targets.length = 0;
    this.level = 1;
    this.levelMessageSeconds = 0;
    this.spawnTimerSeconds = 0;
    this.regularEnemyKillCount = 0;
    this.clearUfo();
    this.ufoSpawnTimerSeconds = gameConfig.ufoSpawnMinDelaySeconds;
    this.byteBeatSpawnTimerSeconds = gameConfig.byteBeatOrbSpawnIntervalSeconds;
    if (this.healthPickup !== null) {
      this.healthPickup.mesh.dispose();
      this.healthPickup = null;
    }
    for (const orb of this.byteBeatOrbs) {
      orb.mesh.dispose();
    }
    this.byteBeatOrbs.length = 0;
    this.rebuildTurrets();
  }

  public getLevel(): number {
    return this.level;
  }

  public getLevelMessage(): string {
    if (this.levelMessageSeconds <= 0) {
      return "";
    }
    return `Next Level: ${this.level}`;
  }

  public dispose(): void {
    this.reset();
    for (const turret of this.turrets) {
      turret.root.dispose(false, true);
    }
    this.turrets.length = 0;

    for (const landmark of this.landmarks) {
      landmark.dispose();
    }
    this.landmarks = [];
  }

  private rebuildTurrets(): void {
    for (const turret of this.turrets) {
      turret.root.dispose(false, true);
    }
    this.turrets.length = 0;

    const count = gameConfig.baseTurretCount + (this.level - 1);
    const radius = gameConfig.worldHalfSize * 0.62;
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + this.level * 0.27;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      this.turrets.push(this.turretSpawner.spawnAt(new Vector3(x, 1.4, z)));
    }
  }

  private updateByteBeatOrbs(playerPosition: Readonly<Vector3>, deltaSeconds: number): void {
    this.byteBeatSpawnTimerSeconds -= deltaSeconds;
    if (
      this.byteBeatSpawnTimerSeconds <= 0 &&
      this.byteBeatOrbs.length < gameConfig.maxByteBeatOrbs
    ) {
      this.spawnByteBeatOrb(playerPosition);
      this.byteBeatSpawnTimerSeconds = gameConfig.byteBeatOrbSpawnIntervalSeconds;
    }

    for (const orb of this.byteBeatOrbs) {
      const move = playerPosition.subtract(orb.mesh.position);
      move.y = 0;
      if (move.lengthSquared() > 0.0001) {
        move.normalize();
        orb.mesh.position.addInPlace(move.scale(gameConfig.byteBeatOrbMoveSpeed * deltaSeconds));
      }

      orb.sampleTime += deltaSeconds;
      const beat = this.byteBeatWave(orb.sampleTime);
      const scale = 1 + beat * 0.14;
      orb.mesh.scaling.set(scale, scale, scale);

      const emissive = 0.3 + beat * 0.28;
      this.byteBeatOrbMaterial.emissiveColor.set(0.26 + beat * 0.12, 0.06, emissive);
    }
  }

  private updateUfo(_playerPosition: Readonly<Vector3>, deltaSeconds: number): void {
    if (this.activeUfo === null) {
      this.ufoSpawnTimerSeconds -= deltaSeconds;
      if (this.ufoSpawnTimerSeconds <= 0) {
        this.spawnUfoPass();
      }
      return;
    }

    const ufo = this.activeUfo;
    ufo.fireTimerSeconds -= deltaSeconds;
    const moveAmount = (gameConfig.ufoSpeed * deltaSeconds) / ufo.distance;
    ufo.progress += moveAmount;
    if (ufo.progress >= 1) {
      this.clearUfo();
      this.ufoSpawnTimerSeconds =
        gameConfig.ufoSpawnMinDelaySeconds +
        Math.random() * (gameConfig.ufoSpawnMaxDelaySeconds - gameConfig.ufoSpawnMinDelaySeconds);
      return;
    }

    Vector3.LerpToRef(ufo.start, ufo.end, ufo.progress, ufo.root.position);
    ufo.root.rotation.y += deltaSeconds * 2.8;
  }

  private spawnUfoPass(): void {
    const half = gameConfig.worldHalfSize - 8;
    const y = gameConfig.ufoHeight;
    const side = Math.floor(Math.random() * 4);
    let start = new Vector3(-half, y, 0);
    let end = new Vector3(half, y, 0);

    if (side === 1) {
      start = new Vector3(half, y, 0);
      end = new Vector3(-half, y, 0);
    } else if (side === 2) {
      start = new Vector3(0, y, -half);
      end = new Vector3(0, y, half);
    } else if (side === 3) {
      start = new Vector3(0, y, half);
      end = new Vector3(0, y, -half);
    }

    const root = new TransformNode("ufo-root", this.scene);
    root.position.copyFrom(start);

    const hull = MeshBuilder.CreateCylinder("ufo-hull", { diameterTop: 1.7, diameterBottom: 7.2, height: 1.4, tessellation: 20 }, this.scene);
    hull.parent = root;
    hull.material = this.ufoMaterial;

    const dome = MeshBuilder.CreateSphere("ufo-dome", { diameter: 3.2, segments: 14 }, this.scene);
    dome.parent = root;
    dome.position.y = 0.8;
    dome.scaling.y = 0.55;
    dome.material = this.ufoMaterial;

    this.ufoTravel.copyFrom(end);
    this.ufoTravel.subtractInPlace(start);

    this.activeUfo = {
      root,
      start,
      end,
      progress: 0,
      distance: Math.max(this.ufoTravel.length(), 0.001),
      fireTimerSeconds: gameConfig.ufoFireIntervalSeconds * 0.3
    };
  }

  private clearUfo(): void {
    if (this.activeUfo !== null) {
      this.activeUfo.root.dispose(false, true);
      this.activeUfo = null;
    }
  }

  private spawnHealthPickup(): void {
    if (this.healthPickup !== null) {
      this.healthPickup.mesh.dispose();
    }

    const margin = 20;
    const span = (gameConfig.worldHalfSize - margin) * 2;
    const x = -gameConfig.worldHalfSize + margin + Math.random() * span;
    const z = -gameConfig.worldHalfSize + margin + Math.random() * span;
    const mesh = MeshBuilder.CreateTorus("health-pickup", { diameter: 2.5, thickness: 0.55, tessellation: 18 }, this.scene);
    mesh.position.set(x, 1.5, z);
    mesh.rotation.x = Math.PI / 2;
    mesh.material = this.healthPickupMaterial;

    this.healthPickup = {
      mesh,
      spinRate: 2.5
    };
  }

  private spawnByteBeatOrb(playerPosition: Readonly<Vector3>): void {
    const minRadius = gameConfig.targetSafeRadius + 18;
    const maxRadius = gameConfig.worldHalfSize * 0.85;
    const angle = Math.random() * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    const x = playerPosition.x + Math.cos(angle) * radius;
    const z = playerPosition.z + Math.sin(angle) * radius;

    const clampedX = Math.max(-gameConfig.worldHalfSize + 8, Math.min(gameConfig.worldHalfSize - 8, x));
    const clampedZ = Math.max(-gameConfig.worldHalfSize + 8, Math.min(gameConfig.worldHalfSize - 8, z));

    const mesh = MeshBuilder.CreateSphere("bytebeat-orb", { diameter: 4.2, segments: 16 }, this.scene);
    mesh.position.set(clampedX, gameConfig.byteBeatOrbHeight, clampedZ);
    mesh.material = this.byteBeatOrbMaterial;

    this.byteBeatOrbs.push({
      mesh,
      health: gameConfig.byteBeatOrbHealth,
      scoreValue: gameConfig.byteBeatOrbScore,
      sampleTime: 0
    });
  }

  private removeByteBeatOrb(orb: ByteBeatOrbEntity): void {
    const index = this.byteBeatOrbs.indexOf(orb);
    if (index >= 0) {
      this.byteBeatOrbs[index].mesh.dispose();
      this.byteBeatOrbs.splice(index, 1);
      this.byteBeatSpawnTimerSeconds = Math.min(
        this.byteBeatSpawnTimerSeconds,
        gameConfig.byteBeatOrbSpawnIntervalSeconds * 0.55
      );
    }
  }

  private byteBeatWave(sampleTime: number): number {
    const t = Math.floor(sampleTime * gameConfig.byteBeatAudioSampleRate);
    const raw = t * ((t ^ t + ((t >> 15) | 1) ^ (((t - 1280) ^ t) >> 10)) & 255);
    return ((raw & 255) / 127.5) - 1;
  }
}
