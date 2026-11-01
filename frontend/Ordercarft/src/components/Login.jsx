import { useState } from 'react';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleAction = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    const url = isForgotPassword 
      ? 'http://localhost:8081/api/auth/forgot-password' 
      : 'http://localhost:8081/api/auth/login';

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then(response => response.text())
      .then(data => {
        setIsLoading(false);
        if (isForgotPassword) {
          if (data === 'SUCCESS') {
            setSuccessMsg('Password updated successfully! You can now login.');
            setIsForgotPassword(false); 
            setPassword(''); 
          } else {
            setError('Username not found in database.');
          }
        } else {
          if (data && data !== 'FAILED') {
            localStorage.setItem('token', data);
            onLogin(true); 
          } else {
            setError('Invalid credentials. Please try again.');
          }
        }
      })
      .catch(err => {
        setIsLoading(false);
        setError('Server error! Ensure backend is running.');
        console.error(err);
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* LEFT SIDE - WEBSITE INTRO (HERO SECTION) */}
      <div style={{ flex: '1.2', backgroundColor: '#0f172a', color: 'white', padding: '60px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '60px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#38bdf8', borderRadius: '8px' }}></div>
            <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px' }}>OrderCraft ERP</h1>
          </div>
          
          {/* Main Hero Text */}
          <h2 style={{ fontSize: '48px', lineHeight: '1.2', marginBottom: '20px', fontWeight: '800' }}>
            Manage Your Enterprise <br/>
            <span style={{ color: '#38bdf8' }}>Smarter & Faster.</span>
          </h2>
          <p style={{ fontSize: '18px', color: '#94a3b8', marginBottom: '50px', maxWidth: '500px', lineHeight: '1.6' }}>
            The ultimate full-stack ERP solution designed for modern manufacturing and sales teams. Track inventory, manage bills of materials, and process payments in real-time.
          </p>
          
          {/* Feature Highlights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', fontSize: '24px' }}>📦</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Automated Workflow</div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Auto-generate Invoices and Purchase Orders.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', fontSize: '24px' }}>🧩</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Dynamic BOM</div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Manage Bill of Materials for complex products.</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '10px', fontSize: '24px' }}>📊</span>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Live Analytics</div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Track business growth with real-time charts.</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          © 2026 OrderCraft Systems. Developed by Harsh Rajpoot.
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div style={{ flex: '1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ backgroundColor: 'white', padding: '50px 40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', width: '100%', maxWidth: '420px' }}>
          
          <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#0f172a', fontSize: '28px' }}>
            {isForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </h2>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>
             {isForgotPassword ? 'Enter your new password below' : 'Please enter your details to sign in.'}
          </p>
          
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>{error}</div>}
          {successMsg && <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center', fontWeight: '500' }}>{successMsg}</div>}

          <form onSubmit={handleAction}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter your username" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none', transition: 'border 0.3s' }} />
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                {isForgotPassword ? 'New Password' : 'Password'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '16px', transition: 'background 0.3s' }}>
              {isLoading ? 'Processing...' : (isForgotPassword ? 'Update Password' : 'Sign In')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              type="button"
              onClick={() => { setIsForgotPassword(!isForgotPassword); setError(''); setSuccessMsg(''); setPassword(''); }} 
              style={{ background: 'none', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {isForgotPassword ? 'Back to Login' : 'Forgot Password?'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;