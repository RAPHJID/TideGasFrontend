import { useState } from "react";
import { AUTH_API } from "./config";

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Mono', 'Menlo', 'Courier New', monospace; background: #0a0f0a; color: #c8e6c8; }
  .auth-wrap { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 2rem 1.5rem; max-width: 420px; margin: 0 auto; }
  .auth-logo { margin-bottom: 2rem; }
  .auth-logo-title { font-size: 28px; font-weight: 700; color: #4caf50; letter-spacing: 3px; text-transform: uppercase; }
  .auth-logo-sub { font-size: 11px; color: #2e5c2e; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
  .cursor { display: inline-block; width: 10px; height: 20px; background: #4caf50; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 3px; }
  @keyframes blink { 50% { opacity: 0; } }
  .auth-tabs { display: flex; margin-bottom: 2rem; border: 1px solid #1a2e1a; border-radius: 10px; overflow: hidden; }
  .auth-tab { flex: 1; padding: 12px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; border: none; cursor: pointer; font-family: inherit; background: #0d150d; color: #2e5c2e; transition: all 0.15s; }
  .auth-tab.active { background: #1a2e1a; color: #4caf50; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-size: 10px; color: #2e5c2e; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .field input { width: 100%; padding: 14px; font-size: 15px; border: 1px solid #1a2e1a; border-radius: 10px; outline: none; font-family: inherit; color: #c8e6c8; background: #0d150d; transition: border-color 0.15s; }
  .field input:focus { border-color: #4caf50; }
  .field input::placeholder { color: #2e5c2e; }
  .btn { width: 100%; padding: 15px; font-size: 13px; font-weight: 700; border-radius: 10px; border: 1px solid #4caf50; cursor: pointer; font-family: inherit; background: #1a2e1a; color: #4caf50; letter-spacing: 1px; text-transform: uppercase; margin-top: 8px; transition: background 0.15s; }
  .btn:hover { background: #1e3a1e; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .error-box { background: #1a0a0a; border: 1px solid #5c1f1f; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #ef5350; margin-bottom: 14px; }
  .success-box { background: #0d1a0d; border: 1px solid #1a3d1a; border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #4caf50; margin-bottom: 14px; }
  .hint { font-size: 12px; color: #2e5c2e; text-align: center; margin-top: 20px; }
  .hint button { color: #4caf50; background: none; border: none; cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
  .divider { border-top: 1px solid #1a2e1a; margin: 20px 0; }
  .register-wrap { padding: 2rem 1.5rem; max-width: 420px; margin: 0 auto; }
`;

// mode: "full" (login + register tabs) | "register-only" (just register form, for admin use)
export default function AuthComponent({ onAuthSuccess, mode = "full" }) {
  const [tab, setTab] = useState(mode === "register-only" ? "register" : "login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleLogin(e) {
    e.preventDefault(); setError("");
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || "Invalid credentials.");
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("roles", JSON.stringify(data.roles));
      onAuthSuccess?.(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  async function handleRegister(e) {
    e.preventDefault(); setError(""); setSuccess("");
    const fullName = e.target.fullName.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;
    if (!fullName || !email || !password || !confirm) { setError("Please fill in all fields."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_API}/api/auth/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName, email, password }) });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error(data.message || (data.errors ? data.errors.join(" ") : null) || "Registration failed.");
      setSuccess(data.message || "Account created successfully.");
      if (mode === "register-only") {
        setTimeout(() => onAuthSuccess?.(), 1500);
      } else {
        setTimeout(() => { setTab("login"); setSuccess(""); }, 1800);
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  // Register-only mode (admin creating new users from inside app)
  if (mode === "register-only") {
    return (
      <>
        <style>{css}</style>
        <div className="register-wrap">
          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}
          <form onSubmit={handleRegister} noValidate>
            <div className="field"><label>Full name</label><input name="fullName" type="text" placeholder="Staff Member Name" /></div>
            <div className="field"><label>Email</label><input name="email" type="email" placeholder="staff@tidegas.com" /></div>
            <div className="field"><label>Password</label><input name="password" type="password" placeholder="Min. 6 characters" /></div>
            <div className="field"><label>Confirm password</label><input name="confirm" type="password" placeholder="••••••••" /></div>
            <button className="btn" type="submit" disabled={loading}>{loading ? "CREATING..." : "CREATE ACCOUNT"}</button>
          </form>
        </div>
      </>
    );
  }

  // Full mode — login screen (staff/admin can't register themselves, admin does it from More menu)
  return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-logo">
          <div className="auth-logo-title">TideGas<span className="cursor" /></div>
          <div className="auth-logo-sub">Operations Dashboard</div>
        </div>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleLogin} noValidate>
          <div className="field"><label>Email</label><input name="email" type="email" placeholder="admin@tidegas.com" /></div>
          <div className="field"><label>Password</label><input name="password" type="password" placeholder="••••••••" /></div>
          <button className="btn" type="submit" disabled={loading}>{loading ? "SIGNING IN..." : "SIGN IN"}</button>
        </form>
      </div>
    </>
  );
}
