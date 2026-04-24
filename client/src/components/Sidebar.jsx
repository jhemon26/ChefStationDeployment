import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { navigationByRole } from '../utils/navigation';

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const sections = navigationByRole[user?.role] || [];
  const initials = user?.display_name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleClass = user?.role === 'super_admin' ? 'role-super' : user?.role === 'owner' ? 'role-owner' : 'role-staff';
  const roleLabel =
    user?.role === 'super_admin'
      ? 'Platform Admin'
      : `${user?.role === 'owner' ? 'Owner' : 'Staff'}`;

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon">CS</div>
        <div className="logo-text">Chef<span>Station</span></div>
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <div className="nav-section">{section.label}</div>
          <nav className="nav">
            {section.links.map(([label, to, icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="nav-icon material-symbols-outlined" aria-hidden="true">{icon}</span>
                <span className="nav-link-copy">{label}</span>
              </NavLink>
            ))}
          </nav>
          {section.label !== sections[sections.length - 1]?.label ? <div className="nav-divider" /> : null}
        </div>
      ))}

      <div style={{ padding: '8px 0' }}>
        <button type="button" className="nav-item" onClick={logout} style={{ color: 'var(--red)', width: '100%', background: 'transparent' }}>
          <span className="nav-icon material-symbols-outlined" aria-hidden="true">logout</span>
          <span className="nav-link-copy">Logout</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className={`avatar ${user.role}`}>{initials}</div>
        <div className="user-info">
          <div className="name">{user.display_name}</div>
          <div className={`role ${roleClass}`}>{roleLabel}</div>
        </div>
      </div>
    </aside>
  );
}
