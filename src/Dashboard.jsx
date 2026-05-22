import { useState, useEffect } from "react";
import { apiFetch, CYLINDER_API, CUSTOMER_API, ORDER_API, INVENTORY_API, TRANSACTION_API, getUserEmail, getRoles, can, isAdmin } from "./config";
import { BASE_CSS } from "./theme";

function statusBadge(s) { const m={Pending:"badge-amber",Processing:"badge-blue",Completed:"badge-green",Cancelled:"badge-red"}; return m[s]||"badge-muted"; }

export default function Dashboard({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userEmail = getUserEmail();
  const roles = getRoles();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";

  async function load() {
    setLoading(true); setError("");
    try {
      const [cylinders, customers, orders, inventory, transactions] = await Promise.all([
        apiFetch(CYLINDER_API, "/api/Cylinder/all").catch(() => []),
        apiFetch(CUSTOMER_API, "/api/customer").catch(() => []),
        apiFetch(ORDER_API, "/api/Order").catch(() => []),
        apiFetch(INVENTORY_API, "/api/Inventory").catch(() => []),
        can.viewRevenue() ? apiFetch(TRANSACTION_API, "/api/Transaction").catch(() => []) : Promise.resolve([]),
      ]);
      setData({ cylinders: cylinders||[], customers: customers||[], orders: orders||[], inventory: inventory||[], transactions: transactions||[] });
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <><style>{BASE_CSS}</style><div className="loading"><div className="spinner" /> LOADING...</div></>;
  if (!data) return null;

  const { cylinders, customers, orders, inventory, transactions } = data;
  const todayRevenue = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((s,t) => s+Number(t.amount), 0);
  const totalRevenue = transactions.reduce((s,t) => s+Number(t.amount), 0);
  const pendingOrders = orders.filter(o => o.status === "Pending");
  const lowStock = inventory.filter(i => Number(i.quantityAvailable) <= 5);
  const recentOrders = [...orders].sort((a,b) => new Date(b.createdAt)-new Date(a.createdAt)).slice(0, 5);
  const recentTx = [...transactions].sort((a,b) => new Date(b.date)-new Date(a.date)).slice(0, 4);

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        {/* GREETING */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: "#2e5c2e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>{greeting},</div>
          <div style={{ fontSize: 22, color: "#c8e6c8", fontWeight: 700, letterSpacing: "0.5px" }}>
            {userEmail.split("@")[0].toUpperCase()}
            {roles.map(r => <span key={r} className={`role-tag ${r.toLowerCase()}`}>{r}</span>)}
          </div>
        </div>

        {error && <div className="error-box">{error}</div>}

        {/* STATS — revenue only for admin */}
        <div className="stat-grid">
          <div className="stat" onClick={() => onNavigate("cylinders")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Cylinders</div>
            <div className="stat-value white">{cylinders.length}</div>
            <div className="stat-sub">{cylinders.filter(c=>c.status==="Available").length} available</div>
          </div>
          <div className="stat" onClick={() => onNavigate("orders")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Pending orders</div>
            <div className={`stat-value ${pendingOrders.length > 0 ? "amber" : "white"}`}>{pendingOrders.length}</div>
            <div className="stat-sub">needs action</div>
          </div>
          {can.viewRevenue() ? (
            <div className="stat">
              <div className="stat-label">Today revenue</div>
              <div className="stat-value sm">QAR {todayRevenue.toFixed(0)}</div>
              <div className="stat-sub">QAR {totalRevenue.toFixed(0)} total</div>
            </div>
          ) : (
            <div className="stat" onClick={() => onNavigate("orders")} style={{ cursor: "pointer" }}>
              <div className="stat-label">Total orders</div>
              <div className="stat-value white">{orders.length}</div>
              <div className="stat-sub">{orders.filter(o=>o.status==="Completed").length} completed</div>
            </div>
          )}
          <div className="stat" onClick={() => onNavigate("customers")} style={{ cursor: "pointer" }}>
            <div className="stat-label">Customers</div>
            <div className="stat-value white">{customers.length}</div>
            <div className="stat-sub">total</div>
          </div>
        </div>

        {/* LOW STOCK */}
        {lowStock.length > 0 && (
          <>
            <div className="section-label">⚠ Low stock alerts</div>
            {lowStock.map(item => (
              <div key={item.cylinderId} className="card" style={{ background: "#1a0a0a", borderColor: "#5c1f1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "#ef5350", fontWeight: 500 }}>{item.brand} — {item.size}</div>
                  <div style={{ fontSize: 11, color: "#5c1f1f", marginTop: 2 }}>Running critically low</div>
                </div>
                <span className="badge badge-red">{item.quantityAvailable} left</span>
              </div>
            ))}
          </>
        )}

        {/* RECENT ORDERS */}
        <div className="section-label">Recent orders</div>
        {recentOrders.length === 0 ? <div className="empty">No orders yet</div> : (
          <div className="card" style={{ padding: "4px 16px" }}>
            {recentOrders.map(o => (
              <div key={o.id} className="list-row">
                <div>
                  <div className="list-main">{o.customerName || "—"}</div>
                  <div className="list-sub">{o.cylinderName || "—"} · QAR {Number(o.totalPrice).toFixed(0)}</div>
                </div>
                <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* RECENT TRANSACTIONS — admin only */}
        {can.viewRevenue() && (
          <>
            <div className="section-label">Recent transactions</div>
            {recentTx.length === 0 ? <div className="empty">No transactions yet</div> : (
              <div className="card" style={{ padding: "4px 16px" }}>
                {recentTx.map(t => (
                  <div key={t.id} className="list-row">
                    <div>
                      <div className="list-main">{t.customerName || "—"}</div>
                      <div className="list-sub">{new Date(t.date).toLocaleDateString()}</div>
                    </div>
                    <span style={{ color: "#4caf50", fontWeight: 700, fontSize: 14 }}>QAR {Number(t.amount).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="section-label">Total revenue</div>
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#2e5c2e", textTransform: "uppercase", letterSpacing: "1px" }}>All time</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#4caf50" }}>QAR {totalRevenue.toFixed(2)}</div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
