import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const sectionsByRole = {
  super_admin: [
    {
      label: 'Platform Admin',
      links: [
        ['Overview', '/super', 'ico-shield'],
        ['Restaurants', '/super/restaurants', 'ico-building'],
        ['All Users', '/super/users', 'ico-users'],
      ],
    },
  ],
  owner: [
    {
      label: 'Management',
      links: [
        ['Team', '/owner/team', 'ico-users'],
        ['Invite Codes', '/owner/codes', 'ico-key'],
        ['Settings', '/owner/settings', 'ico-settings'],
      ],
    },
    {
      label: 'Kitchen',
      links: [
        ['Dashboard', '/dashboard', 'ico-dashboard'],
        ['Food List', '/food-prep', 'ico-flame'],
        ['Menu Counter', '/menu-counter', 'ico-clipboard'],
        ['Prep Sheet', '/prep-sheet', 'ico-edit'],
        ['Tomorrow', '/todos', 'ico-check'],
        ['Stock Tracker', '/stock', 'ico-box'],
        ['Recipe Book', '/recipes', 'ico-book'],
      ],
    },
  ],
  staff: [
    {
      label: 'Kitchen',
      links: [
        ['Dashboard', '/dashboard', 'ico-dashboard'],
        ['Food List', '/food-prep', 'ico-flame'],
        ['Menu Counter', '/menu-counter', 'ico-clipboard'],
        ['Prep Sheet', '/prep-sheet', 'ico-edit'],
        ['Tomorrow', '/todos', 'ico-check'],
        ['Stock Tracker', '/stock', 'ico-box'],
        ['Recipe Book', '/recipes', 'ico-book'],
      ],
    },
  ],
};

export default function Sidebar({ open, setOpen }) {
  const { user, logout } = useAuth();
  const sections = sectionsByRole[user?.role] || [];
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
                <span className="icon"><svg><use href={`#${icon}`} /></svg></span>
                {label}
              </NavLink>
            ))}
          </nav>
          {section.label !== sections[sections.length - 1]?.label ? <div className="nav-divider" /> : null}
        </div>
      ))}

      <div style={{ padding: '8px 0' }}>
        <button type="button" className="nav-item" onClick={logout} style={{ color: 'var(--red)', width: '100%', background: 'transparent' }}>
          <span className="icon"><svg style={{ color: 'var(--red)' }}><use href="#ico-logout" /></svg></span>
          Logout
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
