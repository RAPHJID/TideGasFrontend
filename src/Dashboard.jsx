import { useState, useEffect } from "react";
import { apiFetch, CYLINDER_API, CUSTOMER_API, ORDER_API, INVENTORY_API, TRANSACTION_API, getUserEmail, getRoles } from "./config";

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; background: #f7f7f5; color: #111; }
  .app { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
  .topbar-left h1 { font-size: 20px; font-weight: 500; letter-spacing: -0.3px; }
  .topbar-left p { font-size: 13px; color: #999; margin-top: 2px; }
  .topbar-right { display: flex; gap: 8px; }
  .btn { padding: 8px 16px; font-size: 13px; font-weight: 500; border-radius: 8px; border: 0.5px solid #ddd; cursor: pointer; font-family: inherit; background: #fff; color: #111; transition: background 0.15s; }
  .btn:hover { background: #f2f2f0; }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }
  .stat-card { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; padding: 1.25rem 1.5rem; }
  .stat-card-label { font-size: 12px; color: #999; margin-bottom: 6px; }
  .stat-card-value { font-size: 28px; font-weight: 500; color: #111; letter-spacing: -0.5px; }
  .stat-card-sub { font-size: 12px; color: #bbb; margin-top: 4px; }
  .stat-card.green .stat-card-value { color: #1a7f4b; }
  .stat-card.amber .stat-card-value { color: #7a6000; }
  .stat-card.red .stat-card-value { color: #c00; }
  .stat-card.blue .stat-card-value { color: #1d4ed8; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
  .panel { background: #fff; border: 0.5px solid #e2e2de; border-radius: 14px; padding: 1.25rem; }
  .panel-title { font-size: 13px; font-weight: 500; color: #111; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
  .panel-title span { font-size: 11px; color: #bbb; font-weight: 400; }
  .list-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid #f0f0ee; font-size: 13px; }
  .list-row:last-child { border-bottom: none; }
  .list-row-left { color: #111; font-weight: 500; }
  .list-row-right { color: #999; font-size: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; border: 0.5px solid; }
  .alert-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 0.5px solid #f0f0ee; font-size: 13px; }
  .alert-row:last-child { border-bottom: none; }
  .alert-label { color: #111; font-weight: 500; }
  .alert-qty { font-size: 12px; font-weight: 500; color: #c00; background: #fff0f0; border: 0.5px solid #fcc; border-radius: 4px; padding: 2px 8px; }
  .empty-panel { text-align: center; padding: 2rem; color: #bbb; font-size: 13px; }
  .error-box { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #ddd; border-top-color: #111; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 4rem; color: #999; font-size: 14px; }
  .role-badge { background: #f2f2f0; border: 0.5px solid #e0e0dc; border-radius: 4px; font-size: 11px; padding: 2px 6px; color: #555; text-transform: uppercase; letter-spacing: 0.4px; margin-left: 4px; }
  .section-title { font-size: 13px; font-weight: 500; color: #999; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; margin-top: 1.5rem; }
`;

const STATUS_STYLES = {
  Pending:    { bg: "#fffbf0", border: "#ede0a0", color: "#7a6000" },
  Processing: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
  Completed:  { bg: "#f0faf4", border: "#b2dfc4", color: "#1a7f4b" },
  Cancelled:  { bg: "#fff0f0", border: "#fcc",    color: "#c00"    },
};

export default function Dashboard({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userEmail = getUserEmail();
  const roles = getRoles();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [cylinders, customers, orders, inventory, transactions] = await Promise.all([
        apiFetch(CYLINDER_API,    "/api/Cylinder/all").catch(() => []),
        apiFetch(CUSTOMER_API,    "/api/customer").catch(() => []),
        apiFetch(ORDER_API,       "/api/Order").catch(() => []),
        apiFetch(INVENTORY_API,   "/api/Inventory").catch(() => []),
        apiFetch(TRANSACTION_API, "/api/Transaction").catch(() => []),
      ]);
      setData({ cylinders: cylinders || [], customers: customers || [], orders: orders || [], inventory: inventory || [], transactions: transactions || [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading"><div className="spinner" /> Loading dashboard…</div>
    </>
  );

  if (!data) return null;

  const { cylinders, customers, orders, inventory, transactions } = data;

  // ── computed stats ──────────────────────────────────────────────────────────
  const totalRevenue    = transactions.reduce((s, t) => s + Number(t.amount), 0);
  const todayRevenue    = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((s, t) => s + Number(t.amount), 0);
  const todayOrders     = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const pendingOrders   = orders.filter(o => o.status === "Pending");
  const lowStockItems   = inventory.filter(i => Number(i.quantityAvailable) <= 5);
  const availableCyls   = cylinders.filter(c => c.status === "Available").length;
  const recentOrders    = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentTx        = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* TOPBAR */}
        <div className="topbar">
          <div className="topbar-left">
            <h1>Dashboard</h1>
            <p>
              {userEmail}
              {roles.map(r => <span key={r} className="role-badge">{r}</span>)}
            </p>
          </div>
          <div className="topbar-right">
            <button className="btn" onClick={load}>Refresh</button>
            <button className="btn" onClick={onLogout}>Sign out</button>
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* TOP STATS */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card-label">Total cylinders</div>
            <div className="stat-card-value">{cylinders.length}</div>
            <div className="stat-card-sub">{availableCyls} available</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Total customers</div>
            <div className="stat-card-value">{customers.length}</div>
          </div>
          <div className="stat-card amber">
            <div className="stat-card-label">Pending orders</div>
            <div className="stat-card-value">{pendingOrders.length}</div>
            <div className="stat-card-sub">{todayOrders.length} orders today</div>
          </div>
          <div className="stat-card green">
            <div className="stat-card-label">Today's revenue</div>
            <div className="stat-card-value" style={{ fontSize: 20 }}>QAR {todayRevenue.toFixed(2)}</div>
            <div className="stat-card-sub">Total: QAR {totalRevenue.toFixed(2)}</div>
          </div>
          {lowStockItems.length > 0 && (
            <div className="stat-card red">
              <div className="stat-card-label">Low stock alerts</div>
              <div className="stat-card-value">{lowStockItems.length}</div>
              <div className="stat-card-sub">items running low</div>
            </div>
          )}
        </div>

        {/* LOW STOCK ALERT */}
        {lowStockItems.length > 0 && (
          <>
            <div className="section-title">Low stock alerts</div>
            <div className="panel" style={{ marginBottom: 12, borderColor: "#fcc" }}>
              {lowStockItems.map(item => (
                <div key={item.cylinderId} className="alert-row">
                  <span className="alert-label">{item.brand} — {item.size}</span>
                  <span className="alert-qty">{item.quantityAvailable} left</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TWO COLUMN SECTION */}
        <div className="section-title">Recent activity</div>
        <div className="two-col">

          {/* RECENT ORDERS */}
          <div className="panel">
            <div className="panel-title">Recent orders <span>last 6</span></div>
            {recentOrders.length === 0 ? (
              <div className="empty-panel">No orders yet</div>
            ) : recentOrders.map(o => {
              const st = STATUS_STYLES[o.status] || { bg: "#f2f2f0", border: "#e0e0dc", color: "#555" };
              return (
                <div key={o.id} className="list-row">
                  <div>
                    <div className="list-row-left">{o.customerName || "—"}</div>
                    <div className="list-row-right">{o.cylinderName || "—"} · QAR {Number(o.totalPrice).toFixed(2)}</div>
                  </div>
                  <span className="badge" style={{ background: st.bg, borderColor: st.border, color: st.color }}>{o.status}</span>
                </div>
              );
            })}
          </div>

          {/* RECENT TRANSACTIONS */}
          <div className="panel">
            <div className="panel-title">Recent transactions <span>last 5</span></div>
            {recentTx.length === 0 ? (
              <div className="empty-panel">No transactions yet</div>
            ) : recentTx.map(t => (
              <div key={t.id} className="list-row">
                <div>
                  <div className="list-row-left">{t.customerName || "—"}</div>
                  <div className="list-row-right">{new Date(t.date).toLocaleDateString()}</div>
                </div>
                <span style={{ fontWeight: 500, color: "#1a7f4b", fontSize: 13 }}>QAR {Number(t.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* INVENTORY OVERVIEW */}
        <div className="section-title">Inventory overview</div>
        <div className="panel">
          {inventory.length === 0 ? (
            <div className="empty-panel">No inventory records yet</div>
          ) : inventory.map(item => {
            const pct = Math.min((Number(item.quantityAvailable) / Math.max(...inventory.map(i => Number(i.quantityAvailable)), 1)) * 100, 100);
            const color = item.quantityAvailable <= 5 ? "#c00" : item.quantityAvailable <= 20 ? "#7a6000" : "#1a7f4b";
            return (
              <div key={item.cylinderId} className="list-row" style={{ gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{item.brand} — {item.size}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color }}>{item.quantityAvailable} units</span>
                  </div>
                  <div style={{ width: "100%", background: "#f2f2f0", borderRadius: 4, height: 5 }}>
                    <div style={{ width: `${pct}%`, height: 5, borderRadius: 4, background: color, transition: "width 0.3s" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
