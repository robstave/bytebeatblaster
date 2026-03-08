import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { gameConfig } from "../config/gameConfig";
import { clamp } from "../utils/math";
import { InputSnapshot } from "../core/InputManager";
import { PlayerState } from "./PlayerState";

/** Updates player movement and look using semantic input actions. */
export class PlayerController {
  public readonly state: PlayerState = {
    position: new Vector3(0, 1.6, 0),
    yaw: 0,
    pitch: 0,
    health: gameConfig.initialHealth,
    fireCooldownSeconds: 0
  };

  public update(input: InputSnapshot, deltaSeconds: number): void {
    this.state.yaw -= input.lookDeltaX * gameConfig.mouseSensitivity;
    this.state.pitch = clamp(
      this.state.pitch - input.lookDeltaY * gameConfig.mouseSensitivity,
      -1.35,
      1.35
    );

    const sinYaw = Math.sin(this.state.yaw);
    const cosYaw = Math.cos(this.state.yaw);
    const moveForwardX = sinYaw;
    const moveForwardZ = cosYaw;
    const moveRightX = cosYaw;
    const moveRightZ = -sinYaw;

    const velocityX =
      (moveForwardX * input.moveZ + moveRightX * input.moveX) * gameConfig.moveSpeed * deltaSeconds;
    const velocityZ =
      (moveForwardZ * input.moveZ + moveRightZ * input.moveX) * gameConfig.moveSpeed * deltaSeconds;

    const half = gameConfig.worldHalfSize - 1;
    this.state.position.x = clamp(this.state.position.x + velocityX, -half, half);
    this.state.position.z = clamp(this.state.position.z + velocityZ, -half, half);

    this.state.fireCooldownSeconds = Math.max(0, this.state.fireCooldownSeconds - deltaSeconds);
  }
}
