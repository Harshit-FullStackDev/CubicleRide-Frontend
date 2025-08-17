// Centralized auth/token helpers with lightweight in‑memory caching to
// (a) reduce repeated localStorage hits
// (b) avoid decoding + JSON parse on every protected render
// All public function signatures preserved.

export const TOKEN_KEY = 'token';
export const ROLE_KEY = 'role';
export const EMP_ID_KEY = 'empId';
export const NAME_KEY = 'name';
export const EMAIL_KEY = 'email';

// Simple module cache; invalidated on store/clear or storage events.
const cache = {
  loaded: false,
  token: null,
  role: null,
  empId: null,
  name: '',
  email: '',
  exp: 0 // numeric exp (seconds)
};

function base64UrlDecode(seg) {
  try {
    // Convert base64url -> base64
    const s = seg.replace(/-/g, '+').replace(/_/g, '/');
    // Pad if necessary
    const padded = s + '==='.slice((s.length + 3) % 4);
    return atob(padded);
  } catch { return ''; }
}

export function decodeToken(token) {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try { return JSON.parse(base64UrlDecode(part)) || null; } catch { return null; }
}

function loadCache() {
  if (cache.loaded) return;
  cache.token = localStorage.getItem(TOKEN_KEY) || null;
  cache.role = localStorage.getItem(ROLE_KEY) || null;
  cache.empId = localStorage.getItem(EMP_ID_KEY) || null;
  cache.name = localStorage.getItem(NAME_KEY) || '';
  cache.email = localStorage.getItem(EMAIL_KEY) || '';
  if (cache.token) {
    const payload = decodeToken(cache.token);
    cache.exp = payload?.exp || 0;
  }
  cache.loaded = true;
}

function syncFromStorageEvent(e) {
  if (!e || [TOKEN_KEY, ROLE_KEY, EMP_ID_KEY, NAME_KEY, EMAIL_KEY].includes(e.key)) {
    // Force a reload next read
    cache.loaded = false;
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('storage', syncFromStorageEvent);
}

export function getToken() { loadCache(); return cache.token; }
export function getRole() { loadCache(); return cache.role; }
export function getEmpId() { loadCache(); return cache.empId; }
export function getName() { loadCache(); return cache.name; }
export function getEmail() { loadCache(); return cache.email; }

export function isExpired(token) {
  // Use cached exp if token matches; else decode once.
  if (token && token === cache.token && cache.exp) {
    return cache.exp < Math.floor(Date.now() / 1000);
  }
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}

export function storeSession(token) {
  const payload = decodeToken(token);
  if (!payload) return false;
  localStorage.setItem(TOKEN_KEY, token);
  if (payload.role) localStorage.setItem(ROLE_KEY, payload.role);
  if (payload.empId) localStorage.setItem(EMP_ID_KEY, payload.empId);
  if (payload.name) localStorage.setItem(NAME_KEY, payload.name);
  // intentionally not storing email here as original code didn't either
  // Update cache directly
  cache.token = token;
  cache.role = payload.role || null;
  cache.empId = payload.empId || null;
  cache.name = payload.name || '';
  cache.exp = payload.exp || 0;
  cache.loaded = true;
  return true;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMP_ID_KEY);
  localStorage.removeItem(NAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  cache.token = null;
  cache.role = null;
  cache.empId = null;
  cache.name = '';
  cache.email = '';
  cache.exp = 0;
  cache.loaded = true;
}

export function ensureValidSession() {
  const t = getToken();
  if (!t || isExpired(t)) { clearSession(); return false; }
  return true;
}
