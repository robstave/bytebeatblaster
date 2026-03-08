# 13 — Performance Spec

## Goals

- smooth desktop browser play
- low complexity scene
- limited active entities
- stable frame pacing

## Constraints

- avoid expensive per-frame allocations
- cap active projectiles
- cap active enemies
- reuse resources where practical
- do not recreate materials every frame
- minimize DOM writes to HUD changes only

## Optimization posture

Optimize for clarity first, then fix measured hotspots. Do not pre-emptively overengineer.
