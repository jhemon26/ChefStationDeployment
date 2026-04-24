import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerStaff } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function RegisterStaffPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    inviteCode: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await registerStaff(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={onSubmit}>
        <div className="lock-icon green"><span className="material-symbols-outlined" aria-hidden="true">key</span></div>
        <h2>Join with Invite Code</h2>
        <p className="sub">Enter the code your restaurant owner shared</p>
        <div className="form-group">
          <label>Invite Code</label>
          <input placeholder="CHEF-7X9K" value={form.inviteCode} onChange={(e) => setForm({ ...form, inviteCode: e.target.value.toUpperCase() })} style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: 3, fontFamily: 'var(--font-display)', fontWeight: 700 }} />
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Your Staff Account</p>
        <div className="form-group">
          <label>Display Name</label>
          <input placeholder="Chef Sarah" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input placeholder="sarah.chef" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input placeholder="--------" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <div className="error-text">{error}</div> : null}
        <button className="auth-btn green" type="submit">Join Restaurant</button>
        <p className="auth-link"><button type="button" onClick={() => navigate('/register')}>Back</button></p>
      </form>
    </div>
  );
}
