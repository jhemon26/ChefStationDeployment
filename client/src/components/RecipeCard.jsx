import AllergenChip from './AllergenChip';

export default function RecipeCard({ recipe, onOpen }) {
  return (
    <button type="button" className="recipe-card" onClick={() => onOpen(recipe)} style={{ textAlign: 'left', width: '100%' }}>
      <div className="recipe-img">
        {recipe.photo_url ? (
          <img src={recipe.photo_url} alt={recipe.dish_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg><use href="#ico-camera" /></svg>
        )}
      </div>
      <div className="recipe-body">
        <div className="name">{recipe.dish_name}</div>
        <div className="meta">{recipe.section || 'N/A'}</div>
        <div style={{ marginTop: 6 }}>
          {(recipe.allergens || []).map((allergen) => (
            <AllergenChip key={allergen.name} allergen={allergen} />
          ))}
        </div>
      </div>
    </button>
  );
}
