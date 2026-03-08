# 16 — Task Breakdown

## T001 — Bootstrap app shell
Goal:
- configure Vite + TypeScript + Babylon.js and render a blank scene

Files:
- `package.json`
- `src/main.ts`
- `src/game/GameBootstrap.ts`
- `src/game/core/EngineManager.ts`
- `src/game/core/SceneManager.ts`

Acceptance:
- app builds
- blank scene displays

## T002 — World readability base
Goal:
- add ground plane, fog, and initial landmark set

Acceptance:
- player can visually orient from ground and landmarks

## T003 — Input and pointer lock
Goal:
- normalize keyboard and mouse input

Acceptance:
- input actions update in a stable way
- pointer lock enter/exit is robust

## T004 — Player controller
Goal:
- implement first-person movement and look

Acceptance:
- movement feels responsive
- camera is controllable

## T005 — Projectile combat
Goal:
- implement blaster and projectile lifecycle

Acceptance:
- repeated firing works
- projectile cleanup works

## T006 — Targets and scoring
Goal:
- add destructible targets and score rewards

Acceptance:
- hits destroy targets after expected damage
- score increments correctly

## T007 — Damage and game over
Goal:
- add player health and death flow

Acceptance:
- damage can end a run
- restart resets run state

## T008 — HUD
Goal:
- show score, best score, health, and state messages

Acceptance:
- HUD updates cleanly and does not obstruct play

## T009 — Audio
Goal:
- add start-safe audio manager and core effects

Acceptance:
- shot and hit feedback audible after interaction

## T010 — Persistence and polish
Goal:
- best-score persistence and basic performance cleanup

Acceptance:
- best score survives reload
- repeated restarts remain stable
