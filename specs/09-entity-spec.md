# 09 — Entity Spec

## MVP entity roster

### Player
Purpose:
- controlled actor

Required data:
- position
- rotation
- health
- fire cooldown

### Projectile
Purpose:
- visible player shot

Required data:
- position
- direction
- speed
- lifetime
- damage
- owner tag

### TargetDummy
Purpose:
- simplest destructible scoring target

Required data:
- position
- health
- score value

### ShooterEnemy
Purpose:
- optional next-step threat with return fire

Required data:
- position
- health
- fire timer
- move behavior state

### Landmark
Purpose:
- orientation and world identity

Required data:
- transform
- shape type
- collision flag

## Modeling guidance

Use plain typed objects plus system ownership for MVP. Avoid full ECS unless the project explicitly expands in that direction.
