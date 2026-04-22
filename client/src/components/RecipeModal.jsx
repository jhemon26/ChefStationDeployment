import AllergenChip from './AllergenChip';

export default function RecipeModal({ recipe, onClose }) {
  if (!recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
            <svg><use href="#ico-x" /></svg>
        </button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 4 }}>{recipe.dish_name}</h2>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {recipe.section || 'N/A'} section · {recipe.total_steps || 0} steps · {recipe.prep_time_mins || 0} min
        </p>
        <div style={{ height: 180, background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden' }}>
          {recipe.photo_url ? <img src={recipe.photo_url} alt={recipe.dish_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg style={{ width: 40, height: 40, opacity: 0.3, color: 'var(--text-muted)' }}><use href="#ico-camera" /></svg>}
        </div>
        <div className="section-title">Allergens</div>
        <div style={{ marginBottom: 16 }}>
          {(recipe.allergens || []).map((allergen) => (
            <AllergenChip key={allergen.name} allergen={allergen} />
          ))}
        </div>
        <div className="section-title">Ingredients</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
          {(recipe.ingredients || '').split(',').map((item) => item.trim()).filter(Boolean).sort().join(' · ') || 'N/A'}
        </div>
        {recipe.notes ? (
          <>
            <div className="section-title">Notes</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
              {recipe.notes}
            </div>
          </>
        ) : null}
        <div className="section-title">Method</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {(recipe.steps || '')
            .split('\n')
            .map((step) => step.trim())
            .filter(Boolean)
            .map((step, index) => (
              <p key={`${recipe.id}-${index}`} style={{ marginBottom: 8 }}>
                <strong style={{ color: 'var(--green)' }}>{index + 1}.</strong>
                {' '}
                {step}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
}
