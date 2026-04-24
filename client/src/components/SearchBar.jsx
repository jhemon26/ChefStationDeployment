export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="search-field">
      <span className="material-symbols-outlined search-icon" aria-hidden="true">search</span>
      <input className="search-input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}
