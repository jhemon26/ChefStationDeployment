export default function BrandLogo({ centered = false }) {
  return (
    <div className={`sidebar-logo brand-logo ${centered ? 'brand-logo-centered' : ''}`}>
      <div className="logo-icon" aria-hidden="true">
        <span className="logo-badge-copy">CS</span>
      </div>
      <div className="logo-text">
        <span className="logo-text-chef">Chef</span>
        <span className="logo-text-station">Station</span>
      </div>
    </div>
  );
}
