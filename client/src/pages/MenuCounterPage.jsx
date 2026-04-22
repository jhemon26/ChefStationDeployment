import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import AllergenChip from '../components/AllergenChip';
import { listDishes } from '../services/dishService';
import { createMenuCount, listMenuCounts, resetMenuCounts, updateMenuCount } from '../services/menuService';
import { toLocalDateString } from '../utils/date';
import { confirmAction } from '../utils/confirmAction';
import { sortAlpha } from '../utils/sortHelpers';

const today = toLocalDateString();

export default function MenuCounterPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    const [{ data: counts }, { data: dishes }] = await Promise.all([listMenuCounts(today), listDishes()]);
    const byDish = new Map(counts.map((count) => [count.dish_id, count]));
    const merged = sortAlpha(dishes.filter((dish) => dish.show_on_menu), (item) => item.name).map((dish) => byDish.get(dish.id) || ({
      id: `new-${dish.id}`,
      dish_id: dish.id,
      dish_name: dish.name,
      allergens: dish.allergens,
      total_portions: 0,
      remaining_portions: 0,
    }));
    setItems(merged);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const adjust = async (item, delta) => {
    if (String(item.id).startsWith('new-')) {
      if (delta < 0) return;
      await createMenuCount({
        dish_id: item.dish_id,
        date: today,
        total_portions: Math.max(0, delta > 0 ? 1 : 0),
        remaining_portions: Math.max(0, delta > 0 ? 1 : 0),
      });
    } else {
      await updateMenuCount(item.id, { delta });
    }
    load();
  };

  const handleResetAll = async () => {
    if (
      !(await confirmAction('Reset all menu counts to 0?', {
        title: 'Warning',
        confirmLabel: 'Reset All',
      }))
    ) {
      return;
    }

    await resetMenuCounts(today);
    await load();
  };

  return (
    <AppShell>
      <PageHeader
        title="Menu Counter"
        subtitle="Live portions remaining for service"
        actions={<button className="btn btn-danger" type="button" onClick={handleResetAll}>Reset All</button>}
      />
      <div className="recipe-grid">
        {items.map((item) => (
          <div key={item.dish_id} className={`card stack menu-counter-card ${item.remaining_portions === 0 ? 'sold-out' : ''}`}>
            <div className="menu-counter-title">{item.dish_name}</div>
            <div className="menu-counter-allergens">
              {sortAlpha(item.allergens || [], (row) => row.name).map((allergen) => (
                <AllergenChip key={allergen.name} allergen={allergen} />
              ))}
            </div>
            <div className="stock-stepper">
              <button
                type="button"
                className="stock-stepper-btn minus"
                onClick={() => adjust(item, -1)}
                disabled={item.remaining_portions <= 0}
                aria-label={`Decrease ${item.dish_name} count`}
              >
                -
              </button>
              <input
                className="stock-stepper-value stock-stepper-value-readonly"
                value={item.remaining_portions}
                readOnly
                style={{ color: item.remaining_portions === 0 ? 'var(--red)' : 'inherit' }}
                aria-label={`${item.dish_name} remaining portions`}
              />
              <button
                type="button"
                className="stock-stepper-btn plus"
                onClick={() => adjust(item, 1)}
                aria-label={`Increase ${item.dish_name} count`}
              >
                +
              </button>
            </div>
            <div className="menu-counter-status">{item.remaining_portions === 0 ? 'Sold out' : 'Portions left'}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
