import {
  ADMIN_LOGIN_LOCK_MS,
  ADMIN_MAX_LOGIN_ATTEMPTS
} from "../config/security.js";

const ATTEMPTS_KEY = "paris-parfums-admin-attempts";
export const ADMIN_LOGOUT_REASON_KEY = "paris-parfums-admin-logout-reason";

// Lee del storage el estado actual de intentos fallidos del login admin.
function readAttempts() {
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) {
      return { count: 0, lockedUntil: 0 };
    }

    const parsed = JSON.parse(raw);
    return {
      count: Number(parsed.count) || 0,
      lockedUntil: Number(parsed.lockedUntil) || 0
    };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

// Guarda en storage el contador y la fecha de bloqueo del acceso admin.
function writeAttempts(state) {
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(state));
}

// Devuelve si el login admin esta bloqueado y cuanto tiempo falta para reintentar.
export function getAdminLockState() {
  const state = readAttempts();
  const remainingMs = Math.max(0, state.lockedUntil - Date.now());

  if (state.lockedUntil > 0 && remainingMs <= 0) {
    writeAttempts({ count: 0, lockedUntil: 0 });
    return { count: 0, remainingMs: 0, locked: false };
  }

  return {
    count: state.count,
    remainingMs,
    locked: remainingMs > 0
  };
}

// Registra un fallo de autenticacion y bloquea temporalmente si supera el limite.
export function recordFailedAdminAttempt() {
  const state = readAttempts();
  const nextCount = state.count + 1;

  if (nextCount >= ADMIN_MAX_LOGIN_ATTEMPTS) {
    const lockedUntil = Date.now() + ADMIN_LOGIN_LOCK_MS;
    writeAttempts({ count: 0, lockedUntil });
    return {
      locked: true,
      remainingMs: ADMIN_LOGIN_LOCK_MS
    };
  }

  writeAttempts({ count: nextCount, lockedUntil: 0 });
  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: ADMIN_MAX_LOGIN_ATTEMPTS - nextCount
  };
}

// Reinicia el contador de fallos del acceso admin tras un login valido.
export function clearAdminAttempts() {
  writeAttempts({ count: 0, lockedUntil: 0 });
}

// Convierte milisegundos restantes a segundos enteros para mostrar en UI.
export function formatRemainingSeconds(remainingMs) {
  return Math.max(1, Math.ceil(remainingMs / 1000));
}
