import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { activateUser, deleteUser, listUsers, suspendUser } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatDateTime } from '../utils/formatters';
import { sortAlpha } from '../utils/sortHelpers';
import { confirmAction } from '../utils/confirmAction';

export default function OwnerTeamPage() {
  const { user } = useAuth();
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
      <PageHeader title="Team" subtitle="Manage kitchen staff accounts" />
      <div className="control-list">
        {rows.map((row) => (
          <div key={row.id} className="control-card">
            <div className="control-card-head">
              <div>
                <div className="control-card-title">{row.display_name}</div>
                <div className="helper-text">{row.username}</div>
              </div>
              <div className={`status-chip ${row.is_active ? 'active' : 'inactive'}`}>
                {row.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="control-card-grid">
              <div>
                <div className="helper-text">Role</div>
                <div>{row.role}</div>
              </div>
              <div>
                <div className="helper-text">Joined</div>
                <div>{formatDate(row.created_at)}</div>
              </div>
              <div>
                <div className="helper-text">Last Login</div>
                <div>{formatDateTime(row.last_login)}</div>
              </div>
            </div>
            <div className="control-card-footer">
              {row.id === user.id ? (
                <span className="badge badge-blue">You</span>
              ) : (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => (row.is_active ? suspendUser(row.id) : activateUser(row.id)).then(load)}>
                    {row.is_active ? 'Suspend' : 'Activate'}
                  </button>
                  {row.role === 'staff' ? <button type="button" className="btn btn-danger" onClick={async () => {
                    if (!(await confirmAction(`Remove ${row.display_name}?`, { confirmLabel: 'Remove Staff' }))) return;
                    deleteUser(row.id).then(load);
                  }}>Remove</button> : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
