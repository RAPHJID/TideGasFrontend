// ─── API BASE URLS ────────────────────────────────────────────────────────────
// Update these ports if your services change
export const AUTH_API        = "https://localhost:7289";
export const CYLINDER_API    = "https://localhost:7139";
export const CUSTOMER_API    = "https://localhost:7261";
export const ORDER_API       = "https://localhost:7022";
export const INVENTORY_API   = "https://localhost:7037";
export const TRANSACTION_API = "https://localhost:7267";

// ─── SHARED FETCH HELPER ──────────────────────────────────────────────────────
// Use this in every App file instead of defining apiFetch locally
export async function apiFetch(base, path, options = {}) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || data.title || "Request failed");
    return data;
  } catch {
    if (!res.ok) throw new Error(text.replace(/^"(.*)"$/, "$1").slice(0, 200));
    return text;
  }
}

// ─── SHARED AUTH HELPERS ──────────────────────────────────────────────────────
export function getToken()       { return localStorage.getItem("access_token"); }
export function getRoles()       { try { return JSON.parse(localStorage.getItem("roles")) || []; } catch { return []; } }
export function getUserEmail()   { try { return JSON.parse(localStorage.getItem("user"))?.email || ""; } catch { return ""; } }
export function isAdmin()        { return getRoles().includes("Admin"); }
export function isAdminOrStaff() { return getRoles().some(r => ["Admin", "Staff"].includes(r)); }