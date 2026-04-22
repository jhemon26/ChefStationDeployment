import { useEffect, useState } from 'react';
import { confirmAction } from '../utils/confirmAction';
import { getStockPresentation } from '../utils/stockLevels';

export default function StockRow({ item, onChange, onManualChange, onDelete }) {
  const [value, setValue] = useState(item.quantity);
  const stockState = getStockPresentation(item);
  const meta = [item.category, item.unit].filter(Boolean).join(' · ');
  const perItemDetail = item.item_detail || '';

  useEffect(() => {
    setValue(item.quantity);
  }, [item.quantity]);

  return (
    <div className="card stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div>{item.name}</div>
          <div className="helper-text">{meta}</div>
          {perItemDetail ? <div className="stock-per-item">{perItemDetail}</div> : null}
        </div>
        <button type="button" className="btn btn-danger" onClick={async () => {
          if (!(await confirmAction(`Delete "${item.name}"?`, { confirmLabel: 'Delete Item' }))) return;
          onDelete(item.id);
        }}>Delete</button>
      </div>
      <div className="stock-bar">
        <div className={`stock-bar-fill ${stockState.tone}`} style={{ width: `${stockState.width}%` }} />
      </div>
      <div className="stock-stepper">
        <button
          type="button"
          className="stock-stepper-btn minus"
          onClick={() => onChange(item, -1)}
          disabled={stockState.quantity <= 0}
          aria-label={`Decrease ${item.name} stock`}
        >
          -
        </button>
        <input
          className="stock-stepper-value"
          value={value}
          onFocus={(event) => event.target.select()}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => {
            setValue(item.quantity);
            onManualChange(item, Math.max(0, Number(value) || 0));
          }}
        />
        <button
          type="button"
          className="stock-stepper-btn plus"
          onClick={() => onChange(item, 1)}
          aria-label={`Increase ${item.name} stock`}
        >
          +
        </button>
      </div>
    </div>
  );
}
