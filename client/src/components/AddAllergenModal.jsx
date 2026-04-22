import { useState } from 'react';

export default function AddAllergenModal({ open, onClose, onAdd }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="section-title">Add Allergen</h2>
        <form className="stack" onSubmit={handleSubmit}>
          <input
            placeholder="Allergen name"
            value={value}
            onChange={e => setValue(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}
