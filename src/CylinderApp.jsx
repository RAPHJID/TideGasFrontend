import { useState, useEffect } from "react";
import { apiFetch, CYLINDER_API, getRoles, can } from "./config";
import { BASE_CSS } from "./theme";

function statusBadge(s){const m={Available:"badge-green",InUse:"badge-amber",UnderRefill:"badge-blue",Damaged:"badge-red"};return m[s]||"badge-muted";}
function condBadge(c){const m={New:"badge-blue",Good:"badge-green",Fair:"badge-amber",Damaged:"badge-red"};return m[c]||"badge-muted";}

function CylinderModal({ cylinder, onClose, onSaved }) {
  const isEdit = !!cylinder?.id;
  const [form, setForm] = useState({ size:cylinder?.size||"", brand:cylinder?.brand||"", status:cylinder?.status||"Available", condition:cylinder?.condition||"Good" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (!form.brand||!form.size){setError("Brand and size required.");return;}
    setLoading(true);
    try {
      if (isEdit) await apiFetch(CYLINDER_API,`/api/Cylinder/${cylinder.id}`,{method:"PUT",body:JSON.stringify(form)});
      else await apiFetch(CYLINDER_API,"/api/Cylinder",{method:"POST",body:JSON.stringify(form)});
      onSaved();
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>{isEdit?"Edit Cylinder":"Add Cylinder"}</h2>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Brand</label><input value={form.brand} onChange={e=>set("brand",e.target.value)} placeholder="e.g. Total, Woqod"/></div>
          <div className="field"><label>Size</label><input value={form.size} onChange={e=>set("size",e.target.value)} placeholder="e.g. 12kg, 45kg"/></div>
          <div className="field"><label>Status</label><select value={form.status} onChange={e=>set("status",e.target.value)}><option>Available</option><option>InUse</option><option>UnderRefill</option><option>Damaged</option></select></div>
          <div className="field"><label>Condition</label><select value={form.condition} onChange={e=>set("condition",e.target.value)}><option>Good</option><option>Fair</option><option>New</option><option>Damaged</option></select></div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Saving...":isEdit?"Save":"Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SalesModal({ cylinder, onClose, onSaved }) {
  const [qty, setQty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (!qty||isNaN(qty)){setError("Enter a valid quantity.");return;}
    setLoading(true);
    try { await apiFetch(CYLINDER_API,`/api/Cylinder/${cylinder.id}/daily-sales`,{method:"PUT",body:JSON.stringify({quantitySoldToday:Number(qty)})}); onSaved(); }
    catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Daily Sales</h2>
        <div style={{fontSize:13,color:"#2e5c2e",marginBottom:16}}>{cylinder.brand} — {cylinder.size}</div>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Qty sold today</label><input type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="0"/></div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Saving...":"Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CylinderApp() {
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load(){setLoading(true);setError("");try{const d=await apiFetch(CYLINDER_API,"/api/Cylinder/all");setCylinders(d||[]);}catch(err){setError(err.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);

  async function handleDelete(id){
    if(!window.confirm("Delete this cylinder?"))return;
    try{await apiFetch(CYLINDER_API,`/api/Cylinder/${id}`,{method:"DELETE"});setSuccess("Deleted.");setTimeout(()=>setSuccess(""),2500);load();}
    catch(err){setError(err.message);}
  }

  function handleSaved(){setModal(null);setSelected(null);setSuccess("Saved.");setTimeout(()=>setSuccess(""),2500);load();}

  const filtered = tab==="all"?cylinders:cylinders.filter(c=>c.status===tab);
  const stats = {total:cylinders.length,available:cylinders.filter(c=>c.status==="Available").length,inUse:cylinders.filter(c=>c.status==="InUse").length};

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        <div className="stat-grid" style={{marginBottom:16}}>
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value white">{stats.total}</div></div>
          <div className="stat"><div className="stat-label">Available</div><div className="stat-value">{stats.available}</div></div>
          <div className="stat"><div className="stat-label">In use</div><div className="stat-value amber">{stats.inUse}</div></div>
          <div className="stat"><div className="stat-label">Other</div><div className="stat-value white">{stats.total-stats.available-stats.inUse}</div></div>
        </div>

        {error&&<div className="error-box">{error}</div>}
        {success&&<div className="success-box">{success}</div>}

        <div className="topbar-actions">
          {/* Admin only — add cylinder */}
          {can.addCylinder()&&<button className="btn btn-primary" onClick={()=>{setSelected(null);setModal("add");}}>+ Add Cylinder</button>}
          <button className="btn" onClick={load}>Refresh</button>
        </div>

        <div className="tabs">
          {["all","Available","InUse","UnderRefill","Damaged"].map(t=>(
            <button key={t} className={`tab-btn ${tab===t?"active":""}`} onClick={()=>setTab(t)}>{t==="all"?"All":t}</button>
          ))}
        </div>

        {loading?<div className="loading"><div className="spinner"/> Loading...</div>
        :filtered.length===0?<div className="empty">No cylinders found</div>
        :filtered.map(c=>(
          <div key={c.id} className="card">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:"#c8e6c8"}}>{c.brand}</div>
                <div style={{fontSize:12,color:"#2e5c2e",marginTop:3}}>{c.size}</div>
              </div>
              <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span className={`badge ${condBadge(c.condition)}`}>{c.condition}</span>
              <span style={{fontSize:12,color:"#2e5c2e"}}>Sold today: <span style={{color:"#c8e6c8"}}>{c.soldToday??0}</span></span>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {/* Admin + Staff */}
              {can.updateDailySales()&&<button className="btn btn-sm" onClick={()=>{setSelected(c);setModal("sales");}}>Daily Sales</button>}
              {/* Admin only */}
              {can.editCylinder()&&<button className="btn btn-sm" onClick={()=>{setSelected(c);setModal("edit");}}>Edit</button>}
              {can.deleteCylinder()&&<button className="btn btn-sm btn-danger" onClick={()=>handleDelete(c.id)}>Delete</button>}
            </div>
          </div>
        ))}
      </div>

      {(modal==="add"||modal==="edit")&&<CylinderModal cylinder={modal==="edit"?selected:null} onClose={()=>setModal(null)} onSaved={handleSaved}/>}
      {modal==="sales"&&selected&&<SalesModal cylinder={selected} onClose={()=>setModal(null)} onSaved={handleSaved}/>}
    </>
  );
}
