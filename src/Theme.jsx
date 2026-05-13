// ─── DARK GREEN TERMINAL THEME ────────────────────────────────────────────────
export const T = {
  bg:         "#0a0f0a",
  bgCard:     "#0d150d",
  bgInput:    "#111811",
  border:     "#1a2e1a",
  borderHover:"#2e5c2e",
  green:      "#4caf50",
  greenDim:   "#2e5c2e",
  greenBright:"#66bb6a",
  text:       "#c8e6c8",
  textDim:    "#5a8a5a",
  textMuted:  "#2e5c2e",
  amber:      "#f59e0b",
  amberBg:    "#1a100a",
  amberBorder:"#78400a",
  red:        "#ef5350",
  redBg:      "#1a0a0a",
  redBorder:  "#5c1f1f",
  blue:       "#42a5f5",
  blueBg:     "#0a121a",
  blueBorder: "#1a3a5c",
};

export const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Mono', 'Menlo', 'Courier New', monospace; background: #0a0f0a; color: #c8e6c8; }
  .page { max-width: 480px; margin: 0 auto; padding: 16px 16px 80px; }

  .section-label {
    font-size: 10px; color: #2e5c2e; text-transform: uppercase;
    letter-spacing: 1.5px; margin: 16px 0 10px;
  }

  .card {
    background: #0d150d; border: 1px solid #1a2e1a;
    border-radius: 14px; padding: 14px 16px; margin-bottom: 10px;
  }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 4px; }
  .stat { background: #0d150d; border: 1px solid #1a2e1a; border-radius: 12px; padding: 14px; }
  .stat-label { font-size: 10px; color: #2e5c2e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .stat-value { font-size: 28px; font-weight: 700; color: #4caf50; letter-spacing: -0.5px; }
  .stat-value.white { color: #c8e6c8; }
  .stat-value.amber { color: #f59e0b; }
  .stat-value.red   { color: #ef5350; }
  .stat-value.sm    { font-size: 18px; }
  .stat-sub { font-size: 10px; color: #2e5c2e; margin-top: 4px; }

  .btn {
    width: 100%; padding: 14px; font-size: 14px; font-weight: 600;
    border-radius: 12px; border: 1px solid #2e5c2e; cursor: pointer;
    font-family: inherit; background: #0d150d; color: #4caf50;
    letter-spacing: 0.5px; text-transform: uppercase; transition: background 0.15s;
  }
  .btn:hover { background: #111811; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary { background: #1a2e1a; border-color: #4caf50; color: #66bb6a; }
  .btn-primary:hover { background: #1e3a1e; }
  .btn-danger { background: #1a0a0a; border-color: #5c1f1f; color: #ef5350; }
  .btn-danger:hover { background: #220d0d; }
  .btn-sm { padding: 8px 14px; font-size: 11px; width: auto; }

  .badge {
    display: inline-block; padding: 3px 10px; border-radius: 6px;
    font-size: 10px; font-weight: 600; border: 1px solid; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .badge-green  { color: #4caf50; border-color: #1a3d1a; background: #0d1a0d; }
  .badge-amber  { color: #f59e0b; border-color: #78400a; background: #1a100a; }
  .badge-red    { color: #ef5350; border-color: #5c1f1f; background: #1a0a0a; }
  .badge-blue   { color: #42a5f5; border-color: #1a3a5c; background: #0a121a; }
  .badge-muted  { color: #5a8a5a; border-color: #1a2e1a; background: #0d150d; }

  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 10px; color: #2e5c2e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .field input, .field select {
    width: 100%; padding: 13px 14px; font-size: 15px;
    border: 1px solid #1a2e1a; border-radius: 10px; outline: none;
    font-family: inherit; color: #c8e6c8; background: #0d150d;
    transition: border-color 0.15s;
  }
  .field input:focus, .field select:focus { border-color: #4caf50; }
  .field input::placeholder { color: #2e5c2e; }
  .field select option { background: #0d150d; }

  .error-box {
    background: #1a0a0a; border: 1px solid #5c1f1f; border-radius: 10px;
    padding: 12px 14px; font-size: 13px; color: #ef5350; margin-bottom: 14px;
  }
  .success-box {
    background: #0d1a0d; border: 1px solid #1a3d1a; border-radius: 10px;
    padding: 12px 14px; font-size: 13px; color: #4caf50; margin-bottom: 14px;
  }
  .info-box {
    background: #0a121a; border: 1px solid #1a3a5c; border-radius: 10px;
    padding: 12px 14px; font-size: 12px; color: #42a5f5; margin-bottom: 14px;
    letter-spacing: 0.3px;
  }

  .list-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0; border-bottom: 1px solid #111811;
  }
  .list-row:last-child { border-bottom: none; }
  .list-main { font-size: 14px; color: #c8e6c8; font-weight: 500; }
  .list-sub { font-size: 11px; color: #2e5c2e; margin-top: 3px; letter-spacing: 0.3px; }

  .modal-bg {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8);
    display: flex; align-items: flex-end; justify-content: center; z-index: 300; padding: 0;
  }
  .modal {
    background: #0d150d; border: 1px solid #1a2e1a; border-radius: 20px 20px 0 0;
    padding: 20px 16px 32px; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
  }
  .modal-handle { width: 40px; height: 4px; background: #1a2e1a; border-radius: 2px; margin: 0 auto 20px; }
  .modal h2 { font-size: 16px; font-weight: 600; color: #c8e6c8; margin-bottom: 20px; letter-spacing: 0.5px; text-transform: uppercase; }
  .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
  .modal-actions .btn { flex: 1; }

  .search-wrap { position: relative; margin-bottom: 14px; }
  .search-wrap input { width: 100%; padding: 12px 14px; font-size: 14px; border: 1px solid #1a2e1a; border-radius: 10px; outline: none; font-family: inherit; color: #c8e6c8; background: #0d150d; }
  .search-wrap input:focus { border-color: #4caf50; }
  .search-wrap input::placeholder { color: #2e5c2e; }

  .tabs { display: flex; gap: 6px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 2px; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab-btn { padding: 7px 14px; font-size: 10px; font-weight: 600; border: 1px solid #1a2e1a; border-radius: 8px; cursor: pointer; background: #0d150d; color: #2e5c2e; font-family: inherit; white-space: nowrap; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.15s; }
  .tab-btn.active { background: #1a2e1a; color: #4caf50; border-color: #2e5c2e; }

  .spinner { display: inline-block; width: 18px; height: 18px; border: 2px solid #1a2e1a; border-top-color: #4caf50; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 4rem; color: #2e5c2e; font-size: 13px; letter-spacing: 0.5px; }
  .empty { text-align: center; padding: 3rem 1rem; color: #2e5c2e; font-size: 13px; letter-spacing: 0.5px; }

  .topbar-actions { display: flex; gap: 8px; margin-bottom: 16px; }
  .cursor-blink { display: inline-block; width: 8px; height: 14px; background: #4caf50; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 3px; }
  @keyframes blink { 50% { opacity: 0; } }

  .stock-bar-wrap { width: 80px; background: #111811; border-radius: 3px; height: 4px; display: inline-block; vertical-align: middle; margin-right: 8px; }
  .stock-bar { height: 4px; border-radius: 3px; background: #4caf50; }
  .stock-bar.low { background: #ef5350; }
  .stock-bar.mid { background: #f59e0b; }
`;
