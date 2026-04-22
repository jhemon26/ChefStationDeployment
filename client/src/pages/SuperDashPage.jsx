import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { listRestaurants } from '../services/restaurantService';
import { listUsers } from '../services/userService';

export default function SuperDashPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    Promise.all([listRestaurants(), listUsers()]).then(([restaurantRes, userRes]) => {
      setRestaurants(restaurantRes.data);
      setUsers(userRes.data);
    }).catch(() => {});
  }, []);

  const stats = [
    { label: 'Total Restaurants', value: restaurants.length },
    { label: 'Active Restaurants', value: restaurants.filter((item) => item.is_active).length },
    { label: 'Total Users', value: users.length },
    { label: 'Inactive Restaurants', value: restaurants.filter((item) => !item.is_active).length },
  ];

  return (
    <AppShell>
      <PageHeader title="Platform Overview" subtitle="Super admin controls" />
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="card stack" key={stat.label}>
            <div className="helper-text">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
