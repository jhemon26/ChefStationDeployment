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
      <div className="control-list">
        {rows.map((row) => (
          <div key={row.id} className="control-card">
            <div className="control-card-head">
              <div className="control-card-title">{row.name}</div>
              <div className={`status-chip ${row.is_active ? 'active' : 'inactive'}`}>{row.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="control-card-grid">
              <div>
                <div className="helper-text">Phone</div>
                <div>{row.phone || 'N/A'}</div>
              </div>
              <div>
                <div className="helper-text">Users</div>
                <div>{row.user_count}</div>
              </div>
            </div>
            <div className="control-card-footer">
              <button type="button" className="btn btn-ghost" onClick={() => (row.is_active ? suspendRestaurant(row.id) : activateRestaurant(row.id)).then(load)}>
                {row.is_active ? 'Suspend' : 'Activate'}
              </button>
              <button type="button" className="btn btn-danger" onClick={async () => {
                if (!(await confirmAction(`Delete restaurant "${row.name}"? This cannot be undone.`, { confirmLabel: 'Delete Restaurant' }))) return;
                deleteRestaurant(row.id).then(load);
              }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
