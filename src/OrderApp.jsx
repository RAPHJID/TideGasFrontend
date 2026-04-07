import { useState, useEffect } from "react";

const AUTH_API = "https://localhost:7022";   
const CYLINDER_API = "https://localhost:7139"; 
const CUSTOMER_API = "https://localhost:7261"; 
const ORDER_API = "https://localhost:7022";    

function getToken() { return localStorage.getItem("access_token"); }
function getRoles() { try { return JSON.parse(localStorage.getItem("roles")) || []; } catch { return []; } }
function isAdmin() { return getRoles().includes("Admin"); }
function isAdminOrStaff() { return getRoles().some(r => ["Admin", "Staff"].includes(r)); }

async function apiFetch(baseUrl, path, options = {}) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
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
  if (!res.ok) throw new Error(data.message || data.title || "Request failed");
  return data;
}

const STATUS_STYLES = {
  Pending:    { bg: "#fffbf0", border: "#ede0a0", color: "#7a6000" },
  Processing: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  Completed:  { bg: "#f0faf4", border: "#b2dfc4", color: "#1a7f4b" },
  Cancelled:  { bg: "#fff0f0", border: "#fcc",    color: "#c00"    },
};

function statusStyle(status) {
  return STATUS_STYLES[status] || { bg: "#f2f2f0", border: "#e0e0dc", color: "#555" };
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
  .search-bar { display: flex; gap: 8px; margin-bottom: 1.5rem; align-items: center; }
  .search-bar input { flex: 1; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; max-width: 320px; }
  .search-bar input:focus { border-color: #111; }
  .search-bar select { padding: 10px 12px; font-size: 13px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
  .search-bar select:focus { border-color: #111; }
  .table-wrap { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f7f7f5; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5px solid #e2e2de; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 0.5px solid #f0f0ee; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafaf8; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 500; border: 0.5px solid; }
  .actions { display: flex; gap: 6px; }
  .empty { text-align: center; padding: 4rem 2rem; color: #bbb; font-size: 14px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .success-box { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
  .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 440px; border: 0.5px solid #e2e2de; max-height: 90vh; overflow-y: auto; }
  .modal h2 { font-size: 17px; font-weight: 500; margin-bottom: 1.25rem; }
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
  .field input, .field select { width: 100%; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
  .field input:focus, .field select:focus { border-color: #111; }
  .field input:disabled { background: #f7f7f5; color: #999; }
  .modal-actions { display: flex; gap: 8px; margin-top: 1.25rem; }
  .modal-actions .btn { flex: 1; }
  .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
  .stat { background: #fff; border: 0.5px solid #e2e2de; border-radius: 12px; padding: 1rem 1.25rem; }
  .stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
  .stat-value { font-size: 24px; font-weight: 500; color: #111; }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #111; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 4rem; color: #999; font-size: 14px; }
  .role-badge { background: #f2f2f0; border: 0.5px solid #e0e0dc; border-radius: 4px; font-size: 11px; padding: 2px 6px; color: #555; text-transform: uppercase; letter-spacing: 0.4px; margin-left: 4px; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 0.5px solid #f0f0ee; font-size: 14px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-row span:first-child { color: #999; }
  .detail-row span:last-child { font-weight: 500; text-align: right; }
  .status-select { padding: 6px 10px; font-size: 12px; border: 0.5px solid #ddd; border-radius: 6px; font-family: inherit; outline: none; cursor: pointer; background: #fff; }
`;

// ── CREATE ORDER MODAL ────────────────────────────────────────────────────────
function CreateOrderModal({ onClose, onSaved, customers, cylinders }) {
  const [form, setForm] = useState({
    customerId: "",
    cylinderId: "",
    quantity: 1,
    totalPrice: "",
    status: "Pending",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.customerId || !form.cylinderId || !form.quantity || !form.totalPrice) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      // POST /api/Order
      // Body: OrderCreateDTO { customerId, cylinderId, quantity, totalPrice, status }
      await apiFetch(ORDER_API, "/api/Order", {
        method: "POST",
        body: JSON.stringify({
          customerId: form.customerId,
          cylinderId: form.cylinderId,
          quantity: Number(form.quantity),
          totalPrice: parseFloat(form.totalPrice),
          status: form.status,
        }),
      });
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
        <h2>Create order</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Customer</label>
            <select value={form.customerId} onChange={e => set("customerId", e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.fullName} — {c.email}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cylinder</label>
            <select value={form.cylinderId} onChange={e => set("cylinderId", e.target.value)}>
              <option value="">Select a cylinder…</option>
              {cylinders.map(c => (
                <option key={c.id} value={c.id}>{c.brand} — {c.size} ({c.status})</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={e => set("quantity", e.target.value)}
              placeholder="1"
            />
          </div>
          <div className="field">
            <label>Total price (QAR)</label>
            <input
              type="number"
              value={form.totalPrice}
              onChange={e => set("totalPrice", e.target.value)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Pending</option>
              <option>Processing</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Creating…" : "Create order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── ORDER DETAIL MODAL ────────────────────────────────────────────────────────
function OrderDetail({ order, onClose, onDelete }) {
  const st = statusStyle(order.status);
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Order details</h2>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="detail-row"><span>Order ID</span><span style={{ fontSize: 12, color: "#999" }}>{order.id}</span></div>
          <div className="detail-row"><span>Customer</span><span>{order.customerName}</span></div>
          <div className="detail-row"><span>Cylinder</span><span>{order.cylinderName}</span></div>
          <div className="detail-row"><span>Quantity</span><span>{order.quantity}</span></div>
          <div className="detail-row"><span>Total price</span><span>QAR {Number(order.totalPrice).toFixed(2)}</span></div>
          <div className="detail-row">
            <span>Status</span>
            <span className="badge" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
              {order.status}
            </span>
          </div>
          <div className="detail-row"><span>Created</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          {isAdmin() && (
            <button className="btn btn-danger" onClick={() => { onClose(); onDelete(order.id); }}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function OrderApp({ onLogout }) {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const roles = getRoles();
  const userEmail = (() => { try { return JSON.parse(localStorage.getItem("user"))?.email || ""; } catch { return ""; } })();

  async function load() {
    setLoading(true);
    setError("");
    try {
      // load orders, customers and cylinders in parallel for the create modal dropdowns
      const [ordersData, customersData, cylindersData] = await Promise.all([
        apiFetch(ORDER_API, "/api/Order"),
        apiFetch(CUSTOMER_API, "/api/customer"),
        apiFetch(CYLINDER_API, "/api/Cylinder/all"),
      ]);
      setOrders(ordersData || []);
      setCustomers(customersData || []);
      setCylinders(cylindersData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(id, status) {
    try {
      // PATCH /api/Order/{id}/status
      await apiFetch(ORDER_API, `/api/Order/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(status),
      });
      setSuccess("Status updated.");
      setTimeout(() => setSuccess(""), 2500);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this order?")) return;
    try {
      // DELETE /api/Order/{id}
      await apiFetch(ORDER_API, `/api/Order/${id}`, { method: "DELETE" });
      setSuccess("Order deleted.");
      setTimeout(() => setSuccess(""), 2500);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSaved() {
    setModal(null);
    setSuccess("Order created successfully.");
    setTimeout(() => setSuccess(""), 2500);
    load();
  }

  const filtered = orders.filter(o => {
    const matchSearch =
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.cylinderName?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total:      orders.length,
    pending:    orders.filter(o => o.status === "Pending").length,
    processing: orders.filter(o => o.status === "Processing").length,
    completed:  orders.filter(o => o.status === "Completed").length,
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Order Management</h1>
            <p>
              {userEmail}
              {roles.map(r => <span key={r} className="role-badge">{r}</span>)}
            </p>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            {isAdminOrStaff() && (
              <button className="btn btn-dark" onClick={() => setModal("create")}>
                + New order
              </button>
            )}
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stat-row">
          <div className="stat"><div className="stat-label">Total orders</div><div className="stat-value">{stats.total}</div></div>
          <div className="stat"><div className="stat-label">Pending</div><div className="stat-value" style={{ color: "#7a6000" }}>{stats.pending}</div></div>
          <div className="stat"><div className="stat-label">Processing</div><div className="stat-value" style={{ color: "#1d4ed8" }}>{stats.processing}</div></div>
          <div className="stat"><div className="stat-label">Completed</div><div className="stat-value" style={{ color: "#1a7f4b" }}>{stats.completed}</div></div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* SEARCH + FILTER */}
        <div className="search-bar">
          <input
            placeholder="Search by customer, cylinder or order ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading orders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">{search || statusFilter !== "all" ? "No orders match your search." : "No orders yet."}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Cylinder</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  {isAdminOrStaff() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const st = statusStyle(o.status);
                  return (
                    <tr key={o.id}>
                      <td>
                        <span
                          style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, fontWeight: 500 }}
                          onClick={() => { setSelected(o); setModal("detail"); }}
                        >
                          {o.customerName}
                        </span>
                      </td>
                      <td style={{ color: "#555" }}>{o.cylinderName}</td>
                      <td style={{ color: "#555" }}>{o.quantity}</td>
                      <td style={{ fontWeight: 500 }}>QAR {Number(o.totalPrice).toFixed(2)}</td>
                      <td>
                        {isAdminOrStaff() ? (
                          // inline status updater
                          <select
                            className="status-select"
                            value={o.status}
                            style={{ background: st.bg, color: st.color, borderColor: st.border }}
                            onChange={e => handleStatusChange(o.id, e.target.value)}
                          >
                            <option>Pending</option>
                            <option>Processing</option>
                            <option>Completed</option>
                            <option>Cancelled</option>
                          </select>
                        ) : (
                          <span className="badge" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
                            {o.status}
                          </span>
                        )}
                      </td>
                      <td style={{ color: "#999", fontSize: 12 }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      {isAdminOrStaff() && (
                        <td>
                          <div className="actions">
                            {isAdmin() && (
                              <button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px" }}
                                onClick={() => handleDelete(o.id)}>
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

      {/* MODALS */}
      {modal === "create" && (
        <CreateOrderModal
          onClose={() => setModal(null)}
          onSaved={handleSaved}
          customers={customers}
          cylinders={cylinders}
        />
      )}
      {modal === "detail" && selected && (
        <OrderDetail
          order={selected}
          onClose={() => setModal(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
