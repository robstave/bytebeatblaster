# 04 — Technical Architecture

## Stack

- TypeScript
- Vite
- Babylon.js

## Folder structure

```text
src/
  main.ts
  game/
    GameBootstrap.ts
    config/
    core/
    scene/
    player/
    combat/
    world/
    entities/
    audio/
    ui/
    utils/
```

## Runtime modules

- `GameBootstrap` — app entry and top-level wiring
- `EngineManager` — Babylon engine and canvas ownership
- `SceneManager` — active scene construction and access
- `GameLoop` — fixed ordering of update steps
- `GameStateStore` — central runtime state container
- `InputManager` — raw input normalization into gameplay actions
- `AudioManager` — user-gesture-safe audio initialization and playback
- `HUDManager` — DOM HUD and state display
- `WorldManager` — arena, landmarks, and spawn coordination
- `ProjectileSystem` — projectile updates and cleanup
- `CollisionSystem` — hit testing and collision consequences

## State domains

- app state: boot, ready, playing, gameOver
- player state: transform, health, fire cooldown
- world state: arena config, landmark seeds, spawn timers
- combat state: active projectiles, enemy counts
- UI state: score, best score, messages

## Update order

1. sample input
2. update player controller
3. update camera attachments or recoil
4. update world spawners
5. update projectiles
6. update enemies or targets
7. process collisions
8. commit score and health changes
9. update HUD
10. render frame

## Architectural rules

- Scene construction must not contain gameplay scoring logic
- Input code must not directly mutate arbitrary world entities
- Systems should operate on owned state and explicit dependencies
- Keep global mutable state to one owned store object where possible
- Avoid per-frame allocation churn

## Suggested communication model

Use direct method calls and explicit dependencies for MVP, not a full event bus unless it becomes clearly necessary.
