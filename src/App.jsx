import { useState } from "react";
import AuthComponent from "./AuthComponent";
import Dashboard from "./Dashboard";
import CylinderApp from "./CylinderApp";
import CustomerApp from "./CustomerApp";
import OrderApp from "./OrderApp";
import InventoryApp from "./InventoryApp";
import TransactionApp from "./TransactionApp";
import { BASE_CSS } from "./theme";
import { getRoles, isAdmin, isStaff, can } from "./config";
import { useState, useEffect } from "react";

const navCss = `
  ${BASE_CSS}
  .nav-bottom { position: fixed; bottom: 0; left: 0; right: 0; background: #0a0f0a; border-top: 1px solid #1a2e1a; display: flex; z-index: 200; padding-bottom: env(safe-area-inset-bottom); }
  .nav-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 4px; border: none; background: none; cursor: pointer; font-family: inherit; gap: 4px; color: #2e5c2e; transition: color 0.15s; }
  .nav-tab.active { color: #4caf50; }
  .nav-tab svg { width: 22px; height: 22px; }
  .nav-tab span { font-size: 9px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; }
  .nav-top { position: fixed; top: 0; left: 0; right: 0; background: #0a0f0a; border-bottom: 1px solid #1a2e1a; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; height: 52px; z-index: 200; }
  .nav-top-title { font-size: 15px; font-weight: 700; color: #4caf50; letter-spacing: 2px; text-transform: uppercase; }
  .nav-top-role { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 8px; border-radius: 5px; border: 1px solid; }
  .nav-top-role.admin { color: #4caf50; border-color: #1a3d1a; background: #0d1a0d; }
  .nav-top-role.staff { color: #42a5f5; border-color: #1a3a5c; background: #0a121a; }
  .page-wrap { padding-top: 52px; padding-bottom: 72px; min-height: 100vh; background: #0a0f0a; }
  .more-wrap { padding: 16px; }
  .more-card { background: #0d150d; border: 1px solid #1a2e1a; border-radius: 14px; overflow: hidden; margin-bottom: 12px; }
  .more-row { display: flex; justify-content: space-between; align-items: center; padding: 18px 16px; cursor: pointer; background: none; border: none; border-bottom: 1px solid #111811; width: 100%; font-family: inherit; text-align: left; }
  .more-row:last-child { border-bottom: none; }
  .more-row-label { font-size: 15px; color: #c8e6c8; font-weight: 500; }
  .more-row-desc { font-size: 11px; color: #2e5c2e; margin-top: 3px; }
  .more-logout { color: #ef5350 !important; }
`;

const tabs = [
  { key: "dashboard",  label: "Home",      icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#4caf50":"#2e5c2e"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> },
  { key: "cylinders",  label: "Cylinders", icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#4caf50":"#2e5c2e"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V6"/></svg> },
  { key: "customers",  label: "Customers", icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#4caf50":"#2e5c2e"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { key: "orders",     label: "Orders",    icon: (a) => <svg viewBox="0 0 24 24" fill="none" stroke={a?"#4caf50":"#2e5c2e"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg> },
  { key: "more",       label: "More",      icon: (a) => <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.5" fill={a?"#4caf50":"#2e5c2e"}/><circle cx="12" cy="12" r="1.5" fill={a?"#4caf50":"#2e5c2e"}/><circle cx="12" cy="19" r="1.5" fill={a?"#4caf50":"#2e5c2e"}/></svg> },
];

const titles = { dashboard:"TIDEGAS", cylinders:"CYLINDERS", customers:"CUSTOMERS", orders:"ORDERS", inventory:"INVENTORY", transactions:"TRANSACTIONS", more:"MORE" };

function MoreMenu({ onNavigate, onLogout }) {
  const items = [
    { key: "inventory",    label: "Inventory",     desc: "Stock levels & adjustments" },
    { key: "transactions", label: "Transactions",  desc: "Revenue & payment history" },
  ];
  return (
    <div className="more-wrap">
      <div className="more-card">
        {items.map(item => (
          <button key={item.key} className="more-row" onClick={() => onNavigate(item.key)}>
            <div><div className="more-row-label">{item.label}</div><div className="more-row-desc">{item.desc}</div></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e5c2e" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>
      {/* Admin-only: register new user */}
      {can.registerUser() && (
        <div className="more-card">
          <button className="more-row" onClick={() => onNavigate("register")}>
            <div><div className="more-row-label">Register New User</div><div className="more-row-desc">Create admin or staff account</div></div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e5c2e" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
      <div className="more-card">
        <button className="more-row" onClick={onLogout}>
          <span className="more-row-label more-logout">Sign out</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [page, setPage] = useState("dashboard");
  const roles = getRoles();
  const roleLabel = isAdmin() ? "Admin" : "Staff";
  const roleClass = isAdmin() ? "admin" : "staff";

  useEffect(() => {
  function handleExpiry() {
    setLoggedIn(false);
    setPage("dashboard");
  }
  window.addEventListener("session-expired", handleExpiry);
  return () => window.removeEventListener("session-expired", handleExpiry);
}, []);

  function handleLogout() { localStorage.clear(); setLoggedIn(false); setPage("dashboard"); }

  if (!loggedIn) return <AuthComponent onAuthSuccess={() => setLoggedIn(true)} />;

  // Register page — admin only
  if (page === "register") return (
    <>
      <style>{navCss}</style>
      <div className="nav-top">
        <span className="nav-top-title">REGISTER<span className="cursor-blink" /></span>
        <button onClick={() => setPage("more")} style={{ background: "none", border: "none", color: "#2e5c2e", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>← Back</button>
      </div>
      <div className="page-wrap">
        <AuthComponent mode="register-only" onAuthSuccess={() => setPage("more")} />
      </div>
    </>
  );

  const activeTab = ["dashboard","cylinders","customers","orders"].includes(page) ? page : "more";

  return (
    <>
      <style>{navCss}</style>
      <div className="nav-top">
        <span className="nav-top-title">{titles[page] || "TIDEGAS"}<span className="cursor-blink" /></span>
        <span className={`nav-top-role ${roleClass}`}>{roleLabel}</span>
      </div>
      <div className="page-wrap">
        {page === "dashboard"    && <Dashboard      onNavigate={setPage} />}
        {page === "cylinders"    && <CylinderApp    />}
        {page === "customers"    && <CustomerApp    />}
        {page === "orders"       && <OrderApp       />}
        {page === "inventory"    && <InventoryApp   />}
        {page === "transactions" && <TransactionApp />}
        {page === "more"         && <MoreMenu onNavigate={setPage} onLogout={handleLogout} />}
      </div>
      <div className="nav-bottom">
        {tabs.map(tab => (
          <button key={tab.key} className={`nav-tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setPage(tab.key)}>
            {tab.icon(activeTab === tab.key)}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
