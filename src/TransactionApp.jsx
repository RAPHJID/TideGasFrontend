import { useState, useEffect } from "react";
import { apiFetch, TRANSACTION_API, getRoles, getUserEmail, isAdmin } from "./config";

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
  .empty { text-align: center; padding: 4rem 2rem; color: #bbb; font-size: 14px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .success-box { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
  .modal { background: #fff; border-radius: 16px; padding: 2rem; width: 100%; max-width: 440px; border: 0.5px solid #e2e2de; }
  .modal h2 { font-size: 17px; font-weight: 500; margin-bottom: 1.25rem; }
  .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
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
  .detail-row span:last-child { font-weight: 500; }
  .amount-positive { color: #1a7f4b; font-weight: 500; }
  .info-note { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #1a7f4b; margin-bottom: 1.5rem; }
  .modal-actions { display: flex; gap: 8px; margin-top: 1.25rem; }
  .modal-actions .btn { flex: 1; }
`;

function TransactionDetail({ tx, onClose, onDelete }) {
  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2>Transaction details</h2>
        <div style={{ marginBottom: "1.25rem" }}>
          <div className="detail-row"><span>ID</span><span style={{ fontSize: 11, color: "#999" }}>{tx.id}</span></div>
          <div className="detail-row"><span>Customer</span><span>{tx.customerName || tx.customerId}</span></div>
          <div className="detail-row"><span>Cylinder</span><span>{tx.cylinderName || tx.cylinderId}</span></div>
          <div className="detail-row"><span>Date</span><span>{new Date(tx.date).toLocaleString()}</span></div>
          <div className="detail-row"><span>Amount</span><span className="amount-positive">QAR {Number(tx.amount).toFixed(2)}</span></div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          {isAdmin() && <button className="btn btn-danger" onClick={() => { onClose(); onDelete(tx.id); }}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

export default function TransactionApp({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const roles = getRoles();
  const userEmail = getUserEmail();

  async function load() {
    setLoading(true); setError("");
    try { const data = await apiFetch(TRANSACTION_API, "/api/Transaction"); setTransactions(data || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try { await apiFetch(TRANSACTION_API, `/api/Transaction/${id}`, { method: "DELETE" }); setSuccess("Transaction deleted."); setTimeout(() => setSuccess(""), 2500); load(); }
    catch (err) { setError(err.message); }
  }

  const filtered = transactions.filter(t =>
    t.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    t.cylinderName?.toLowerCase().includes(search.toLowerCase()) ||
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const todayRevenue = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="topbar">
          <div className="topbar-left"><h1>Transactions</h1><p>{userEmail}{roles.map(r => <span key={r} className="role-badge">{r}</span>)}</p></div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>
        <div className="info-note">Transactions are created automatically when an order is placed.</div>
        <div className="stat-row">
          <div className="stat"><div className="stat-label">Total transactions</div><div className="stat-value">{transactions.length}</div></div>
          <div className="stat"><div className="stat-label">Total revenue</div><div className="stat-value" style={{ fontSize: 18 }}>QAR {totalRevenue.toFixed(2)}</div></div>
          <div className="stat"><div className="stat-label">Today's revenue</div><div className="stat-value" style={{ fontSize: 18, color: "#1a7f4b" }}>QAR {todayRevenue.toFixed(2)}</div></div>
        </div>
        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}
        <div className="search-bar">
          <input placeholder="Search by customer, cylinder or ID…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {loading ? <div className="loading"><div className="spinner" /> Loading transactions…</div>
          : filtered.length === 0 ? <div className="empty">{search ? "No transactions match your search." : "No transactions yet. Create an order to generate one."}</div>
          : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Customer</th><th>Cylinder</th><th>Date</th><th>Amount</th>{isAdmin() && <th>Actions</th>}</tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id}>
                      <td><span style={{ cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 2, fontWeight: 500 }} onClick={() => { setSelected(t); setModal("detail"); }}>{t.customerName || "—"}</span></td>
                      <td style={{ color: "#555" }}>{t.cylinderName || "—"}</td>
                      <td style={{ color: "#999", fontSize: 12 }}>{new Date(t.date).toLocaleDateString()}</td>
                      <td className="amount-positive">QAR {Number(t.amount).toFixed(2)}</td>
                      {isAdmin() && <td><button className="btn btn-danger" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => handleDelete(t.id)}>Delete</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      {modal === "detail" && selected && <TransactionDetail tx={selected} onClose={() => setModal(null)} onDelete={handleDelete} />}
    </>
  );
}
