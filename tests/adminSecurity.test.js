import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import {
  clearAdminAttempts,
  formatRemainingSeconds,
  getAdminLockState,
  recordFailedAdminAttempt
} from "../src/utils/adminSecurity.js";
import {
  ADMIN_LOGIN_LOCK_MS,
  ADMIN_MAX_LOGIN_ATTEMPTS
} from "../src/config/security.js";
import { MemoryStorage } from "./helpers.js";

const ATTEMPTS_KEY = "paris-parfums-admin-attempts";

describe("adminSecurity", () => {
  beforeEach(() => {
    globalThis.window = { localStorage: new MemoryStorage() };
  });

  afterEach(() => {
    delete globalThis.window;
  });

  it("comienza desbloqueado y sin intentos", () => {
    assert.deepEqual(getAdminLockState(), {
      count: 0,
      remainingMs: 0,
      locked: false
    });
  });

  it("informa los intentos restantes antes del bloqueo", () => {
    const result = recordFailedAdminAttempt();

    assert.deepEqual(result, {
      locked: false,
      remainingMs: 0,
      attemptsLeft: ADMIN_MAX_LOGIN_ATTEMPTS - 1
    });
    assert.equal(getAdminLockState().count, 1);
  });

  it("bloquea al alcanzar el maximo de intentos", () => {
    let result;
    for (let index = 0; index < ADMIN_MAX_LOGIN_ATTEMPTS; index += 1) {
      result = recordFailedAdminAttempt();
    }

    const lockState = getAdminLockState();
    assert.deepEqual(result, {
      locked: true,
      remainingMs: ADMIN_LOGIN_LOCK_MS
    });
    assert.equal(lockState.locked, true);
    assert.equal(lockState.count, 0);
    assert.equal(lockState.remainingMs > 0, true);
    assert.equal(lockState.remainingMs <= ADMIN_LOGIN_LOCK_MS, true);
  });

  it("libera automaticamente un bloqueo vencido", () => {
    window.localStorage.setItem(
      ATTEMPTS_KEY,
      JSON.stringify({ count: 0, lockedUntil: Date.now() - 1 })
    );

    assert.deepEqual(getAdminLockState(), {
      count: 0,
      remainingMs: 0,
      locked: false
    });
  });

  it("permite limpiar intentos manualmente", () => {
    recordFailedAdminAttempt();
    clearAdminAttempts();

    assert.equal(getAdminLockState().count, 0);
  });

  it("redondea hacia arriba los segundos restantes", () => {
    assert.equal(formatRemainingSeconds(1_001), 2);
    assert.equal(formatRemainingSeconds(1), 1);
    assert.equal(formatRemainingSeconds(0), 1);
  });
});
