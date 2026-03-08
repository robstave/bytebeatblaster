# 06 — Player Controller Spec

## Camera mode

First-person.

## Movement

- WASD movement
- strafe enabled
- no jump in MVP
- no sprint in MVP unless added later
- responsive acceleration and stopping
- low inertia feel

## Look

- mouse look primary
- keyboard look fallback optional
- pitch clamped to reasonable limits
- yaw unrestricted

## Collisions

- cannot leave world bounds
- collision response should be simple and readable
- avoid sticky collisions

## Health

- player has a finite health pool
- damage taken from enemy projectiles and/or contact
- game enters game-over state at zero health

## Design goal

The controller should feel tight and arcade-like, not realistic or floaty.
