import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import AddAllergenModal from '../components/AddAllergenModal';
import AllergenChip from '../components/AllergenChip';
import PageHeader from '../components/PageHeader';
import RecipeCard from '../components/RecipeCard';
import RecipeModal from '../components/RecipeModal';
import { createRecipe, deleteRecipe, listRecipes } from '../services/recipeService';
import { ALLERGENS, MINOR_ALLERGENS } from '../utils/allergens';
import { sortAlpha } from '../utils/sortHelpers';
import { confirmAction } from '../utils/confirmAction';

export default function RecipeBookPage() {
  const builtInAllergens = new Set([...ALLERGENS, ...MINOR_ALLERGENS].map((item) => item.toLowerCase()));
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [customAllergens, setCustomAllergens] = useState([]);
  const [showAddAllergen, setShowAddAllergen] = useState(false);
  const [form, setForm] = useState({
    dish_name: '',
    dish_section: '',
    allergens: [],
    ingredients: '',
    steps: '',
    notes: '',
    photo: null
  });

  const load = async () => {
    const { data: recipeRows } = await listRecipes();
    setRecipes(sortAlpha(recipeRows, (item) => item.dish_name));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.dish_name.trim()) {
      setError('Enter a dish name.');
      return;
    }

    try {
      const payload = new FormData();
      payload.append('dish_name', form.dish_name.trim());
      if (form.dish_section) {
        payload.append('section', form.dish_section.trim());
      }
      payload.append(
        'allergens',
        JSON.stringify(
          form.allergens.map((name) => ({
            name,
            is_custom: !builtInAllergens.has(String(name).toLowerCase()),
          }))
        )
      );
      Object.entries(form).forEach(([key, value]) => {
        if (['dish_name', 'dish_section', 'allergens'].includes(key)) return;
        if (value !== '' && value !== null) payload.append(key, value);
      });
      await createRecipe(payload);
      setForm({
        dish_name: '',
        dish_section: '',
        allergens: [],
        ingredients: '',
        steps: '',
        notes: '',
        photo: null
      });
      setCustomAllergens([]);
      await load();
    } catch (err) {
      const details = err.response?.data?.details;
      const message =
        Array.isArray(details) && details.length > 0
          ? details.map((item) => item.msg).join(', ')
          : err.response?.data?.error || 'Could not save recipe';
      setError(message);
    }
  };

  const toggleAllergen = (allergen) => {
    setForm((prev) => {
      const exists = prev.allergens.includes(allergen);
      return {
        ...prev,
        allergens: exists ? prev.allergens.filter((item) => item !== allergen) : [...prev.allergens, allergen],
      };
    });
  };

  const handleAddAllergen = (allergen) => {
    const clean = allergen.trim();
    if (!clean) return;
    if (!builtInAllergens.has(clean.toLowerCase())) {
      setCustomAllergens((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    }
    toggleAllergen(clean);
    setShowAddAllergen(false);
  };

  return (
    <AppShell>
      <PageHeader title="Recipe Book" subtitle="Dish methods, photos, and sections" />
      <form className="card stack recipe-form" onSubmit={submit}>
        <div className="inline-grid two">
          <div>
            <label className="form-label">Dish Name</label>
            <input
              type="text"
              placeholder=""
              value={form.dish_name}
              onChange={(e) => setForm({ ...form, dish_name: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Course / Section</label>
            <input
              type="text"
              placeholder="e.g. Starter, Main, Dessert"
              value={form.dish_section}
              onChange={(e) => setForm({ ...form, dish_section: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="form-label">Allergens</label>
          <div className="allergen-chip-list">
            {[...ALLERGENS, ...MINOR_ALLERGENS, ...customAllergens].map((allergen) => (
              <span
                key={allergen}
                className={`allergen-chip selectable${form.allergens.includes(allergen) ? ' selected' : ''}`}
                onClick={() => toggleAllergen(allergen)}
                tabIndex={0}
                role="button"
                aria-pressed={form.allergens.includes(allergen)}
              >
                <AllergenChip allergen={allergen} />
              </span>
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setShowAddAllergen(true)}>
            + Add Allergen
          </button>
        </div>
        <textarea
          className="recipe-textarea"
          placeholder="Ingredients list"
          value={form.ingredients}
          onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
        />
        <textarea
          className="recipe-textarea"
          placeholder="Instructions"
          value={form.steps}
          onChange={(e) => setForm({ ...form, steps: e.target.value })}
        />
        <textarea
          className="recipe-textarea"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
        {error ? <div className="error-text">{error}</div> : null}
        <button className="btn btn-primary" type="submit">Add Recipe</button>
      </form>
      <div style={{ height: 16 }} />
      <div className="recipe-grid">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="stack">
            <RecipeCard recipe={recipe} onOpen={setSelected} />
            <button type="button" className="btn btn-danger" onClick={async () => {
              if (!(await confirmAction(`Delete recipe "${recipe.dish_name}"?`, { confirmLabel: 'Delete Recipe' }))) return;
              deleteRecipe(recipe.id).then(load);
            }}>Delete</button>
          </div>
        ))}
      </div>
      <RecipeModal recipe={selected} onClose={() => setSelected(null)} />
      <AddAllergenModal open={showAddAllergen} onClose={() => setShowAddAllergen(false)} onAdd={handleAddAllergen} />
    </AppShell>
  );
}
