import { useState, useEffect } from "react";
import { apiFetch, INVENTORY_API, CYLINDER_API, isAdmin, isAdminOrStaff } from "./config";
import { BASE_CSS } from "./theme";

function CreateModal({ cylinders, onClose, onSaved }) {
  const [cylinderId, setCylinderId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if(!cylinderId||!quantity){setError("Please fill in all fields.");return;}
    setLoading(true);
    try { await apiFetch(INVENTORY_API,`/api/Inventory/${cylinderId}?quantity=${quantity}`,{method:"POST"}); onSaved(); }
    catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Create Inventory</h2>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Cylinder</label><select value={cylinderId} onChange={e=>setCylinderId(e.target.value)}><option value="">Select cylinder...</option>{cylinders.map(c=><option key={c.id} value={c.id}>{c.brand} — {c.size}</option>)}</select></div>
          <div className="field"><label>Initial quantity</label><input type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="0" min="0"/></div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Creating...":"Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdjustModal({ item, onClose, onSaved }) {
  const [change, setChange] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    const val = parseFloat(change);
    if(isNaN(val)||val===0){setError("Enter a non-zero number.");return;}
    setLoading(true);
    try { await apiFetch(INVENTORY_API,`/api/Inventory/${item.cylinderId}/adjust?quantityChange=${val}`,{method:"PATCH"}); onSaved(); }
    catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Adjust Stock</h2>
        <div style={{fontSize:13,color:"#2e5c2e",marginBottom:4}}>{item.brand} — {item.size}</div>
        <div style={{fontSize:22,fontWeight:700,color:"#4caf50",marginBottom:20}}>Current: {item.quantityAvailable}</div>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Change amount</label>
            <input type="number" value={change} onChange={e=>setChange(e.target.value)} placeholder="+10 to add, -5 to remove"/>
            <div style={{fontSize:11,color:"#2e5c2e",marginTop:6}}>Positive = add stock · Negative = remove stock</div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Saving...":"Adjust"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryApp() {
  const [inventory, setInventory] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try {
      const [inv,cyl] = await Promise.all([apiFetch(INVENTORY_API,"/api/Inventory"),apiFetch(CYLINDER_API,"/api/Cylinder/all")]);
      setInventory(inv||[]); setCylinders(cyl||[]);
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function handleDelete(cylinderId) {
    if(!window.confirm("Delete inventory?"))return;
    try { await apiFetch(INVENTORY_API,`/api/Inventory/${cylinderId}`,{method:"DELETE"}); setSuccess("Deleted."); setTimeout(()=>setSuccess(""),2500); load(); }
    catch(err){setError(err.message);}
  }

  function handleSaved(){setModal(null);setSelected(null);setSuccess("Saved.");setTimeout(()=>setSuccess(""),2500);load();}

  const totalStock = inventory.reduce((s,i)=>s+Number(i.quantityAvailable),0);
  const lowStock = inventory.filter(i=>Number(i.quantityAvailable)<=5);
  const maxQty = Math.max(...inventory.map(i=>Number(i.quantityAvailable)),1);

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        <div className="stat-grid" style={{marginBottom:16}}>
          <div className="stat"><div className="stat-label">Total items</div><div className="stat-value white">{inventory.length}</div></div>
          <div className="stat"><div className="stat-label">Total stock</div><div className="stat-value white">{totalStock}</div></div>
          <div className="stat"><div className="stat-label">Low stock</div><div className={`stat-value ${lowStock.length>0?"red":"white"}`}>{lowStock.length}</div></div>
          <div className="stat"><div className="stat-label">Status</div><div className="stat-value sm" style={{color:lowStock.length>0?"#ef5350":"#4caf50"}}>{lowStock.length>0?"ALERT":"OK"}</div></div>
        </div>

        {error&&<div className="error-box">{error}</div>}
        {success&&<div className="success-box">{success}</div>}

        {isAdmin()&&(
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={()=>setModal("create")}>+ Create Inventory</button>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
        )}

        {lowStock.length>0&&(
          <>
            <div className="section-label">Low stock alerts</div>
            {lowStock.map(item=>(
              <div key={item.cylinderId} className="card" style={{background:"#1a0a0a",borderColor:"#5c1f1f",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"#ef5350"}}>{item.brand} — {item.size}</div>
                  <div style={{fontSize:11,color:"#5c1f1f",marginTop:2}}>Critically low</div>
                </div>
                <span className="badge badge-red">{item.quantityAvailable} left</span>
              </div>
            ))}
          </>
        )}

        <div className="section-label">All inventory</div>
        {loading?<div className="loading"><div className="spinner"/> Loading...</div>
        :inventory.length===0?<div className="empty">No inventory records. Create one to get started.</div>
        :inventory.map(item=>{
          const pct = Math.min((Number(item.quantityAvailable)/maxQty)*100,100);
          const barClass = item.quantityAvailable<=5?"low":item.quantityAvailable<=20?"mid":"";
          return (
            <div key={item.cylinderId} className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"#c8e6c8"}}>{item.brand}</div>
                  <div style={{fontSize:12,color:"#2e5c2e",marginTop:2}}>{item.size} · {item.status}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:24,fontWeight:700,color:item.quantityAvailable<=5?"#ef5350":item.quantityAvailable<=20?"#f59e0b":"#4caf50"}}>{item.quantityAvailable}</div>
                  <div style={{fontSize:10,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"0.5px"}}>units</div>
                </div>
              </div>
              <div className="stock-bar-wrap" style={{width:"100%",marginRight:0,marginBottom:12}}>
                <div className={`stock-bar ${barClass}`} style={{width:`${pct}%`}}/>
              </div>
              <div style={{display:"flex",gap:8}}>
                {isAdminOrStaff()&&<button className="btn btn-sm btn-primary" onClick={()=>{setSelected(item);setModal("adjust");}}>Adjust Stock</button>}
                {isAdmin()&&<button className="btn btn-sm btn-danger" onClick={()=>handleDelete(item.cylinderId)}>Delete</button>}
              </div>
            </div>
          );
        })}
      </div>

      {modal==="create"&&<CreateModal cylinders={cylinders} onClose={()=>setModal(null)} onSaved={handleSaved}/>}
      {modal==="adjust"&&selected&&<AdjustModal item={selected} onClose={()=>setModal(null)} onSaved={handleSaved}/>}
    </>
  );
}
