import { useState } from "react";
import AuthComponent from "./AuthComponent";
import CylinderApp from "./CylinderApp";
import CustomerApp from "./CustomerApp";
import OrderApp from "./OrderApp";
import InventoryApp from "./InventoryApp";
import TransactionApp from "./TransactionApp";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [page, setPage] = useState("cylinders");

  function handleLogout() {
    localStorage.clear();
    setLoggedIn(false);
    setPage("cylinders");
  }

  if (!loggedIn) return <AuthComponent onAuthSuccess={() => setLoggedIn(true)} />;

  const pages = [
    { key: "cylinders",    label: "Cylinders" },
    { key: "inventory",    label: "Inventory" },
    { key: "customers",    label: "Customers" },
    { key: "orders",       label: "Orders" },
    { key: "transactions", label: "Transactions" },
  ];

  return (
    <>
      <nav style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "12px 1.5rem", background: "#fff",
        borderBottom: "0.5px solid #e2e2de",
      }}>
        <span style={{ fontWeight: 500, fontSize: 15, marginRight: "1rem" }}>🔥 TideGas</span>
        {pages.map(p => (
          <button key={p.key} onClick={() => setPage(p.key)} style={{
            padding: "6px 14px", fontSize: 13, fontWeight: 500,
            border: "none", borderRadius: 7, cursor: "pointer",
            fontFamily: "inherit",
            background: page === p.key ? "#f2f2f0" : "transparent",
            color: page === p.key ? "#111" : "#999",
          }}>
            {p.label}
          </button>
        ))}
      </nav>

      {page === "cylinders"    && <CylinderApp    onLogout={handleLogout} />}
      {page === "inventory"    && <InventoryApp    onLogout={handleLogout} />}
      {page === "customers"    && <CustomerApp     onLogout={handleLogout} />}
      {page === "orders"       && <OrderApp        onLogout={handleLogout} />}
      {page === "transactions" && <TransactionApp  onLogout={handleLogout} />}
    </>
  );
}