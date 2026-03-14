# 12 — Input Spec

## Inputs

- W / A / S / D: movement
- Mouse: look
- Left click: fire
- R: restart
- P: pause/resume during active run
- Escape: release pointer lock as browser allows

## Abstraction rule

Gameplay code should consume semantic actions, not raw DOM events directly.

## Pointer lock

- requested on start interaction
- clear user prompt when not yet locked
- robust behavior when pointer lock is lost
