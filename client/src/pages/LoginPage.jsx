import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await loginRequest(form);
      login(data);
      navigate(data.user.role === 'super_admin' ? '/super' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={onSubmit}>
        <div className="lock-icon green"><svg><use href="#ico-lock" /></svg></div>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div className="logo-icon">CS</div>
          <div className="logo-text">Chef<span>Station</span></div>
        </div>
        <h2>Sign In</h2>
        <p className="sub">Enter your credentials</p>
        <div className="form-group">
          <label>Username</label>
          <input placeholder="chef.username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input placeholder="--------" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <div className="error-text">{error}</div> : null}
        <button className="auth-btn green" type="submit">Sign In</button>
        <p className="auth-link" style={{ marginTop: 16 }}>Need access? <Link to="/register">Create account</Link></p>
        <p className="auth-link"><Link to="/">Back</Link></p>
      </form>
    </div>
  );
}
