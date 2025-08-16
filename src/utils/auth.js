// Centralized auth/token helpers to avoid duplication & unsafe parsing
export const TOKEN_KEY = 'token';
export const ROLE_KEY = 'role';
export const EMP_ID_KEY = 'empId';
export const NAME_KEY = 'name';
export const EMAIL_KEY = 'email';

export function getToken() { return localStorage.getItem(TOKEN_KEY) || null; }
export function decodeToken(token) {
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1] || '')) || null; } catch { return null; }
}
export function isExpired(token) {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp < Math.floor(Date.now() / 1000);
}
export function storeSession(token) {
  const payload = decodeToken(token);
  if (!payload) return false;
  localStorage.setItem(TOKEN_KEY, token);
  if (payload.role) localStorage.setItem(ROLE_KEY, payload.role);
  if (payload.empId) localStorage.setItem(EMP_ID_KEY, payload.empId);
  if (payload.name) localStorage.setItem(NAME_KEY, payload.name);
  return true;
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMP_ID_KEY);
  localStorage.removeItem(NAME_KEY);
}
export function getRole() { return localStorage.getItem(ROLE_KEY) || null; }
export function getEmpId() { return localStorage.getItem(EMP_ID_KEY) || null; }
export function getName() { return localStorage.getItem(NAME_KEY) || ''; }
export function getEmail() { return localStorage.getItem(EMAIL_KEY) || ''; }
export function ensureValidSession() { const t = getToken(); if (!t || isExpired(t)) { clearSession(); return false; } return true; }
