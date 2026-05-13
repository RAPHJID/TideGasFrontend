import { useState, useEffect } from "react";
import { apiFetch, TRANSACTION_API, isAdmin } from "./config";
import { BASE_CSS } from "./theme";

function TransactionDetail({ tx, onClose, onDelete }) {
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Transaction</h2>
        <div style={{fontSize:28,fontWeight:700,color:"#4caf50",marginBottom:20,letterSpacing:"-0.5px"}}>QAR {Number(tx.amount).toFixed(2)}</div>
        {[["Customer",tx.customerName||tx.customerId],["Cylinder",tx.cylinderName||tx.cylinderId],["Date",new Date(tx.date).toLocaleString()],["ID",tx.id]].map(([label,val])=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid #111811"}}>
            <span style={{fontSize:11,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"1px",flexShrink:0}}>{label}</span>
            <span style={{fontSize:label==="ID"?10:14,color:"#c8e6c8",fontWeight:500,textAlign:"right",marginLeft:12,overflow:"hidden",textOverflow:"ellipsis"}}>{val}</span>
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          {isAdmin()&&<button className="btn btn-danger" onClick={()=>{onClose();onDelete(tx.id);}}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

export default function TransactionApp() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try { const d = await apiFetch(TRANSACTION_API,"/api/Transaction"); setTransactions(d||[]); }
    catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function handleDelete(id) {
    if(!window.confirm("Delete this transaction?"))return;
    try { await apiFetch(TRANSACTION_API,`/api/Transaction/${id}`,{method:"DELETE"}); setSuccess("Deleted."); setTimeout(()=>setSuccess(""),2500); load(); }
    catch(err){setError(err.message);}
  }

  const filtered = transactions.filter(t=>
    t.customerName?.toLowerCase().includes(search.toLowerCase())||
    t.cylinderName?.toLowerCase().includes(search.toLowerCase())||
    t.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = transactions.reduce((s,t)=>s+Number(t.amount),0);
  const todayRevenue = transactions.filter(t=>new Date(t.date).toDateString()===new Date().toDateString()).reduce((s,t)=>s+Number(t.amount),0);

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        <div className="stat-grid" style={{marginBottom:16}}>
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value white">{transactions.length}</div></div>
          <div className="stat"><div className="stat-label">Today revenue</div><div className="stat-value sm">QAR {todayRevenue.toFixed(0)}</div></div>
        </div>

        <div className="card" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontSize:11,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"1px"}}>All time revenue</div>
          <div style={{fontSize:22,fontWeight:700,color:"#4caf50"}}>QAR {totalRevenue.toFixed(2)}</div>
        </div>

        <div className="info-box">Transactions are created automatically when an order is placed.</div>

        {error&&<div className="error-box">{error}</div>}
        {success&&<div className="success-box">{success}</div>}

        <div className="topbar-actions">
          <button className="btn" onClick={load} style={{flex:1}}>Refresh</button>
        </div>

        <div className="search-wrap">
          <input placeholder="Search customer or cylinder..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading?<div className="loading"><div className="spinner"/> Loading...</div>
        :filtered.length===0?<div className="empty">{search?"No results found":"No transactions yet. Create an order to generate one."}</div>
        :filtered.map(t=>(
          <div key={t.id} className="card" style={{cursor:"pointer"}} onClick={()=>{setSelected(t);setModal("detail");}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
              <div style={{fontSize:16,fontWeight:700,color:"#c8e6c8"}}>{t.customerName||"—"}</div>
              <div style={{fontSize:18,fontWeight:700,color:"#4caf50"}}>QAR {Number(t.amount).toFixed(0)}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#2e5c2e"}}>{t.cylinderName||"—"}</span>
              <span style={{fontSize:11,color:"#5a8a5a"}}>{new Date(t.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {modal==="detail"&&selected&&<TransactionDetail tx={selected} onClose={()=>setModal(null)} onDelete={handleDelete}/>}
    </>
  );
}
