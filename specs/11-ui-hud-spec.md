# 11 — UI / HUD Spec

## Required HUD elements

- score
- best score
- health
- crosshair
- state text overlay for start and game over
- restart hint

## Layout

- score and best score near top edge
- health visible but unobtrusive
- centered crosshair
- overlay text centered when not actively playing

## Implementation guidance

Initial HUD may be plain HTML/CSS layered over the canvas. Avoid overcomplicated UI frameworks for MVP.
