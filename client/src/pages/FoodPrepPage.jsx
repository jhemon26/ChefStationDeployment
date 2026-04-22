import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import SearchBar from '../components/SearchBar';
import AllergenChip from '../components/AllergenChip';
import AddDishModal from '../components/AddDishModal';
import { createDish, deleteDish, listDishes } from '../services/dishService';
import { ALLERGENS, MINOR_ALLERGENS } from '../utils/allergens';
import { confirmAction } from '../utils/confirmAction';
import { sortAlpha } from '../utils/sortHelpers';


export default function FoodPrepPage() {
  const builtInAllergens = new Set([...ALLERGENS, ...MINOR_ALLERGENS].map((item) => item.toLowerCase()));
  const [dishes, setDishes] = useState([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const load = async () => {
    const { data } = await listDishes();
    setDishes(sortAlpha(data.filter((item) => item.show_on_menu), (item) => item.name));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const handleAddDish = async (form) => {
    await createDish({
      ...form,
      show_on_menu: true,
      allergens: form.allergens.map((name) => ({
        name,
        is_custom: !builtInAllergens.has(String(name).toLowerCase()),
      })),
    });
    setShowAddModal(false);
    await load();
  };

  const filtered = dishes.filter((dish) => dish.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <PageHeader title="Food List" subtitle="Today's menu guide with course, ingredients, and allergens" />
      <div style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          Add Menu Dish
        </button>
      </div>
      <AddDishModal open={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddDish} />
      <div className="card stack">
        <SearchBar value={search} onChange={setSearch} placeholder="Search dishes" />
        <div className="dish-grid">
          {filtered.map((dish) => (
            <div className="card dish-card stack" key={dish.id}>
              <div className="dish-card-header">
                <div className="dish-card-title">{dish.name}</div>
                <button type="button" className="btn btn-danger dish-card-delete" onClick={async () => {
                  if (!(await confirmAction(`Delete "${dish.name}"?`, { confirmLabel: 'Delete Dish' }))) return;
                  deleteDish(dish.id).then(load);
                }}>Delete</button>
              </div>
              <div className="dish-card-course">{dish.course || 'Course not set'}</div>
              <div className="dish-ingredients">
                {(dish.ingredients || '').split(',').map((item) => item.trim()).filter(Boolean).sort().join(' · ') || 'No ingredients listed'}
              </div>
              <div className="dish-card-allergens">
                {sortAlpha(dish.allergens || [], (item) => item.name).map((allergen) => (
                  <AllergenChip key={allergen.id || allergen.name} allergen={allergen} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
