import test from 'node:test';
import assert from 'node:assert/strict';
import { GameStateStore } from '../../.tmp-test/game/core/GameStateStore.js';

function installStorageMock() {
  const data = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    }
  };
}

test('togglePause swaps playing and paused, resetRun still forces playing', () => {
  installStorageMock();
  const store = new GameStateStore();

  store.setAppState('playing');
  store.togglePause();
  assert.equal(store.getState().appState, 'paused');

  store.togglePause();
  assert.equal(store.getState().appState, 'playing');

  store.setAppState('gameOver');
  store.togglePause();
  assert.equal(store.getState().appState, 'gameOver');

  store.setAppState('paused');
  store.resetRun();
  assert.equal(store.getState().appState, 'playing');
});
