import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bomList, setBomList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [matName, setMatName] = useState('');
  const [catName, setCatName] = useState('Raw Material');
  const [stockQty, setStockQty] = useState(100);
  const [invPrice, setInvPrice] = useState(''); 

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({ id: null, amount: 0 });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  };

  const fetchData = () => {
    const noCache = { headers: getAuthHeaders(), cache: 'no-store' };
    fetch('http://localhost:8081/api/orders/all', noCache).then(res => res.json()).then(data => setOrders(data));
    fetch('http://localhost:8081/api/invoices/all', noCache).then(res => res.json()).then(data => setInvoices(data));
    fetch('http://localhost:8081/api/purchase-orders/all', noCache).then(res => res.json()).then(data => setPurchaseOrders(data));
    fetch('http://localhost:8081/api/inventory/all', noCache).then(res => res.json()).then(data => setInventory(data));
    fetch('http://localhost:8081/api/bom/all', noCache).then(res => res.json()).then(data => setBomList(data));
    fetch('http://localhost:8081/api/payments/all', noCache).then(res => res.json()).then(data => setPaymentsList(data));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddOrder = (e) => {
    e.preventDefault();
    fetch('http://localhost:8081/api/orders/add', {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ productName, quantity: parseInt(quantity), status: 'Pending', customerName })
    }).then(res => {
      if(res.ok) { setProductName(''); setQuantity(1); setCustomerName(''); fetchData(); alert('🚀 Order Processed Successfully!'); setActiveMenu('orders'); }
    });
  };

  const handleAddInventory = (e) => {
    e.preventDefault();
    fetch('http://localhost:8081/api/inventory/add', {
      method: 'POST', headers: getAuthHeaders(),
      body: JSON.stringify({ materialName: matName, category: catName, stockQty: parseInt(stockQty), price: parseFloat(invPrice), status: 'In Stock' })
    }).then(() => { setMatName(''); setStockQty(100); setInvPrice(''); fetchData(); alert('📦 Inventory Updated!'); });
  };

  const openPaymentModal = (invoiceId, defaultAmount) => {
    setCurrentPayment({ id: invoiceId, amount: defaultAmount });
    setCardDetails({ number: '', expiry: '', cvv: '' });
    setPaymentModalOpen(true);
  };

  const submitPayment = (e) => {
    e.preventDefault();
    fetch('http://localhost:8081/api/payments/process', { 
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ invoiceId: currentPayment.id, amountPaid: parseFloat(currentPayment.amount), paymentMethod: 'Credit Card' })
    }).then(() => { fetchData(); setPaymentModalOpen(false); alert(`✅ Payment Processed Successfully!`); });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    if (window.confirm(`Mark this order as ${newStatus}?`)) {
      fetch(`http://localhost:8081/api/orders/update-status/${orderId}?status=${newStatus}`, { method: 'PUT', headers: getAuthHeaders() })
      .then(res => res.text()).then(response => {
        if (response === 'SUCCESS') { fetchData(); alert(`✅ Order marked as ${newStatus}!`); } 
        else if (response === 'PAYMENT_PENDING') { alert(`❌ CANNOT DELIVER: Payment is still Pending!`); }
      });
    }
  };

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const pendingOrders = orders.filter(o => o.status === 'Pending' || !o.status).length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

  const pieChartData = [ { name: 'Delivered', value: deliveredOrders }, { name: 'Pending', value: pendingOrders }, { name: 'Cancelled', value: cancelledOrders } ];
  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];
  const barChartData = inventory.map(item => ({ name: item.materialName, stock: item.stockQty }));

  const renderNavItem = (id, icon, label) => {
    const isActive = activeMenu === id;
    return (
      <div onClick={() => setActiveMenu(id)} className="nav-item" style={{
        padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
        background: isActive ? 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)' : 'transparent',
        color: isActive ? '#ffffff' : '#94a3b8',
        fontWeight: isActive ? '700' : '600',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        boxShadow: isActive ? '0 4px 10px rgba(59,130,246,0.3)' : 'none'
      }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  return (
    /* NAYA PREMIUM GRADIENT BACKGROUND YAHAN HAI */
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #dbeafe 100%)', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .modern-input { transition: all 0.3s; border: 2px solid #e2e8f0; background: #ffffff; }
        .modern-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 4px rgba(59,130,246,0.15) !important; outline: none; }
        
        /* CARD SHADOW BADHA DI GAYI HAI TAAKI GRADIENT PE FLOAT KARE */
        .hover-card { transition: all 0.3s ease; border: 1px solid rgba(255,255,255,0.9); background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); box-shadow: 0 8px 25px rgba(0,0,0,0.06); }
        .hover-card:hover { transform: translateY(-5px); box-shadow: 0 20px 35px -5px rgba(0,0,0,0.1), 0 10px 15px -5px rgba(0,0,0,0.05) !important; }
        
        .btn-hover { transition: all 0.3s ease; }
        .btn-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(0,0,0,0.15); filter: brightness(105%); }
        .row-hover:hover { background-color: #f8fafc !important; }
        .nav-item:hover { background: rgba(255,255,255,0.1) !important; color: #ffffff !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* TOP NAVBAR */}
      <div style={{ background: 'linear-gradient(90deg, #0b1437 0%, #1e2942 100%)', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 20 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', boxShadow: '0 4px 10px rgba(59,130,246,0.4)' }}>⚡</div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>OrderCraft</h2>
        </div>

        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto' }}>
          {renderNavItem('dashboard', '📊', 'Dashboard')}
          {renderNavItem('orders', '📦', 'Orders')}
          {renderNavItem('inventory', '🏢', 'Inventory')}
          {renderNavItem('invoices', '🧾', 'Invoices')}
          {renderNavItem('payments', '💳', 'Payments')}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>Admin Online</span>
          </div>
          <button onClick={() => { localStorage.removeItem('token'); onLogout(false); }} className="btn-hover" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#ffffff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, padding: '35px 50px', overflowY: 'auto' }}>
        
        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1e293b', textTransform: 'capitalize' }}>{activeMenu} Overview</h1>
        </div>
        
        {activeMenu === 'dashboard' && (
          <div>
            {/* TOP CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '35px' }}>
              {[ { label: 'Total Orders', val: totalOrders, icon: '🛍️', color: '#3b82f6', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' },
                 { label: 'Delivered', val: deliveredOrders, icon: '✅', color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' },
                 { label: 'Pending Processing', val: pendingOrders, icon: '⏳', color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' }
              ].map((card, i) => (
                <div key={i} className="hover-card" style={{ padding: '25px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div><p style={{ margin: '0 0 8px 0', color: '#64748b', fontWeight: '600', fontSize: '15px' }}>{card.label}</p><h2 style={{ margin: 0, fontSize: '42px', color: '#0f172a', fontWeight: '800' }}>{card.val}</h2></div>
                  <div style={{ width: '65px', height: '65px', borderRadius: '18px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>{card.icon}</div>
                </div>
              ))}
            </div>

            {/* CHARTS */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '35px', flexWrap: 'wrap' }}>
              <div className="hover-card" style={{ flex: '2 1 500px', padding: '25px', borderRadius: '20px', height: '380px' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Real-time Inventory Levels</h3>
                {inventory.length > 0 ? ( <ResponsiveContainer width="100%" height="85%"><BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><RechartsTooltip cursor={{fill: 'rgba(248, 250, 252, 0.5)'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}} /><Bar dataKey="stock" fill="url(#colorUv)" radius={[6, 6, 0, 0]} barSize={35} />
                  <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/><stop offset="100%" stopColor="#2563eb" stopOpacity={1}/></linearGradient></defs>
                </BarChart></ResponsiveContainer> ) : ( <p style={{textAlign: 'center', color: '#94a3b8', marginTop: '120px', fontWeight:'600'}}>No inventory records.</p> )}
              </div>

              <div className="hover-card" style={{ flex: '1 1 350px', padding: '25px', borderRadius: '20px', height: '380px' }}>
                <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '18px', fontWeight: '800', marginBottom: '20px' }}>Order Fulfillment Status</h3>
                {totalOrders > 0 ? ( <ResponsiveContainer width="100%" height="80%"><PieChart><Pie data={pieChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} stroke="none" dataKey="value">{pieChartData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} /> ))}</Pie><RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 20px rgba(0,0,0,0.1)'}} /><Legend verticalAlign="bottom" height={36} iconType="circle"/></PieChart></ResponsiveContainer> ) : ( <p style={{textAlign: 'center', color: '#94a3b8', marginTop: '120px', fontWeight:'600'}}>No data available.</p> )}
              </div>
            </div>

            {/* CREATE ORDER FORM */}
            <div className="hover-card" style={{ padding: '35px', borderRadius: '20px' }}>
              <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '20px', fontWeight: '800', marginBottom: '25px', display:'flex', alignItems:'center', gap:'10px' }}><span style={{background:'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', padding:'10px', borderRadius:'12px'}}>🛒</span> Quick Order Entry</h3>
              <form onSubmit={handleAddOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
                <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '700', color: '#64748b' }}>Customer Name</label><input type="text" value={customerName} onChange={e=>setCustomerName(e.target.value)} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} placeholder="e.g. Acme Corp" /></div>
                <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '700', color: '#64748b' }}>Select Product</label>
                  <select value={productName} onChange={e=>setProductName(e.target.value)} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px', cursor:'pointer' }}>
                    <option value="" disabled>-- Choose from Inventory --</option>
                    {inventory.map(inv => ( <option key={inv.id} value={inv.materialName}>{inv.materialName} - ${inv.price} (Qty: {inv.stockQty})</option> ))}
                  </select>
                </div>
                <div><label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', fontWeight: '700', color: '#64748b' }}>Quantity</label><input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} /></div>
                <button type="submit" className="btn-hover" style={{ padding: '14px', background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize:'15px', height:'51px', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>Process Order</button>
              </form>
            </div>
          </div>
        )}

        {/* SHARED TABLE STYLES FOR ALL TABS */}
        {['orders', 'inventory', 'invoices', 'payments'].includes(activeMenu) && (
           <div className="hover-card" style={{ borderRadius: '20px', padding: '30px' }}>
             
             {activeMenu === 'inventory' && (
               <form onSubmit={handleAddInventory} style={{ display: 'flex', gap: '15px', marginBottom: '35px', paddingBottom:'35px', borderBottom:'2px dashed #cbd5e1', flexWrap:'wrap', alignItems:'flex-end' }}>
                 <div style={{flex:1, minWidth:'150px'}}><label style={{fontSize:'13px', fontWeight:'700', color:'#64748b'}}>Material Name</label><input type="text" className="modern-input" value={matName} onChange={e=>setMatName(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'10px', marginTop:'8px'}}/></div>
                 <div style={{flex:1, minWidth:'150px'}}><label style={{fontSize:'13px', fontWeight:'700', color:'#64748b'}}>Category</label><select className="modern-input" value={catName} onChange={e=>setCatName(e.target.value)} style={{width:'100%', padding:'12px', borderRadius:'10px', marginTop:'8px'}}><option>Finished Goods</option><option>Raw Material</option></select></div>
                 <div style={{width:'130px'}}><label style={{fontSize:'13px', fontWeight:'700', color:'#64748b'}}>Unit Price ($)</label><input type="number" step="0.01" className="modern-input" value={invPrice} onChange={e=>setInvPrice(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'10px', marginTop:'8px'}}/></div>
                 <div style={{width:'130px'}}><label style={{fontSize:'13px', fontWeight:'700', color:'#64748b'}}>Stock Qty</label><input type="number" className="modern-input" value={stockQty} onChange={e=>setStockQty(e.target.value)} required style={{width:'100%', padding:'12px', borderRadius:'10px', marginTop:'8px'}}/></div>
                 <button type="submit" className="btn-hover" style={{padding:'12px 25px', background:'linear-gradient(135deg, #10b981 0%, #059669 100%)', color:'white', border:'none', borderRadius:'10px', fontWeight:'800', cursor:'pointer', height:'47px', boxShadow: '0 4px 10px rgba(16,185,129,0.3)'}}>+ Add Item</button>
               </form>
             )}

             <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', textAlign: 'left', fontSize: '15px' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '13px', textTransform:'uppercase', letterSpacing:'1px' }}>
                    {activeMenu === 'orders' && <><th style={{padding:'0 20px 10px'}}>ID</th><th style={{padding:'0 20px 10px'}}>Customer</th><th style={{padding:'0 20px 10px'}}>Product</th><th style={{padding:'0 20px 10px'}}>Status</th><th style={{padding:'0 20px 10px'}}>Actions</th></>}
                    {activeMenu === 'inventory' && <><th style={{padding:'0 20px 10px'}}>SKU</th><th style={{padding:'0 20px 10px'}}>Item Name</th><th style={{padding:'0 20px 10px'}}>Price</th><th style={{padding:'0 20px 10px'}}>Available Stock</th><th style={{padding:'0 20px 10px'}}>Health</th></>}
                    {activeMenu === 'invoices' && <><th style={{padding:'0 20px 10px'}}>Invoice No</th><th style={{padding:'0 20px 10px'}}>Billed To</th><th style={{padding:'0 20px 10px'}}>Total Due</th><th style={{padding:'0 20px 10px'}}>Payment Status</th><th style={{padding:'0 20px 10px'}}>Gateway</th></>}
                    {activeMenu === 'payments' && <><th style={{padding:'0 20px 10px'}}>Txn ID</th><th style={{padding:'0 20px 10px'}}>Invoice Ref</th><th style={{padding:'0 20px 10px'}}>Method</th><th style={{padding:'0 20px 10px'}}>Amount</th><th style={{padding:'0 20px 10px'}}>Status</th></>}
                  </tr>
                </thead>
                <tbody>
                  {activeMenu === 'orders' && orders.map(o => (
                    <tr key={o.id} className="row-hover" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition:'all 0.3s' }}>
                      <td style={{ padding: '18px 20px', color: '#64748b', borderRadius: '12px 0 0 12px', border:'1px solid #e2e8f0', borderRight:'none' }}>#{o.id}</td>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#0f172a', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}>{o.customerName}</td>
                      <td style={{ padding: '18px 20px', color: '#2563eb', fontWeight: '700', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}>{o.productName} <span style={{color: '#94a3b8', fontSize:'13px'}}>(x{o.quantity})</span></td>
                      <td style={{ padding: '18px 20px', borderTop:'1px solid #e2e8f0', borderBottom:'1px solid #e2e8f0' }}><span style={{ background: o.status === 'Delivered' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : (o.status === 'Cancelled' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'), color: o.status === 'Delivered' ? '#059669' : (o.status === 'Cancelled' ? '#dc2626' : '#d97706'), padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{o.status || 'Processing'}</span></td>
                      <td style={{ padding: '18px 20px', display: 'flex', gap: '10px', borderRadius: '0 12px 12px 0', border:'1px solid #e2e8f0', borderLeft:'none' }}>
                        {(o.status !== 'Delivered' && o.status !== 'Cancelled') ? (
                          <><button className="btn-hover" onClick={() => handleUpdateOrderStatus(o.id, 'Delivered')} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Deliver</button>
                          <button className="btn-hover" onClick={() => handleUpdateOrderStatus(o.id, 'Cancelled')} style={{ padding: '8px 14px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Cancel</button></>
                        ) : (<span style={{color: '#cbd5e1', fontSize: '14px', fontStyle: 'italic', padding:'8px 0'}}>Completed</span>)}
                      </td>
                    </tr>
                  ))}

                  {activeMenu === 'inventory' && inventory.map(inv => (
                    <tr key={inv.id} className="row-hover" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '18px 20px', color: '#64748b', borderRadius: '12px 0 0 12px' }}>ITM-{inv.id}</td><td style={{ padding: '18px 20px', fontWeight: '800', color: '#0f172a' }}>{inv.materialName}</td><td style={{ padding: '18px 20px', color: '#10b981', fontWeight: '800' }}>${inv.price}</td><td style={{ padding: '18px 20px', fontWeight: '800', fontSize: '17px', color:'#0f172a' }}>{inv.stockQty}</td><td style={{ padding: '18px 20px', borderRadius: '0 12px 12px 0' }}><span style={{ background: inv.status === 'Low Stock' ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)' : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: inv.status === 'Low Stock' ? '#dc2626' : '#059669', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{inv.status}</span></td>
                    </tr>
                  ))}

                  {activeMenu === 'invoices' && invoices.map(inv => (
                    <tr key={inv.id} className="row-hover" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '18px 20px', color: '#64748b', borderRadius: '12px 0 0 12px' }}>INV-{inv.id}</td><td style={{ padding: '18px 20px', fontWeight: '800', color: '#0f172a' }}>{inv.customerName}</td><td style={{ padding: '18px 20px', fontWeight: '800', fontSize: '17px', color:'#0f172a' }}>${inv.totalAmount}</td>
                      <td style={{ padding: '18px 20px' }}><span style={{ background: inv.paymentStatus === 'Paid' ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', color: inv.paymentStatus === 'Paid' ? '#059669' : '#d97706', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{inv.paymentStatus}</span></td>
                      <td style={{ padding: '18px 20px', borderRadius: '0 12px 12px 0' }}>{inv.paymentStatus !== 'Paid' ? (<button className="btn-hover" onClick={() => openPaymentModal(inv.id, inv.totalAmount)} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>💳 Pay via Card</button>) : (<span style={{color: '#10b981', fontSize: '14px', fontWeight:'800', display:'flex', alignItems:'center', gap:'6px'}}>✓ Settled</span>)}</td>
                    </tr>
                  ))}

                  {activeMenu === 'payments' && paymentsList.map(p => (
                    <tr key={p.id} className="row-hover" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                      <td style={{ padding: '18px 20px', fontWeight: '800', color: '#64748b', borderRadius: '12px 0 0 12px' }}>{p.transactionId}</td><td style={{ padding: '18px 20px', color:'#2563eb', fontWeight:'700' }}>INV-{p.invoiceId}</td><td style={{ padding: '18px 20px', color: '#64748b' }}>{p.paymentMethod}</td><td style={{ padding: '18px 20px', color: '#10b981', fontWeight: '800', fontSize: '17px' }}>${p.amountPaid}</td>
                      <td style={{ padding: '18px 20px', borderRadius: '0 12px 12px 0' }}><span style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#059669', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800' }}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
           </div>
        )}
      </div>

      {paymentModalOpen && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', fontWeight:'800', display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{background:'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color:'white', padding:'6px 12px', borderRadius:'8px', fontSize:'14px'}}>Stripe</div> Checkout</h2>
              <button className="btn-hover" onClick={() => setPaymentModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', width:'36px', height:'36px', borderRadius:'50%', cursor: 'pointer', color: '#64748b', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <form onSubmit={submitPayment}>
              <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Amount to Pay ($)</label><input type="number" step="0.01" value={currentPayment.amount} readOnly style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', fontWeight: '800', fontSize: '22px', color: '#10b981', outline:'none' }} /></div>
              <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Card Number</label><input type="text" placeholder="XXXX XXXX XXXX XXXX" maxLength="16" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px', letterSpacing: '2px', fontFamily:'monospace', fontSize:'16px' }} /></div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Expiry Date</label><input type="text" placeholder="MM/YY" maxLength="5" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} /></div>
                <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '700', color: '#64748b' }}>Security Code</label><input type="password" placeholder="CVC" maxLength="3" value={cardDetails.cvv} onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})} required className="modern-input" style={{ width: '100%', padding: '14px', borderRadius: '12px' }} /></div>
              </div>
              <button type="submit" className="btn-hover" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow:'0 10px 20px rgba(99,102,241,0.3)' }}>🔒 Securely Pay ${currentPayment.amount}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;