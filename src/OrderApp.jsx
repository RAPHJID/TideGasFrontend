import { useState, useEffect } from "react";
import { apiFetch, ORDER_API, CUSTOMER_API, CYLINDER_API, can } from "./config";
import { BASE_CSS } from "./theme";

function statusBadge(s){const m={Pending:"badge-amber",Processing:"badge-blue",Completed:"badge-green",Cancelled:"badge-red"};return m[s]||"badge-muted";}

function CreateOrderModal({ onClose, onSaved, customers, cylinders }) {
  const [form, setForm] = useState({ customerId:"", cylinderId:"", quantity:1, totalPrice:"", status:"Pending" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));

  async function handleSubmit(e){
    e.preventDefault();setError("");
    if(!form.customerId||!form.cylinderId||!form.totalPrice){setError("Please fill in all fields.");return;}
    setLoading(true);
    try{
      await apiFetch(ORDER_API,"/api/Order",{method:"POST",body:JSON.stringify({customerId:form.customerId,cylinderId:form.cylinderId,quantity:Number(form.quantity),totalPrice:parseFloat(form.totalPrice),status:form.status})});
      onSaved();
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  }

  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>New Order</h2>
        {error&&<div className="error-box">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Customer</label><select value={form.customerId} onChange={e=>set("customerId",e.target.value)}><option value="">Select customer...</option>{customers.map(c=><option key={c.id} value={c.id}>{c.fullName}</option>)}</select></div>
          <div className="field"><label>Cylinder</label><select value={form.cylinderId} onChange={e=>set("cylinderId",e.target.value)}><option value="">Select cylinder...</option>{cylinders.map(c=><option key={c.id} value={c.id}>{c.brand} — {c.size}</option>)}</select></div>
          <div className="field"><label>Quantity</label><input type="number" min="1" value={form.quantity} onChange={e=>set("quantity",e.target.value)}/></div>
          <div className="field"><label>Total price (QAR)</label><input type="number" value={form.totalPrice} onChange={e=>set("totalPrice",e.target.value)} placeholder="0.00" step="0.01"/></div>
          <div className="field"><label>Status</label><select value={form.status} onChange={e=>set("status",e.target.value)}><option>Pending</option><option>Processing</option><option>Completed</option><option>Cancelled</option></select></div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?"Creating...":"Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetail({ order, onClose, onDelete, onStatusChange }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  async function handleStatus(newStatus){
    setSaving(true);
    try{await onStatusChange(order.id,newStatus);setStatus(newStatus);}
    finally{setSaving(false);}
  }

  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-handle"/>
        <h2>Order Details</h2>
        {[["Customer",order.customerName||"—"],["Cylinder",order.cylinderName||"—"],["Quantity",order.quantity],["Total","QAR "+Number(order.totalPrice).toFixed(2)],["Date",new Date(order.createdAt).toLocaleDateString()]].map(([label,val])=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #111811"}}>
            <span style={{fontSize:11,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"1px"}}>{label}</span>
            <span style={{fontSize:14,color:"#c8e6c8",fontWeight:500}}>{val}</span>
          </div>
        ))}
        {/* Admin + Staff can update status */}
        {can.updateOrderStatus()&&(
          <div style={{marginTop:16}}>
            <div style={{fontSize:11,color:"#2e5c2e",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>Update status</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["Pending","Processing","Completed","Cancelled"].map(s=>(
                <button key={s} className={`btn btn-sm ${status===s?"btn-primary":""}`} disabled={saving} onClick={()=>handleStatus(s)} style={{flex:1}}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
          {/* Admin only can delete */}
          {can.deleteOrder()&&<button className="btn btn-danger" onClick={()=>{onClose();onDelete(order.id);}}>Delete</button>}
        </div>
      </div>
    </div>
  );
}

export default function OrderApp() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  async function load(){
    setLoading(true);setError("");
    try{
      const [o,c,cy]=await Promise.all([apiFetch(ORDER_API,"/api/Order"),apiFetch(CUSTOMER_API,"/api/customer"),apiFetch(CYLINDER_API,"/api/Cylinder/all")]);
      setOrders(o||[]);setCustomers(c||[]);setCylinders(cy||[]);
    }catch(err){setError(err.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);

  async function handleStatusChange(id,status){
    try{await apiFetch(ORDER_API,`/api/Order/${id}/status`,{method:"PATCH",body:JSON.stringify(status)});setSuccess("Status updated.");setTimeout(()=>setSuccess(""),2500);load();}
    catch(err){setError(err.message);}
  }

  async function handleDelete(id){
    if(!window.confirm("Delete this order?"))return;
    try{await apiFetch(ORDER_API,`/api/Order/${id}`,{method:"DELETE"});setSuccess("Deleted.");setTimeout(()=>setSuccess(""),2500);load();}
    catch(err){setError(err.message);}
  }

  function handleSaved(){setModal(null);setSuccess("Order created.");setTimeout(()=>setSuccess(""),2500);load();}

  const stats={total:orders.length,pending:orders.filter(o=>o.status==="Pending").length,completed:orders.filter(o=>o.status==="Completed").length};
  const filtered=orders.filter(o=>{
    const matchFilter=filter==="all"||o.status===filter;
    const matchSearch=o.customerName?.toLowerCase().includes(search.toLowerCase())||o.cylinderName?.toLowerCase().includes(search.toLowerCase());
    return matchFilter&&matchSearch;
  });

  return(
    <>
      <style>{BASE_CSS}</style>
      <div className="page">
        <div className="stat-grid" style={{marginBottom:16}}>
          <div className="stat"><div className="stat-label">Total</div><div className="stat-value white">{stats.total}</div></div>
          <div className="stat"><div className="stat-label">Pending</div><div className={`stat-value ${stats.pending>0?"amber":"white"}`}>{stats.pending}</div></div>
          <div className="stat"><div className="stat-label">Completed</div><div className="stat-value">{stats.completed}</div></div>
          <div className="stat"><div className="stat-label">Revenue</div><div className="stat-value sm">{orders.filter(o=>o.status==="Completed").reduce((s,o)=>s+Number(o.totalPrice),0).toFixed(0)}</div></div>
        </div>

        {error&&<div className="error-box">{error}</div>}
        {success&&<div className="success-box">{success}</div>}

        <div className="topbar-actions">
          {/* Admin + Staff can create orders */}
          {can.createOrder()&&<button className="btn btn-primary" onClick={()=>setModal("create")}>+ New Order</button>}
          <button className="btn" onClick={load}>Refresh</button>
        </div>

        <div className="search-wrap">
          <input placeholder="Search customer or cylinder..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        <div className="tabs">
          {["all","Pending","Processing","Completed","Cancelled"].map(t=>(
            <button key={t} className={`tab-btn ${filter===t?"active":""}`} onClick={()=>setFilter(t)}>{t==="all"?"All":t}</button>
          ))}
        </div>

        {loading?<div className="loading"><div className="spinner"/> Loading...</div>
        :filtered.length===0?<div className="empty">No orders found</div>
        :filtered.map(o=>(
          <div key={o.id} className="card" style={{cursor:"pointer"}} onClick={()=>{setSelected(o);setModal("detail");}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div style={{fontSize:16,fontWeight:700,color:"#c8e6c8"}}>{o.customerName||"—"}</div>
              <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
            </div>
            <div style={{fontSize:12,color:"#2e5c2e",marginBottom:8}}>{o.cylinderName||"—"} · Qty: {o.quantity}</div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#5a8a5a"}}>{new Date(o.createdAt).toLocaleDateString()}</span>
              <span style={{fontSize:16,fontWeight:700,color:"#4caf50"}}>QAR {Number(o.totalPrice).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {modal==="create"&&<CreateOrderModal onClose={()=>setModal(null)} onSaved={handleSaved} customers={customers} cylinders={cylinders}/>}
      {modal==="detail"&&selected&&<OrderDetail order={selected} onClose={()=>setModal(null)} onDelete={handleDelete} onStatusChange={handleStatusChange}/>}
    </>
  );
}
