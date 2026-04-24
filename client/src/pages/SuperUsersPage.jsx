import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { activateUser, listUsers, resetPassword, suspendUser } from '../services/userService';
import { formatDateTime } from '../utils/formatters';
import { sortAlpha } from '../utils/sortHelpers';

export default function SuperUsersPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await listUsers();
    setRows(sortAlpha(data, (item) => item.display_name));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <AppShell>
      <PageHeader title="All Users" subtitle="Global account management" />
      <div className="control-list">
        {rows.map((row) => (
          <div key={row.id} className="control-card">
            <div className="control-card-head">
              <div>
                <div className="control-card-title">{row.display_name}</div>
                <div className="helper-text">{row.username}</div>
              </div>
              <div className={`status-chip ${row.is_active ? 'active' : 'inactive'}`}>{row.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="control-card-grid">
              <div>
                <div className="helper-text">Restaurant</div>
                <div>{row.restaurant_name || 'Platform'}</div>
              </div>
              <div>
                <div className="helper-text">Role</div>
                <div>{row.role}</div>
              </div>
              <div>
                <div className="helper-text">Last Login</div>
                <div>{formatDateTime(row.last_login)}</div>
              </div>
            </div>
            <div className="control-card-footer">
              {row.role !== 'super_admin' ? (
                <button type="button" className="btn btn-ghost" onClick={() => (row.is_active ? suspendUser(row.id) : activateUser(row.id)).then(load)}>
                  {row.is_active ? 'Suspend' : 'Activate'}
                </button>
              ) : null}
              <button type="button" className="btn btn-purple" onClick={() => resetPassword(row.id, 'changeme123').then(load)}>Reset Password</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
