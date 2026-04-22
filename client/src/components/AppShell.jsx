import { useState } from 'react';
import Sidebar from './Sidebar';

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-shell">
      <button type="button" className="hamburger" onClick={() => setOpen((value) => !value)}>
        <svg><use href="#ico-menu" /></svg>
      </button>
      <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <Sidebar open={open} setOpen={setOpen} />
      <main className="main">{children}</main>
    </div>
  );
}
