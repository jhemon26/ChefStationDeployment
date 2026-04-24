import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { mobilePrimaryByRole } from '../utils/navigation';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const mobileLinks = mobilePrimaryByRole[user?.role] || [];

  return (
    <div className="app-shell">
      <button type="button" className="hamburger" onClick={() => setOpen((value) => !value)}>
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <Sidebar open={open} setOpen={setOpen} />
      <main className="main">
        <div className="control-shell">{children}</div>
      </main>
      {mobileLinks.length ? (
        <nav className="mobile-nav">
          {mobileLinks.map(([label, to, icon]) => {
            const active = location.pathname === to;
            return (
              <NavLink key={to} to={to} className={`mobile-nav-link ${active ? 'active' : ''}`}>
                <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
