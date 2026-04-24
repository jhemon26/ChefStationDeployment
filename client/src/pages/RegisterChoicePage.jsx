import { Link } from 'react-router-dom';

export default function RegisterChoicePage() {
  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="lock-icon blue"><span className="material-symbols-outlined" aria-hidden="true">groups</span></div>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
          <div className="logo-icon">CS</div>
          <div className="logo-text">Chef<span>Station</span></div>
        </div>
        <h2>Create Account</h2>
        <p className="sub">Choose your registration type</p>
        <Link className="card" to="/register/restaurant" style={{ display: 'block', cursor: 'pointer', marginBottom: 12, borderColor: 'var(--blue-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="lock-icon blue" style={{ margin: 0, width: 40, height: 40, flexShrink: 0 }}><span className="material-symbols-outlined" aria-hidden="true">storefront</span></div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>Register a Restaurant</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>I'm an owner setting up my kitchen</div>
            </div>
          </div>
        </Link>
        <Link className="card" to="/register/staff" style={{ display: 'block', cursor: 'pointer', borderColor: 'var(--green-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="lock-icon green" style={{ margin: 0, width: 40, height: 40, flexShrink: 0 }}><span className="material-symbols-outlined" aria-hidden="true">key</span></div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem' }}>Join with Invite Code</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>I have a code from my restaurant</div>
            </div>
          </div>
        </Link>
        <p className="auth-link"><Link to="/">Back</Link></p>
      </div>
    </div>
  );
}
