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
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th>Last Login</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.display_name}</td>
                  <td>{row.username}</td>
                  <td>{row.role}</td>
                  <td>{formatDate(row.created_at)}</td>
                  <td>{formatDateTime(row.last_login)}</td>
                  <td className="toolbar">
                    {row.id === user.id ? (
                      <span>You</span>
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
