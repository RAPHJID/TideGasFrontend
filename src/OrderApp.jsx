import { useState, useEffect } from "react";
import { apiFetch, CUSTOMER_API, isAdmin, isAdminOrStaff } from "./config";
import { BASE_CSS } from "./theme";

function initials(name){return name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);}

function CustomerModal({ customer, onClose, onSaved }) {
  const isEdit = !!customer?.id;
  const [form, setForm] = useState({ fullName:customer?.fullName||"", email:customer?.email||"", phoneNumber:customer?.phoneNumber||"", address:customer?.address||"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if(!form.fullName||!form.email){setError("Name and email required.");return;}
    setLoading(true);
    try {
      if(isEdit) await apiFetch(CUSTOMER_API,`/api/customer/${customer.id}`,{method:"PUT",body:JSON.stringify(form)});
      else await apiFetch(CUSTOMER_API,"/api/customer",{method:"POST",body:JSON.stringify(form)});
      onSaved();
    } catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>{isEdit?"Edit Customer":"Add Customer"}</h2>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Full name</label><input value={form.fullName} onChange={e=>set("fullName",e.target.value)} placeholder="Jane Smith"/></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="jane@example.com"/></div>
          <div className="field"><label>Phone</label><input value={form.phoneNumber} onChange={e=>set("phoneNumber",e.target.value)} placeholder="+974 1234 5678"/></div>
          <div className="field"><label>Address</label><input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Doha, Qatar"/></div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Saving...":isEdit?"Save":"Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerDetail({ customer, onClose, onEdit, onDelete }) {
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Customer</h2>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"#1a2e1a",border:"1px solid #2e5c2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"#4caf50"}}>{initials(customer.fullName)}</div>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:"#c8e6c8"}}>{customer.fullName}</div>
            <div style={{fontSize:12,color:"#2e5c2e"}}>{customer.email}</div>
          </div>
        </div>
        {[["Phone",customer.phoneNumber||"—"],["Address",customer.address||"—"]].map(([label,val])=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #111811"}}>
            <span style={{fontSize:11,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"1px"}}>{label}</span>
            <span style={{fontSize:14,color:"#c8e6c8"}}>{val}</span>
          </div>
        ))}
        <div className="modal-actions" style={{marginTop:20}}>
          <button className="btn" onClick={onClose}>Close</button>
          {isAdminOrStaff()&&<>
            <button className="btn btn-primary" onClick={()=>{onClose();onEdit(customer);}}>Edit</button>
            <button className="btn btn-danger" onClick={()=>{onClose();onDelete(customer.id);}}>Delete</button>
          </>}
        </div>
      </div>
    </div>
  );
}

export default function CustomerApp() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load() {
    setLoading(true); setError("");
    try { const d = await apiFetch(CUSTOMER_API,"/api/customer"); setCustomers(d||[]); }
    catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  useEffect(()=>{load();},[]);

  async function handleDelete(id) {
    if(!window.confirm("Delete this customer?"))return;
    try { await apiFetch(CUSTOMER_API,`/api/customer/${id}`,{method:"DELETE"}); setSuccess("Deleted."); setTimeout(()=>setSuccess(""),2500); load(); }
    catch(err){setError(err.message);}
  }

  function handleSaved(){setModal(null);setSelected(null);setSuccess("Saved.");setTimeout(()=>setSuccess(""),2500);load();}

  const filtered = customers.filter(c=>
    c.fullName?.toLowerCase().includes(search.toLowerCase())||
    c.email?.toLowerCase().includes(search.toLowerCase())||
    c.phoneNumber?.includes(search)
  );

  return (
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        <div className="stat-grid" style={{marginBottom:16}}>
          <div className="stat"><div className="stat-label">Total customers</div><div className="stat-value white">{customers.length}</div></div>
          <div className="stat"><div className="stat-label">Filtered</div><div className="stat-value white">{filtered.length}</div></div>
        </div>

        {error&&<div className="error-box">{error}</div>}
        {success&&<div className="success-box">{success}</div>}

        {isAdminOrStaff()&&(
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={()=>{setSelected(null);setModal("add");}}>+ Add Customer</button>
            <button className="btn" onClick={load}>Refresh</button>
          </div>
        )}

        <div className="search-wrap">
          <input placeholder="Search name, email, phone..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {loading?<div className="loading"><div className="spinner"/> Loading...</div>
        :filtered.length===0?<div className="empty">No customers found</div>
        :filtered.map(c=>(
          <div key={c.id} className="card" style={{cursor:"pointer"}} onClick={()=>{setSelected(c);setModal("detail");}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:"#1a2e1a",border:"1px solid #2e5c2e",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#4caf50",flexShrink:0}}>{initials(c.fullName)}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:16,fontWeight:600,color:"#c8e6c8"}}>{c.fullName}</div>
                <div style={{fontSize:12,color:"#2e5c2e",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</div>
                {c.phoneNumber&&<div style={{fontSize:12,color:"#5a8a5a",marginTop:1}}>{c.phoneNumber}</div>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e5c2e" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        ))}
      </div>

      {(modal==="add"||modal==="edit")&&<CustomerModal customer={modal==="edit"?selected:null} onClose={()=>setModal(null)} onSaved={handleSaved}/>}
      {modal==="detail"&&selected&&<CustomerDetail customer={selected} onClose={()=>setModal(null)} onEdit={c=>{setSelected(c);setModal("edit");}} onDelete={handleDelete}/>}
    </>
  );
}
