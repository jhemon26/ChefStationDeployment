import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import BrandLogo from '../components/BrandLogo';

function formatLoginError(err) {
  const rawMessage = err.response?.data?.error || '';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('invalid') || normalized.includes('credential') || normalized.includes('username') || normalized.includes('password')) {
    return 'We could not sign you in with those details. Please check your username and password and try again.';
  }

  if (err.response?.status >= 500) {
    return 'Sign in is temporarily unavailable. Please try again in a moment.';
  }

  return 'We could not complete your sign in right now. Please try again.';
}

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
      setError(formatLoginError(err));
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-box" onSubmit={onSubmit}>
        <div className="lock-icon green"><span className="material-symbols-outlined" aria-hidden="true">lock</span></div>
        <BrandLogo centered />
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
        {error ? (
          <div className="auth-alert auth-alert-error" role="alert" aria-live="polite">
            <span className="material-symbols-outlined auth-alert-icon" aria-hidden="true">error</span>
            <div>
              <div className="auth-alert-title">Sign-in issue</div>
              <div className="auth-alert-message">{error}</div>
            </div>
          </div>
        ) : null}
        <button className="auth-btn green" type="submit">Sign In</button>
        <p className="auth-link" style={{ marginTop: 16 }}>Need access? <Link to="/register">Create account</Link></p>
        <p className="auth-link"><Link to="/">Back</Link></p>
      </form>
    </div>
  );
}
