# 08 — Combat Spec

## Weapon

One default blaster for MVP.

## Fire model

Projectile-based, not hitscan.

## Ammo

Infinite ammo in MVP.

## Fire cadence

- short cooldown
- repeat fire allowed by repeated input or hold, depending on implementation choice
- response must feel immediate

## Projectile rules

- visible mesh or glow
- finite lifetime
- cleaned up when expired or on collision
- cannot persist forever off-map

## Damage

- one damage type in MVP
- targets have simple health pools
- player also has a simple health pool

## Feedback

- audio on shot
- visual projectile
- hit flash or similar confirmation
- score increase on destroy

## Enemy offense

MVP may use either contact damage or simple enemy projectiles. Contact damage is acceptable for earliest milestone; enemy projectiles are preferred by later MVP.
