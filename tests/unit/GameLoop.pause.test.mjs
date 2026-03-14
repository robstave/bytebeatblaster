import test from 'node:test';
import assert from 'node:assert/strict';
import { GameLoop } from '../../.tmp-test/game/core/GameLoop.js';
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

test('game loop toggles pause and skips gameplay simulation while paused', () => {
  installStorageMock();
  const gameStateStore = new GameStateStore();
  gameStateStore.setAppState('playing');

  const calls = {
    playerUpdate: 0,
    weaponUpdate: 0,
    worldUpdate: 0,
    projectileUpdate: 0,
    collisionProcess: 0,
    viewSync: 0,
    hudUpdate: 0,
    audioProximity: 0
  };

  const inputManager = {
    sample: () => ({
      moveX: 0,
      moveZ: 0,
      lookDeltaX: 0,
      lookDeltaY: 0,
      wantsFire: false,
      wantsRestart: false,
      wantsPauseToggle: true,
      pointerLocked: true
    })
  };

  const playerController = {
    state: {
      position: { x: 0, y: 1.6, z: 0, set() {} },
      yaw: 0,
      pitch: 0,
      fireCooldownSeconds: 0
    },
    update() {
      calls.playerUpdate += 1;
    }
  };

  const playerView = {
    sync() {
      calls.viewSync += 1;
    }
  };

  const worldManager = {
    update() {
      calls.worldUpdate += 1;
    },
    getTargets: () => [],
    getTurrets: () => [],
    getByteBeatOrbs: () => [],
    getLevel: () => 1,
    getLevelMessage: () => '',
    getNearestByteBeatOrbDistance: () => null,
    getByteBeatFormulaIndex: () => 0,
    collectTurretShots: () => [],
    collectUfoShots: () => [],
    reset() {}
  };

  const projectileSystem = {
    update() {
      calls.projectileUpdate += 1;
    },
    clear() {},
    spawn() {}
  };

  const impactEffectSystem = {
    update() {},
    clear() {}
  };

  const weaponController = {
    update() {
      calls.weaponUpdate += 1;
      return false;
    },
    getSpreadShotsRemaining: () => 0,
    getCrystalShotsRemaining: () => 0,
    reset() {}
  };

  const collisionSystem = {
    process() {
      calls.collisionProcess += 1;
    }
  };

  const hudManager = {
    update() {
      calls.hudUpdate += 1;
    }
  };

  const audioManager = {
    updateByteBeatProximity() {
      calls.audioProximity += 1;
    },
    setByteBeatFormulaIndex() {},
    playShot() {},
    playHit() {},
    playGameOver() {}
  };

  const loop = new GameLoop(
    inputManager,
    playerController,
    playerView,
    worldManager,
    projectileSystem,
    impactEffectSystem,
    weaponController,
    collisionSystem,
    gameStateStore,
    hudManager,
    audioManager
  );

  loop.update(1 / 60);

  assert.equal(gameStateStore.getState().appState, 'paused');
  assert.equal(calls.playerUpdate, 0);
  assert.equal(calls.weaponUpdate, 0);
  assert.equal(calls.worldUpdate, 0);
  assert.equal(calls.projectileUpdate, 0);
  assert.equal(calls.collisionProcess, 0);
  assert.equal(calls.viewSync, 1);
  assert.equal(calls.hudUpdate, 1);
  assert.equal(calls.audioProximity, 1);
});
