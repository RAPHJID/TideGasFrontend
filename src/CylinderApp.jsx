import { useState, useEffect, useRef } from "react";

const API = "https://localhost:7139";

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

// image upload uses multipart/form-data so we handle it separately
async function uploadImage(id, file) {
  const token = getToken();
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/api/Cylinder/${id}/upload-image`, {
    method: "POST",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
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
  .tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: #f2f2f0; border-radius: 10px; padding: 4px; width: fit-content; }
  .tab { padding: 7px 18px; font-size: 13px; font-weight: 500; border: none; border-radius: 7px; cursor: pointer; background: transparent; color: #999; font-family: inherit; }
  .tab.active { background: #fff; color: #111; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
  .card { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; overflow: hidden; }
  .card-img { width: 100%; height: 160px; object-fit: cover; background: #f2f2f0; display: block; }
  .card-img-placeholder { width: 100%; height: 160px; background: #f7f7f5; border-bottom: 0.5px solid #e2e2de; display: flex; align-items: center; justify-content: center; color: #ccc; font-size: 13px; flex-direction: column; gap: 8px; cursor: pointer; transition: background 0.15s; }
  .card-img-placeholder:hover { background: #f0f0ee; }
  .card-body { padding: 1.25rem; }
  .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
  .card-title { font-size: 15px; font-weight: 500; }
  .card-sub { font-size: 12px; color: #999; margin-top: 2px; }
  .badge { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 500; border: 0.5px solid; }
  .meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .meta-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .meta-row span:first-child { color: #999; }
  .card-actions { display: flex; gap: 6px; flex-wrap: wrap; border-top: 0.5px solid #f0f0ee; padding-top: 12px; }
  .empty { text-align: center; padding: 4rem 2rem; color: #bbb; font-size: 14px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .success-box { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
  .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 420px; border: 0.5px solid #e2e2de; max-height: 90vh; overflow-y: auto; }
  .modal h2 { font-size: 17px; font-weight: 500; margin-bottom: 1.25rem; }
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
  .field input, .field select { width: 100%; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
  .field input:focus, .field select:focus { border-color: #111; }
  .upload-area { border: 0.5px dashed #ddd; border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer; transition: all 0.15s; background: #fafafa; }
  .upload-area:hover { background: #f2f2f0; border-color: #bbb; }
  .upload-area.dragover { background: #f0faf4; border-color: #1a7f4b; }
  .upload-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-top: 10px; display: block; }
  .upload-hint { font-size: 12px; color: #999; margin-top: 6px; }
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
  .img-overlay { position: relative; }
  .img-overlay:hover .img-change-btn { opacity: 1; }
  .img-change-btn { position: absolute; bottom: 8px; right: 8px; opacity: 0; transition: opacity 0.2s; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 6px; padding: 5px 10px; font-size: 11px; cursor: pointer; font-family: inherit; }
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

function conditionStyle(condition) {
  const map = {
    New:     { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    Good:    { bg: "#f0faf4", border: "#b2dfc4", color: "#1a7f4b" },
    Fair:    { bg: "#fffbf0", border: "#ede0a0", color: "#7a6000" },
    Damaged: { bg: "#fff0f0", border: "#fcc",    color: "#c00"    },
  };
  return map[condition] || { bg: "#f2f2f0", border: "#e0e0dc", color: "#555" };
}

// ── ADD / EDIT MODAL ──────────────────────────────────────────────────────────
function CylinderModal({ cylinder, onClose, onSaved }) {
  const isEdit = !!cylinder?.id;
  const [form, setForm] = useState({
    size: cylinder?.size || "",
    brand: cylinder?.brand || "",
    status: cylinder?.status || "Available",
    condition: cylinder?.condition || "Good",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(cylinder?.imageUrl ? `${API}${cylinder.imageUrl}` : null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function handleFile(file) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setError("Only JPG, PNG or WEBP allowed."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.brand || !form.size) { setError("Brand and size are required."); return; }
    setLoading(true);
    try {
      let savedId = cylinder?.id;
      if (isEdit) {
        await apiFetch(`/api/Cylinder/${cylinder.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        const data = await apiFetch("/api/Cylinder", { method: "POST", body: JSON.stringify(form) });
        savedId = data?.id;
      }
      // upload image if a file was selected
      if (imageFile && savedId) {
        await uploadImage(savedId, imageFile);
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
        <h2>{isEdit ? "Edit cylinder" : "Add cylinder"}</h2>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Brand</label>
            <input value={form.brand} onChange={e => set("brand", e.target.value)} placeholder="e.g. Total, Woqod" />
          </div>
          <div className="field">
            <label>Size</label>
            <input value={form.size} onChange={e => set("size", e.target.value)} placeholder="e.g. 12kg, 45kg" />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Available</option>
              <option>InUse</option>
              <option>UnderRefill</option>
              <option>Damaged</option>
            </select>
          </div>
          <div className="field">
            <label>Condition</label>
            <select value={form.condition} onChange={e => set("condition", e.target.value)}>
              <option>Good</option>
              <option>Fair</option>
              <option>New</option>
              <option>Damaged</option>
            </select>
          </div>

          {/* IMAGE UPLOAD */}
          <div className="field">
            <label>Photo</label>
            <div
              className={`upload-area ${dragOver ? "dragover" : ""}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="upload-preview" />
              ) : (
                <>
                  <div style={{ fontSize: 24 }}>📷</div>
                  <div style={{ fontSize: 13, color: "#999", marginTop: 6 }}>Click or drag to upload</div>
                </>
              )}
              <div className="upload-hint">JPG, PNG or WEBP</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save changes" : "Add cylinder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DAILY SALES MODAL ─────────────────────────────────────────────────────────
function DailySalesModal({ cylinder, onClose, onSaved }) {
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!qty || isNaN(qty)) { setError("Enter a valid quantity."); return; }
    setLoading(true);
    try {
      await apiFetch(`/api/Cylinder/${cylinder.id}/daily-sales`, {
        method: "PUT",
        body: JSON.stringify({ quantitySoldToday: Number(qty) }),
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
        <h2>Update daily sales</h2>
        <p style={{ fontSize: 13, color: "#999", marginBottom: "1.25rem" }}>
          {cylinder.brand} — {cylinder.size}
        </p>
        {error && <div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Quantity sold today</label>
            <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-dark" disabled={loading}>
              {loading ? "Saving…" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CYLINDER CARD ─────────────────────────────────────────────────────────────
function CylinderCard({ cylinder, onEdit, onDelete, onSales, onImageChange }) {
  const st = statusStyle(cylinder.status);
  const ct = conditionStyle(cylinder.condition);
  const fileRef = useRef();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) onImageChange(cylinder.id, file);
  }

  return (
    <div className="card">
      {/* IMAGE */}
      <div className="img-overlay">
        {cylinder.imageUrl ? (
          <img src={`${API}${cylinder.imageUrl}`} alt={cylinder.brand} className="card-img" />
        ) : (
          <div className="card-img-placeholder" onClick={() => isAdmin() && fileRef.current.click()}>
            <span style={{ fontSize: 28 }}>📷</span>
            {isAdmin() && <span style={{ fontSize: 12 }}>Click to add photo</span>}
          </div>
        )}
        {/* change photo button on hover (admin only) */}
        {isAdmin() && cylinder.imageUrl && (
          <button className="img-change-btn" onClick={() => fileRef.current.click()}>
            Change photo
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* BODY */}
      <div className="card-body">
        <div className="card-header">
          <div>
            <div className="card-title">{cylinder.brand}</div>
            <div className="card-sub">{cylinder.size}</div>
          </div>
          <span className="badge" style={{ background: st.bg, borderColor: st.border, color: st.color }}>
            {cylinder.status}
          </span>
        </div>
        <div className="meta">
          <div className="meta-row">
            <span>Condition</span>
            <span className="badge" style={{ background: ct.bg, borderColor: ct.border, color: ct.color }}>
              {cylinder.condition}
            </span>
          </div>
          {cylinder.quantitySoldToday != null && (
            <div className="meta-row"><span>Sold today</span><span>{cylinder.quantitySoldToday}</span></div>
          )}
        </div>
        <div className="card-actions">
          {isAdminOrStaff() && (
            <button className="btn" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => onSales(cylinder)}>
              Daily sales
            </button>
          )}
          {isAdmin() && (
            <>
              <button className="btn" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => onEdit(cylinder)}>
                Edit
              </button>
              <button className="btn btn-danger" style={{ fontSize: 12, padding: "6px 12px" }} onClick={() => onDelete(cylinder.id)}>
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function CylinderApp({ onLogout }) {
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const roles = getRoles();
  const userEmail = (() => { try { return JSON.parse(localStorage.getItem("user"))?.email || ""; } catch { return ""; } })();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/Cylinder/all");
      setCylinders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this cylinder?")) return;
    try {
      await apiFetch(`/api/Cylinder/${id}`, { method: "DELETE" });
      setSuccess("Cylinder deleted.");
      setTimeout(() => setSuccess(""), 2500);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleImageChange(id, file) {
    try {
      await uploadImage(id, file);
      setSuccess("Photo updated.");
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

  const filtered = tab === "all" ? cylinders : cylinders.filter(c => c.status === tab);

  const stats = {
    total:       cylinders.length,
    available:   cylinders.filter(c => c.status === "Available").length,
    inUse:       cylinders.filter(c => c.status === "InUse").length,
    underRefill: cylinders.filter(c => c.status === "UnderRefill").length,
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Cylinder Management</h1>
            <p>
              {userEmail}
              {roles.map(r => <span key={r} className="role-badge">{r}</span>)}
            </p>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            {isAdmin() && (
              <button className="btn btn-dark" onClick={() => { setSelected(null); setModal("add"); }}>
                + Add cylinder
              </button>
            )}
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        {/* STATS */}
        <div className="stat-row">
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
          <div className="stat"><div className="stat-label">Available</div><div className="stat-value" style={{ color: "#1a7f4b" }}>{stats.available}</div></div>
          <div className="stat"><div className="stat-label">In use</div><div className="stat-value" style={{ color: "#7a6000" }}>{stats.inUse}</div></div>
          <div className="stat"><div className="stat-label">Under refill</div><div className="stat-value" style={{ color: "#1d4ed8" }}>{stats.underRefill}</div></div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        {/* TABS */}
        <div className="tabs">
          {["all", "Available", "InUse", "UnderRefill", "Damaged"].map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading cylinders…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No cylinders found.</div>
        ) : (
          <div className="grid">
            {filtered.map(c => (
              <CylinderCard
                key={c.id}
                cylinder={c}
                onEdit={cyl => { setSelected(cyl); setModal("edit"); }}
                onDelete={handleDelete}
                onSales={cyl => { setSelected(cyl); setModal("sales"); }}
                onImageChange={handleImageChange}
              />
            ))}
          </div>
        )}
      </div>

      {(modal === "add" || modal === "edit") && (
        <CylinderModal
          cylinder={modal === "edit" ? selected : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {modal === "sales" && selected && (
        <DailySalesModal
          cylinder={selected}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
