# 02 — Game Loop

## Startup flow

1. load page
2. initialize renderer and scene shell
3. show start overlay
4. wait for user interaction to lock pointer and enable audio
5. enter playing state

## Core loop

1. move and orient
2. identify targets or enemies
3. fire projectiles
4. avoid damage
5. earn score
6. survive as long as possible

## Failure state

The player loses when health reaches zero.

## Restart flow

From game-over state, pressing restart creates a fresh run without reloading the page.

## Score loop

- score increases on valid target destruction
- best score is stored in localStorage
- score is shown live on HUD

## MVP mode

Endless survival / score attack.

## Win condition

None for MVP. The loop ends only when the player dies or manually resets.
