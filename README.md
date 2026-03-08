# Retro Flatland Shooter

A browser-based retro 3D arcade shooter inspired by early flat-plane 3D visuals: a large flat arena, strong ground patterns for orientation, sparse geometric landmarks, punchy projectile combat, and synthetic arcade-style sound.

## Stack

- TypeScript
- Vite
- Babylon.js

## Project philosophy

This repo is **spec-first**. The `specs/` folder is the source of truth for game behavior, technical boundaries, and implementation milestones. Code generation agents should read the specs before changing runtime code.

## How to run

```bash
npm install
npm run dev
```

## Expected workflow

1. Read `AGENTS.md`
2. Read `PRODUCT.md`
3. Read `specs/00-project-vision.md`
4. Read `specs/04-technical-architecture.md`
5. Implement one task from `specs/16-task-breakdown.md`
6. Verify against `specs/15-testing-and-acceptance.md`

## Current milestone

Initial repo scaffold only. The implementation files are placeholders intended to guide Codex or another coding agent.

## Repo layout

- `specs/` — design and engineering specs
- `src/` — implementation code
- `public/` — audio and textures
- `tests/` — smoke and unit tests

## Commands

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```
