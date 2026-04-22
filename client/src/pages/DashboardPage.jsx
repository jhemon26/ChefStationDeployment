import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import { listLowStock, updateStockItem } from '../services/stockService';
import { listMenuCounts } from '../services/menuService';
import { listPrepTasks } from '../services/prepService';
import { addDays, toLocalDateString } from '../utils/date';
import { getGreeting, formatDate } from '../utils/formatters';
import { getStockPresentation } from '../utils/stockLevels';
import { sortAlpha } from '../utils/sortHelpers';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { restaurant } = useAuth();
  const [lowStock, setLowStock] = useState([]);
  const [menuCounts, setMenuCounts] = useState([]);
  const [prepTasks, setPrepTasks] = useState([]);
  const today = toLocalDateString();
  const tomorrow = toLocalDateString(addDays(new Date(), 1));

  useEffect(() => {
    Promise.all([listLowStock(), listMenuCounts(today), listPrepTasks(tomorrow)])
      .then(([stockRes, menuRes, prepRes]) => {
        setLowStock(sortAlpha(stockRes.data, (item) => item.name));
        setMenuCounts(sortAlpha(menuRes.data, (item) => item.dish_name));
        setPrepTasks(sortAlpha(prepRes.data, (item) => item.task_name));
      })
      .catch(() => {});
  }, [today, tomorrow]);

  const adjustLowStock = async (item, delta) => {
    await updateStockItem(item.id, { delta });
    const { data } = await listLowStock();
    setLowStock(sortAlpha(data, (row) => row.name));
  };

  const soldOut = menuCounts.filter((item) => item.remaining_portions === 0).length;
  const stats = sortAlpha([
    { label: 'Low Stock Alerts', value: lowStock.length, className: 'red' },
    { label: 'Menu Items Active', value: menuCounts.length, className: 'green' },
    { label: 'Prep Tasks Tomorrow', value: prepTasks.length, className: 'amber' },
    { label: 'Sold Out', value: soldOut, className: 'red' },
  ], (item) => item.label);

  const actions = [
    ['Food List', '/food-prep', 'skillet'],
    ['Menu Counter', '/menu-counter', 'inventory_2'],
    ['Prep Sheet', '/prep-sheet', 'edit_note'],
    ['Recipes', '/recipes', 'menu_book'],
    ['Stock Check', '/stock', 'deployed_code'],
    ['Tomorrow', '/todos', 'task_alt'],
  ];

  return (
    <AppShell>
      <PageHeader title={getGreeting()} subtitle={`${formatDate(new Date())} · ${restaurant?.name || 'ChefStation'}`} />
      <div className="stats-row">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="label">{stat.label}</div>
            <div className={`value ${stat.className}`}>{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="section-title">Quick Actions</div>
      <div className="quick-actions">
        {actions.map(([label, href, icon]) => (
          <Link key={href} className="quick-action" to={href}>
            <div className="qa-icon">
              <span className="material-symbols-outlined qa-material" aria-hidden="true">{icon}</span>
            </div>
            <div className="qa-label">{label}</div>
          </Link>
        ))}
      </div>
      <div className="section-title">Low Stock Alerts <span className="badge badge-red">{lowStock.length} items</span></div>
      <div className="card">
        {lowStock.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-symbols-outlined" aria-hidden="true">inventory</span>
            </div>
            <div>No low stock alerts.</div>
          </div>
        ) : lowStock.map((item) => (
          <div key={item.id} className="stock-item">
            <span className="name">{item.name}</span>
            <div className="stock-bar">
              <div
                className={`stock-bar-fill ${getStockPresentation(item).tone}`}
                style={{ width: `${getStockPresentation(item).width}%` }}
              />
            </div>
            <div className="stock-stepper stock-stepper-compact">
              <button
                type="button"
                className="stock-stepper-btn minus"
                onClick={() => adjustLowStock(item, -1)}
                disabled={Number(item.quantity) <= 0}
                aria-label={`Decrease ${item.name} stock`}
              >
                -
              </button>
              <input className="stock-stepper-value stock-stepper-value-readonly" value={item.quantity} readOnly />
              <button
                type="button"
                className="stock-stepper-btn plus"
                onClick={() => adjustLowStock(item, 1)}
                aria-label={`Increase ${item.name} stock`}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
