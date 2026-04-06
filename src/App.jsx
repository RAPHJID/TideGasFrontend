import { useState } from "react";
import AuthComponent from "./AuthComponent";
import CylinderApp from "./CylinderApp";
import CustomerApp from "./CustomerApp";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const [page, setPage] = useState("cylinders"); // default page after login

  function handleLogout() {
    localStorage.clear();
    setLoggedIn(false);
    setPage("cylinders");
  }

  if (!loggedIn) {
    return <AuthComponent onAuthSuccess={() => setLoggedIn(true)} />;
  }

  return (
    <>
      {/* NAV BAR */}
      <nav style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "12px 1.5rem", background: "#fff",
        borderBottom: "0.5px solid #e2e2de", marginBottom: "0",
      }}>
        <span style={{ fontWeight: 500, fontSize: 15, marginRight: "1rem" }}>🔥 TideGas</span>
        {[
          { key: "cylinders", label: "Cylinders" },
          { key: "customers", label: "Customers" },
        ].map(item => (
          <button key={item.key} onClick={() => setPage(item.key)} style={{
            padding: "6px 14px", fontSize: 13, fontWeight: 500,
            border: "none", borderRadius: 7, cursor: "pointer",
            fontFamily: "inherit",
            background: page === item.key ? "#f2f2f0" : "transparent",
            color: page === item.key ? "#111" : "#999",
          }}>
            {item.label}
          </button>
        ))}
      </nav>

      {/* PAGES */}
      {page === "cylinders" && <CylinderApp onLogout={handleLogout} />}
      {page === "customers" && <CustomerApp onLogout={handleLogout} />}
    </>
  );
}
