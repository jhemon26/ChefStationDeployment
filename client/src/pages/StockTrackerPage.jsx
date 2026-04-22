import { useEffect, useState, useRef } from 'react';
import AppShell from '../components/AppShell';
import PageHeader from '../components/PageHeader';
import StockRow from '../components/StockRow';
import {
  createStockCategory,
  createStockItem,
  deleteStockCategory,
  deleteStockItem,
  listStock,
  listStockCategories,
  updateStockItem,
} from '../services/stockService';
import { sortAlpha } from '../utils/sortHelpers';
import { confirmAction } from '../utils/confirmAction';
import { useAuth } from '../hooks/useAuth';

const titleCase = (value) =>
  String(value || '')
    .split(/\s+/)
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');

export default function StockTrackerPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');
  const [form, setForm] = useState({
    name: '',
    category: '',
    quantity: '',
    item_detail: '',
    unit: '',
    par_level: '',
    max_level: '',
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingCategoryInline, setAddingCategoryInline] = useState(false);
  const newCategoryInputRef = useRef(null);

  const load = async () => {
    const [{ data: stockRows }, { data: categoryRows }] = await Promise.all([
      listStock(),
      listStockCategories(),
    ]);
    setItems(sortAlpha(stockRows, (item) => item.name));
    const sortedCategories = sortAlpha(categoryRows, (c) => c.name);
    setCategories(sortedCategories);
    setForm((prev) => ({
      ...prev,
      category: prev.category || sortedCategories[0]?.name || '',
    }));
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const visible = items.filter(
    (item) => filter === 'All' || item.category.toLowerCase() === filter.toLowerCase()
  );

  const submitItem = async (event) => {
    event.preventDefault();
    if (!form.category) return;
    await createStockItem({
      ...form,
      quantity: Number(form.quantity),
      par_level: form.par_level ? Number(form.par_level) : null,
      max_level: form.max_level ? Number(form.max_level) : null,
    });
    setForm({
      name: '',
      category: form.category,
      quantity: '',
      item_detail: '',
      unit: '',
      par_level: '',
      max_level: '',
    });
    await load();
  };

  const saveNewCategory = async (inline = false) => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const { data } = await createStockCategory(name);
      setNewCategoryName('');
      if (inline) {
        setAddingCategoryInline(false);
        setForm((prev) => ({ ...prev, category: data.name }));
        setFilter(data.name);
      } else {
        setAddingCategory(false);
      }
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create category');
    }
  };

  const removeCategory = async (category) => {
    if (!(await confirmAction(`Remove category "${titleCase(category.name)}"?`, { confirmLabel: 'Remove' }))) return;
    try {
      await deleteStockCategory(category.id);
      if (filter.toLowerCase() === category.name.toLowerCase()) setFilter('All');
      await load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not remove category');
    }
  };

  return (
    <AppShell>
      <PageHeader title="Stock Tracker" subtitle="Manual edits, live quantity changes, and custom categories" />
      <div className="toolbar">
        <button
          type="button"
          className={`btn ${filter === 'All' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilter('All')}
        >
          All
        </button>
        {categories.map((category) => {
          const isActive = filter.toLowerCase() === category.name.toLowerCase();
          return (
            <div key={category.id} className="category-chip">
              <button
                type="button"
                className={`btn ${isActive ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilter(category.name)}
              >
                {titleCase(category.name)}
              </button>
              {isOwner && category.item_count === 0 && (
                <button
                  type="button"
                  className="btn btn-danger category-remove"
                  onClick={() => removeCategory(category)}
                  title="Remove category (only allowed when empty)"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        {!addingCategory && (
          <button type="button" className="btn btn-ghost" onClick={() => setAddingCategory(true)}>
            + Add New Type
          </button>
        )}
        {addingCategory && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveNewCategory(false);
            }}
            className="inline-category-form"
          >
            <input
              autoFocus
              placeholder="Enter a new stock type"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Save</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setAddingCategory(false);
                setNewCategoryName('');
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
      <form className="card inline-grid two" onSubmit={submitItem}>
        <input
          placeholder="Item name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {addingCategoryInline ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              ref={newCategoryInputRef}
              autoFocus
              placeholder="Enter a new stock type"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-primary" onClick={() => saveNewCategory(true)}>Add</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setAddingCategoryInline(false); setNewCategoryName(''); }}>Cancel</button>
          </div>
        ) : (
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            disabled={categories.length === 0}
          >
            {categories.length === 0 && <option value="">No categories yet</option>}
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {titleCase(c.name)}
              </option>
            ))}
          </select>
        )}
        <input
          placeholder="How many we have"
          value={form.quantity}
          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          placeholder="Amount per item"
          value={form.item_detail}
          onChange={(e) => setForm({ ...form, item_detail: e.target.value })}
        />
        <input
          placeholder="Unit type"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />
        <input
          placeholder="Minimum stock"
          value={form.par_level}
          onChange={(e) => setForm({ ...form, par_level: e.target.value })}
        />
        <input
          placeholder="Maximum stock"
          value={form.max_level}
          onChange={(e) => setForm({ ...form, max_level: e.target.value })}
        />
        <button className="btn btn-primary" type="submit" disabled={!form.category}>Add Item</button>
      </form>
      <div style={{ height: 16 }} />
      <div className="recipe-grid">
        {visible.map((item) => (
          <StockRow
            key={item.id}
            item={item}
            onChange={(row, delta) => updateStockItem(row.id, { delta }).then(load)}
            onManualChange={(row, value) => updateStockItem(row.id, { quantity: Number(value) || 0 }).then(load)}
            onDelete={(id) => deleteStockItem(id).then(load)}
          />
        ))}
      </div>
    </AppShell>
  );
}
