import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerRestaurant } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function RegisterOwnerPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    restaurantName: '',
    address: '',
    phone: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await registerRestaurant(form);
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={onSubmit}>
        <div className="lock-icon blue"><svg><use href="#ico-building" /></svg></div>
        <h2>Register Restaurant</h2>
        <p className="sub">Set up your kitchen on ChefStation</p>
        <div className="form-group">
          <label>Restaurant Name</label>
          <input placeholder="The Golden Fork" value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input placeholder="123 High Street, London" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input placeholder="+44 20 1234 5678" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Your Owner Account</p>
        <div className="form-group">
          <label>Display Name</label>
          <input placeholder="Chef Ahmed" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input placeholder="ahmed.chef" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input placeholder="--------" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <div className="error-text">{error}</div> : null}
        <button className="auth-btn blue" type="submit">Create Restaurant & Account</button>
        <p className="auth-link"><button type="button" onClick={() => navigate('/register')}>Back</button></p>
      </form>
    </div>
  );
}
