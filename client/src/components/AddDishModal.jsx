import React, { useEffect, useState } from 'react';
import { ALLERGENS, MINOR_ALLERGENS } from '../utils/allergens';
import AddAllergenModal from './AddAllergenModal';
import AllergenChip from './AllergenChip';

export default function AddDishModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', course: '', ingredients: '', allergens: [] });
  // UK allergens always first, then minor, then custom
  const [ukAllergens] = useState([...ALLERGENS]);
  const [minorAllergens, setMinorAllergens] = useState(MINOR_ALLERGENS || []);
  const [customAllergens, setCustomAllergens] = useState([]);
  const [showAddAllergen, setShowAddAllergen] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({ name: '', course: '', ingredients: '', allergens: [] });
      setCustomAllergens([]);
      setShowAddAllergen(false);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', course: '', ingredients: '', allergens: [] });
  };

  const handleAllergenTap = (allergen, type = 'uk') => {
    setForm((prev) => {
      const exists = prev.allergens.includes(allergen);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((a) => a !== allergen)
          : [...prev.allergens, allergen],
      };
    });
  };

  const handleAddAllergen = (newAllergen) => {
    if (ukAllergens.includes(newAllergen)) {
      handleAllergenTap(newAllergen, 'uk');
    } else if (minorAllergens.includes(newAllergen)) {
      handleAllergenTap(newAllergen, 'minor');
    } else {
      setCustomAllergens((prev) => [...prev, newAllergen]);
      handleAllergenTap(newAllergen, 'custom');
    }
    setShowAddAllergen(false);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="section-title">Add Menu Dish</h2>
        <form className="stack food-list-modal-form" onSubmit={handleSubmit}>
          <div className="inline-grid two">
            <input
              placeholder="Dish name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Course type"
              value={form.course}
              onChange={e => setForm({ ...form, course: e.target.value })}
              required
            />
          </div>
          <textarea
            className="food-list-textarea"
            placeholder="Ingredients"
            value={form.ingredients}
            onChange={e => setForm({ ...form, ingredients: e.target.value })}
            required
          />
          <label className="food-list-modal-label">Allergens</label>
          <div className="allergen-chip-list">
            {ukAllergens.map((allergen) => (
              <span
                key={allergen}
                className={`allergen-chip selectable${form.allergens.includes(allergen) ? ' selected' : ''}`}
                onClick={() => handleAllergenTap(allergen, 'uk')}
                tabIndex={0}
                role="button"
                aria-pressed={form.allergens.includes(allergen)}
              >
                <AllergenChip allergen={allergen} />
              </span>
            ))}
          </div>
          {minorAllergens.length > 0 && (
            <>
              <label className="food-list-modal-label">More Allergens</label>
              <div className="allergen-chip-list">
                {minorAllergens.map((allergen) => (
                  <span
                    key={allergen}
                    className={`allergen-chip selectable${form.allergens.includes(allergen) ? ' selected' : ''}`}
                    onClick={() => handleAllergenTap(allergen, 'minor')}
                    tabIndex={0}
                    role="button"
                    aria-pressed={form.allergens.includes(allergen)}
                  >
                    <AllergenChip allergen={allergen} />
                  </span>
                ))}
              </div>
            </>
          )}
          {customAllergens.length > 0 && (
            <>
              <label className="food-list-modal-label">Custom Allergens</label>
              <div className="allergen-chip-list">
                {customAllergens.map((allergen) => (
                  <span
                    key={allergen}
                    className={`allergen-chip selectable${form.allergens.includes(allergen) ? ' selected' : ''}`}
                    onClick={() => handleAllergenTap(allergen, 'custom')}
                    tabIndex={0}
                    role="button"
                    aria-pressed={form.allergens.includes(allergen)}
                  >
                    <AllergenChip allergen={allergen} />
                  </span>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            className="btn btn-blue"
            onClick={() => setShowAddAllergen(true)}
          >
            + Add Allergen
          </button>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Dish</button>
          </div>
        </form>
        <AddAllergenModal open={showAddAllergen} onClose={() => setShowAddAllergen(false)} onAdd={handleAddAllergen} />
      </div>
    </div>
  );
}
