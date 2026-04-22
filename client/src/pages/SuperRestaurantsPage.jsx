import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { activateRestaurant, deleteRestaurant, listRestaurants, suspendRestaurant } from '../services/restaurantService';
import { sortAlpha } from '../utils/sortHelpers';
import { confirmAction } from '../utils/confirmAction';

export default function SuperRestaurantsPage() {
  const [rows, setRows] = useState([]);

  const load = async () => {
    const { data } = await listRestaurants();
    setRows(sortAlpha(data, (item) => item.name));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  return (
    <AppShell>
      <PageHeader title="Restaurants" subtitle="Suspend, activate, or delete tenants" />
      <div className="card">
        <div className="table-scroll">
          <table className="list-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Users</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.phone || 'N/A'}</td>
                  <td>{row.user_count}</td>
                  <td>{row.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="toolbar">
                    <button type="button" className="btn btn-ghost" onClick={() => (row.is_active ? suspendRestaurant(row.id) : activateRestaurant(row.id)).then(load)}>
                      {row.is_active ? 'Suspend' : 'Activate'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={async () => {
                      if (!(await confirmAction(`Delete restaurant "${row.name}"? This cannot be undone.`, { confirmLabel: 'Delete Restaurant' }))) return;
                      deleteRestaurant(row.id).then(load);
                    }}>Delete</button>
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
