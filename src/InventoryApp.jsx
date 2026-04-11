import { useState, useEffect } from "react";
const INVENTORY_API = "https://localhost:7037"; 
const CYLINDER_API  = "https://localhost:7139"; 

function getToken() { return localStorage.getItem("access_token"); }
function getRoles() { try { return JSON.parse(localStorage.getItem("roles")) || []; } catch { return []; } }
function isAdmin() { return getRoles().includes("Admin"); }
function isAdminOrStaff() { return getRoles().some(r => ["Admin", "Staff"].includes(r)); }

async function apiFetch(base, path, options = {}) {
  const token = getToken();
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
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(data.message || data.title || data || "Request failed");
  return data;
}

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; background: #f7f7f5; color: #111; }
  .app { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .topbar-left h1 { font-size: 20px; font-weight: 500; letter-spacing: -0.3px; }
  .topbar-left p { font-size: 13px; color: #999; margin-top: 2px; }
  .topbar-right { display: flex; gap: 8px; align-items: center; }
  .btn { padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 8px; border: 0.5px solid #ddd; cursor: pointer; font-family: inherit; background: #fff; color: #111; transition: background 0.15s; }
  .btn:hover { background: #f2f2f0; }
  .btn-dark { background: #111; color: #fff; border-color: #111; }
  .btn-dark:hover { background: #333; }
  .btn-danger { background: #fff0f0; color: #c00; border-color: #fcc; }
  .btn-danger:hover { background: #ffe0e0; }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
  .stat { background: #fff; border: 0.5px solid #e2e2de; border-radius: 12px; padding: 1rem 1.25rem; }
  .stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
  .stat-value { font-size: 24px; font-weight: 500; color: #111; }
  .table-wrap { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f7f7f5; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5px solid #e2e2de; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 0.5px solid #f0f0ee; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafaf8; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 500; border: 0.5px solid; }
  .stock-bar-wrap { width: 100px; background: #f2f2f0; border-radius: 4px; height: 6px; display: inline-block; vertical-align: middle; margin-right: 8px; }
  .stock-bar { height: 6px; border-radius: 4px; background: #1a7f4b; transition: width 0.3s; }
  .stock-bar.low { background: #c00; }
  .stock-bar.mid { background: #7a6000; }
  .actions { display: flex; gap: 6px; align-items: center; }
  .adjust-input { width: 70px; padding: 6px 8px; font-size: 13px; border: 0.5px solid #ddd; border-radius: 6px; outline: none; font-family: inherit; text-align: center; }
  .adjust-input:focus { border-color: #111; }
  .empty { text-align: center; padding: 4rem 2rem; color: #bbb; font-size: 14px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .success-box { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
  .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 400px; border: 0.5px solid #e2e2de; }
  .modal h2 { font-size: 17px; font-weight: 500; margin-bottom: 1.25rem; }
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
  .field input, .field select { width: 100%; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
  .field input:focus { border-color: #111; }
  .modal-actions { display: flex; gap: 8px; margin-top: 1.25rem; }
  .modal-actions .btn { flex: 1; }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #111; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 4rem; color: #999; font-size: 14px; }
  .role-badge { background: #f2f2f0; border: 0.5px solid #e0e0dc; border-radius: 4px; font-size: 11px; padding: 2px 6px; color: #555; text-transform: uppercase; letter-spacing: 0.4px; margin-left: 4px; }
  .hint { font-size: 12px; color: #999; margin-top: 6px; }
`;

function statusStyle(status) {
  const map = {
    Available:   { bg: "#f0faf4", border: "#b2dfc4", color: "#1a7f4b" },
    InUse:       { bg: "#fffbf0", border: "#ede0a0", color: "#7a6000" },
    UnderRefill: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    Damaged:     { bg: "#fff0f0", border: "#fcc",    color: "#c00"    },
  };
  return map[status] || { bg: "#f2f2f0", border: "#e0e0dc", color: "#555" };
}

function stockColor(qty) {
  if (qty <= 5) return "low";
  if (qty <= 20) return "mid";
  return "";
}

// ── CREATE INVENTORY MODAL (Admin only) ───────────────────────────────────────
function CreateInventoryModal({ cylinders, onClose, onSaved }) {
  const [cylinderId, setCylinderId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!cylinderId || !quantity) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      // POST /api/Inventory/{cylinderId}?quantity=N
      await apiFetch(INVENTORY_API, `/api/Inventory/${cylinderId}?quantity=${quantity}`, { method: "POST" });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Create inventory</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Cylinder</label>
            <select value={cylinderId} onChange={e => setCylinderId(e.target.value)}>
              <option value="">Select a cylinder…</option>
              {cylinders.map(c => (
                <option key={c.id} value={c.id}>{c.brand} — {c.size}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Initial quantity</label>
            <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" min="0" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── ADJUST MODAL (Admin + Staff) ──────────────────────────────────────────────
function AdjustModal({ item, onClose, onSaved }) {
  const [change, setChange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const val = parseFloat(change);
    if (isNaN(val) || val === 0) { setError("Enter a non-zero number. Use negative to decrease."); return; }
    setLoading(true);
    try {
      // PATCH /api/Inventory/{cylinderId}/adjust?quantityChange=N
      await apiFetch(INVENTORY_API, `/api/Inventory/${item.cylinderId}/adjust?quantityChange=${val}`, { method: "PATCH" });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Adjust stock</h2>
        <p style={{ fontSize: 13, color: "#999", marginBottom: "1.25rem" }}>
          {item.brand} {item.size} — current stock: <strong>{item.quantityAvailable}</strong>
        </p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Quantity change</label>
            <input
              type="number"
              value={change}
              onChange={e => setChange(e.target.value)}
              placeholder="e.g. +10 or -5"
            />
            <p className="hint">Use a positive number to add stock, negative to remove.</p>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Saving…" : "Adjust"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function InventoryApp({ onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const roles = getRoles();
  const userEmail = (() => { try { return JSON.parse(localStorage.getItem("user"))?.email || ""; } catch { return ""; } })();

async function load() {
  setLoading(true);
  setError("");
  try {
    const [invData, cylData] = await Promise.all([
      apiFetch(INVENTORY_API, "/api/Inventory"),
      apiFetch(CYLINDER_API,  "/api/Cylinder/all"),
    ]);
    setInventory(invData || []);
    setCylinders(cylData || []);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { load(); }, []);

  async function handleDelete(cylinderId) {
    if (!window.confirm("Delete this inventory record?")) return;
    try {
      // DELETE /api/Inventory/{cylinderId}
      await apiFetch(INVENTORY_API, `/api/Inventory/${cylinderId}`, { method: "DELETE" });
      setSuccess("Inventory deleted.");
      setTimeout(() => setSuccess(""), 2500);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSaved() {
    setModal(null);
    setSelected(null);
    setSuccess("Saved successfully.");
    setTimeout(() => setSuccess(""), 2500);
    load();
  }

  const totalStock = inventory.reduce((sum, i) => sum + Number(i.quantityAvailable), 0);
  const lowStock = inventory.filter(i => i.quantityAvailable <= 5).length;
  const maxQty = Math.max(...inventory.map(i => Number(i.quantityAvailable)), 1);

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Inventory</h1>
            <p>
              {userEmail}
              {roles.map(r => <span key={r} className="role-badge">{r}</span>)}
            </p>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            {isAdmin() && (
              <button className="btn btn-dark" onClick={() => setModal("create")}>
                + Create inventory
              </button>
            )}
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stat-row">
          <div className="stat"><div className="stat-label">Total items</div><div className="stat-value">{inventory.length}</div></div>
          <div className="stat"><div className="stat-label">Total stock</div><div className="stat-value">{totalStock}</div></div>
          <div className="stat"><div className="stat-label">Low stock</div><div className="stat-value" style={{ color: lowStock > 0 ? "#c00" : "#1a7f4b" }}>{lowStock}</div></div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* TABLE */}
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading inventory…</div>
        ) : inventory.length === 0 ? (
          <div className="empty">No inventory records yet. Create one to get started.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cylinder</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Stock</th>
                  {isAdminOrStaff() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => {
                  const st = statusStyle(item.status);
                  const pct = Math.min((Number(item.quantityAvailable) / maxQty) * 100, 100);
                  return (
                    <tr key={item.cylinderId}>
                      <td style={{ fontWeight: 500 }}>{item.brand}</td>
                      <td style={{ color: "#555" }}>{item.size}</td>
                      <td>
                        <span className="badge" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ color: "#555" }}>{item.condition}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div className="stock-bar-wrap">
                            <div className={`stock-bar ${stockColor(item.quantityAvailable)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{item.quantityAvailable}</span>
                        </div>
                      </td>
                      {isAdminOrStaff() && (
                        <td>
                          <div className="actions">
                            <button className="btn" style={{ fontSize: 12, padding: "5px 10px" }}
                              onClick={() => { setSelected(item); setModal("adjust"); }}>
                              Adjust
                            </button>
                            {isAdmin() && (
                              <button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px" }}
                                onClick={() => handleDelete(item.cylinderId)}>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === "create" && (
        <CreateInventoryModal cylinders={cylinders} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {modal === "adjust" && selected && (
        <AdjustModal item={selected} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </>
  );
}
