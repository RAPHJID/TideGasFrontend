import { useState, useEffect } from "react";

const API = "https://localhost:7261";

function getToken() { return localStorage.getItem("access_token"); }
function getRoles() { try { return JSON.parse(localStorage.getItem("roles")) || []; } catch { return []; } }
function isAdmin() { return getRoles().includes("Admin"); }
function isAdminOrStaff() { return getRoles().some(r => ["Admin", "Staff"].includes(r)); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
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
  .search-bar { display: flex; gap: 8px; margin-bottom: 1.5rem; }
  .search-bar input { flex: 1; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; max-width: 320px; }
  .search-bar input:focus { border-color: #111; }
  .table-wrap { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead { background: #f7f7f5; }
  th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 0.5px solid #e2e2de; }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 0.5px solid #f0f0ee; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafaf8; }
  .avatar { width: 34px; height: 34px; border-radius: 50%; background: #f0f0ee; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #555; flex-shrink: 0; }
  .name-cell { display: flex; align-items: center; gap: 10px; }
  .name-cell .name { font-weight: 500; font-size: 14px; }
  .name-cell .email { font-size: 12px; color: #999; }
  .actions { display: flex; gap: 6px; }
  .empty { text-align: center; padding: 4rem 2rem; color: #bbb; font-size: 14px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .success-box { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
  .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; border: 0.5px solid #e2e2de; }
  .modal h2 { font-size: 17px; font-weight: 500; margin-bottom: 1.25rem; }
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
  .field input { width: 100%; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
  .field input:focus { border-color: #111; }
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
  .detail-modal { max-width: 480px; }
  .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 0.5px solid #f0f0ee; font-size: 14px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-row span:first-child { color: #999; }
  .detail-row span:last-child { font-weight: 500; }
`;

function initials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

// ── ADD / EDIT MODAL ──────────────────────────────────────────────────────────
function CustomerModal({ customer, onClose, onSaved }) {
  const isEdit = !!customer?.id;
  const [form, setForm] = useState({
    fullName: customer?.fullName || "",
    email: customer?.email || "",
    phoneNumber: customer?.phoneNumber || "",
    address: customer?.address || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.fullName || !form.email) {
      setError("Full name and email are required.");
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        // PUT /api/customer/{customerId}
        // Body: UpdateCustomerDto { fullName, email, phoneNumber, address }
        await apiFetch(`/api/customer/${customer.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        // POST /api/customer
        // Body: AddCustomerDto { fullName, email, phoneNumber, address }
        await apiFetch("/api/customer", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
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
        <h2>{isEdit ? "Edit customer" : "Add customer"}</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="jane@example.com" />
          </div>
          <div className="field">
            <label>Phone number</label>
            <input value={form.phoneNumber} onChange={e => set("phoneNumber", e.target.value)} placeholder="+974 1234 5678" />
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="Doha, Qatar" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DETAIL MODAL ──────────────────────────────────────────────────────────────
function CustomerDetail({ customer, onClose, onEdit, onDelete }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <h2>Customer details</h2>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="detail-row"><span>Full name</span><span>{customer.fullName}</span></div>
          <div className="detail-row"><span>Email</span><span>{customer.email}</span></div>
          <div className="detail-row"><span>Phone</span><span>{customer.phoneNumber || "—"}</span></div>
          <div className="detail-row"><span>Address</span><span>{customer.address || "—"}</span></div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          {isAdminOrStaff() && (
            <>
              <button className="btn btn-dark" onClick={() => { onClose(); onEdit(customer); }}>Edit</button>
              <button className="btn btn-danger" onClick={() => { onClose(); onDelete(customer.id); }}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CustomerApp({ onLogout }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "detail"
  const [selected, setSelected] = useState(null);

  const roles = getRoles();
  const userEmail = (() => { try { return JSON.parse(localStorage.getItem("user"))?.email || ""; } catch { return ""; } })();

  async function load() {
    setLoading(true);
    setError("");
    try {
      // GET /api/customer — returns CustomerDto[]
      const data = await apiFetch("/api/customer");
      setCustomers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this customer?")) return;
    try {
      // DELETE /api/customer/{customerId}
      await apiFetch(`/api/customer/${id}`, { method: "DELETE" });
      setSuccess("Customer deleted.");
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

  const filtered = customers.filter(c =>
    c.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber?.includes(search) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Customer Management</h1>
            <p>
              {userEmail}
              {roles.map(r => <span key={r} className="role-badge">{r}</span>)}
            </p>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            {isAdminOrStaff() && (
              <button className="btn btn-dark" onClick={() => { setSelected(null); setModal("add"); }}>
                + Add customer
              </button>
            )}
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stat-row">
          <div className="stat">
            <div className="stat-label">Total customers</div>
            <div className="stat-value">{customers.length}</div>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* SEARCH */}
        <div className="search-bar">
          <input
            placeholder="Search by name, email, phone or address…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading customers…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">{search ? "No customers match your search." : "No customers yet."}</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  {isAdminOrStaff() && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <div className="avatar">{initials(c.fullName)}</div>
                        <div>
                          <div className="name"
                            style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2 }}
                            onClick={() => { setSelected(c); setModal("detail"); }}
                          >
                            {c.fullName}
                          </div>
                          <div className="email">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "#555" }}>{c.phoneNumber || "—"}</td>
                    <td style={{ color: "#555" }}>{c.address || "—"}</td>
                    {isAdminOrStaff() && (
                      <td>
                        <div className="actions">
                          <button className="btn" style={{ fontSize: 12, padding: "5px 10px" }}
                            onClick={() => { setSelected(c); setModal("edit"); }}>
                            Edit
                          </button>
                          <button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px" }}
                            onClick={() => handleDelete(c.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      {(modal === "add" || modal === "edit") && (
        <CustomerModal
          customer={modal === "edit" ? selected : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal === "detail" && selected && (
        <CustomerDetail
          customer={selected}
          onClose={() => setModal(null)}
          onEdit={c => { setSelected(c); setModal("edit"); }}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
