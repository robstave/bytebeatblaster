import test from 'node:test';
import assert from 'node:assert/strict';
import { InputManager } from '../../.tmp-test/game/core/InputManager.js';

function installDomMocks() {
  globalThis.window = {
    addEventListener() {},
    removeEventListener() {}
  };

  globalThis.document = {
    pointerLockElement: null,
    addEventListener() {},
    removeEventListener() {}
  };
}

test('pause toggle is one-frame and clears after sample', () => {
  installDomMocks();
  const manager = new InputManager({ requestPointerLock() {} });

  manager.onKeyDown({ code: 'KeyP' });

  const first = manager.sample();
  assert.equal(first.wantsPauseToggle, true);

  const second = manager.sample();
  assert.equal(second.wantsPauseToggle, false);
});
