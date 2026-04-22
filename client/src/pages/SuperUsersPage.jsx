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
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Restaurant</th><th>Role</th><th>Last Login</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.display_name}</td>
                  <td>{row.username}</td>
                  <td>{row.restaurant_name || 'Platform'}</td>
                  <td>{row.role}</td>
                  <td>{formatDateTime(row.last_login)}</td>
                  <td className="toolbar">
                    {row.role !== 'super_admin' ? (
                      <button type="button" className="btn btn-ghost" onClick={() => (row.is_active ? suspendUser(row.id) : activateUser(row.id)).then(load)}>
                        {row.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    ) : null}
                    <button type="button" className="btn btn-purple" onClick={() => resetPassword(row.id, 'changeme123').then(load)}>Reset Password</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
