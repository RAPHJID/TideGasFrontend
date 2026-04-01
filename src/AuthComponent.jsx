import { useState } from "react";

const AUTH_API = "https://localhost:7289"; //AuthService port

export default function AuthComponent({ onAuthSuccess }) {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── LOGIN ──────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials");

      localStorage.setItem("access_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("roles", JSON.stringify(data.roles));

      onAuthSuccess(); // 👈 tells App.jsx to switch to CylinderApp
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER ───────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;

    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess(data.message || "Account created! You can now sign in.");
      setTimeout(() => { setTab("login"); setSuccess(""); }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── STYLES ─────────────────────────────────────────────────────
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #f7f7f5; }
    .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .card { background: #fff; border: 0.5px solid #e2e2de; border-radius: 18px; padding: 2.5rem; width: 100%; max-width: 380px; }
    .logo { width: 34px; height: 34px; background: #111; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.75rem; }
    .logo-dot { width: 13px; height: 13px; background: #fff; border-radius: 3px; }
    h1 { font-size: 22px; font-weight: 500; color: #111; margin-bottom: 4px; letter-spacing: -0.3px; }
    .sub { font-size: 14px; color: #999; margin-bottom: 1.75rem; }
    .tabs { display: flex; background: #f2f2f0; border-radius: 10px; padding: 4px; margin-bottom: 1.5rem; gap: 4px; }
    .tab { flex: 1; padding: 7px 0; font-size: 13px; font-weight: 500; border: none; border-radius: 7px; cursor: pointer; background: transparent; color: #999; font-family: inherit; }
    .tab.active { background: #fff; color: #111; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .field { margin-bottom: 1rem; }
    label { display: block; font-size: 13px; font-weight: 500; color: #555; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 12px; font-size: 14px; border: 0.5px solid #ddd; border-radius: 8px; outline: none; font-family: inherit; color: #111; background: #fff; }
    input:focus { border-color: #111; }
    .btn { width: 100%; padding: 11px; font-size: 14px; font-weight: 500; background: #111; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 1.25rem; font-family: inherit; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-light { background: #f2f2f0; color: #111; margin-top: 0; }
    .error { background: #fff0f0; border: 0.5px solid #fcc; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #c00; margin-bottom: 1rem; }
    .success { background: #f0faf4; border: 0.5px solid #b2dfc4; border-radius: 8px; padding: 10px 12px; font-size: 13px; color: #1a7f4b; margin-bottom: 1rem; }
    .divider { border-top: 0.5px solid #eee; margin: 1.5rem 0; }
    .hint { font-size: 13px; color: #bbb; text-align: center; }
    .hint button { color: #111; font-weight: 500; text-decoration: underline; background: none; border: none; cursor: pointer; font-size: 13px; font-family: inherit; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <div className="card">
          <div className="logo"><div className="logo-dot" /></div>

          <h1>{tab === "login" ? "Welcome back" : "Create an account"}</h1>
          <p className="sub">{tab === "login" ? "Sign in to continue" : "Get started for free"}</p>

          <div className="tabs">
            <button className={`tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Sign in</button>
            <button className={`tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Register</button>
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          {/* ── LOGIN FORM ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin}>
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@example.com" /></div>
              <div className="field"><label>Password</label><input name="password" type="password" placeholder="••••••••" /></div>
              <button className="btn" type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister}>
              <div className="field"><label>Full name</label><input name="fullName" type="text" placeholder="Jane Smith" /></div>
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="you@example.com" /></div>
              <div className="field"><label>Password</label><input name="password" type="password" placeholder="Min. 6 characters" /></div>
              <div className="field"><label>Confirm password</label><input name="confirm" type="password" placeholder="••••••••" /></div>
              <button className="btn" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
            </form>
          )}

          <div className="divider" />
          <p className="hint">
            {tab === "login"
              ? <> No account? <button onClick={() => { setTab("register"); setError(""); }}>Register</button></>
              : <> Have an account? <button onClick={() => { setTab("login"); setError(""); }}>Sign in</button></>
            }
          </p>
        </div>
      </div>
    </>
  );
}
