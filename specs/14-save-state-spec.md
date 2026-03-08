# 14 — Save State Spec

## MVP persistence

Persist only:
- best score
- optional sound enabled flag

## Storage

Use `localStorage`.

## Failure behavior

If storage is unavailable, the game still runs; persistence is silently skipped or logged non-fatally.

## Reset behavior

A fresh run does not clear best score unless an explicit reset feature is later added.
