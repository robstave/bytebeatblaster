# 15 — Testing and Acceptance

## Smoke checklist

- app loads without fatal console errors
- canvas renders
- scene initializes after user interaction
- pointer lock can be entered

## Movement checklist

- player can move with WASD
- mouse look works
- world bounds prevent leaving arena
- movement feels responsive

## Combat checklist

- player can fire projectiles
- projectile visuals appear
- projectiles expire correctly
- projectiles hit valid targets
- score increments on destroy

## State checklist

- health decreases on damage
- game-over state appears at zero health
- restart works without page reload
- best score persists across refresh

## Audio checklist

- audio initializes after interaction
- shot sound plays
- hit or destroy sound plays
- game remains playable if audio fails

## Performance checklist

- no runaway projectile count
- no excessive HUD DOM churn
- no obvious memory leak from repeated restarts
