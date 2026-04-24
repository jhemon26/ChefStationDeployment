import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="lock-icon green"><span className="material-symbols-outlined" aria-hidden="true">shield</span></div>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div className="logo-icon">CS</div>
          <div className="logo-text">Chef<span>Station</span></div>
        </div>
        <h2>Kitchen Management Platform</h2>
        <p className="sub">Professional kitchen operations, anywhere</p>
        <Link className="auth-btn green" to="/login" style={{ display: 'block', textAlign: 'center', marginBottom: 10 }}>Sign In</Link>
        <Link className="auth-btn blue" to="/register" style={{ display: 'block', textAlign: 'center' }}>Create Account</Link>
        <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 20 }}>Secured with encryption · Authorized access only</p>
      </div>
    </div>
  );
}
