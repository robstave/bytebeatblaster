# AGENTS.md

## Mission

Build a browser-based retro 3D arcade shooter with the following feel:

- mostly flat arena
- strong directional cues from ground pattern and sparse landmarks
- responsive first-person movement
- visible projectile shooting
- punchy retro audio
- readable, uncluttered visuals

## Order of precedence

When instructions conflict, use this order:

1. explicit user request
2. `PRODUCT.md`
3. `specs/00-project-vision.md`
4. `specs/04-technical-architecture.md`
5. remaining specs
6. README

## Required reading before coding

Read these files before implementing anything substantial:

- `PRODUCT.md`
- `specs/00-project-vision.md`
- `specs/01-gameplay-pillars.md`
- `specs/04-technical-architecture.md`
- the relevant subsystem spec
- `specs/15-testing-and-acceptance.md`

## Core constraints

- Use **TypeScript + Vite + Babylon.js**
- Do not add React
- Do not add a physics engine for MVP
- Do not add multiplayer assumptions
- Do not add new libraries unless explicitly requested
- Preserve the retro low-complexity visual style
- Keep files small and responsibilities narrow
- Prefer composition and plain objects over unnecessary framework abstractions
- Avoid a full ECS unless explicitly requested

## Architectural boundaries

- Scene construction should only create scene resources and static world content
- Player movement belongs in `src/game/player/`
- Combat belongs in `src/game/combat/`
- HUD belongs in `src/game/ui/`
- Audio belongs in `src/game/audio/`
- World spawning belongs in `src/game/world/`
- Shared runtime state belongs in `src/game/core/`

## Coding guidelines

- Prefer explicit types on exported functions and public fields
- Add concise doc comments to exported members
- Avoid circular dependencies
- Avoid large “god files”
- Keep runtime allocations low inside the main update loop
- When uncertain, implement the smallest useful version that satisfies the current task
- Update specs only if the user explicitly asks for design changes

## File ownership rules

- `specs/` contains source-of-truth behavior and constraints
- `src/` contains implementation
- `public/` contains static assets
- `tests/` contains tests and smoke-check helpers

## Delivery style for generated code

- Small PR-sized changes
- Minimal but clear comments
- No placeholder abstractions unless they immediately support the current milestone
