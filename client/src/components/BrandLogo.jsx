export default function BrandLogo({ centered = false }) {
  return (
    <div className={`sidebar-logo brand-logo ${centered ? 'brand-logo-centered' : ''}`}>
      <div className="logo-icon" aria-hidden="true">
        <div className="logo-monogram">
          <span className="logo-glyph logo-glyph-c">c</span>
          <span className="logo-glyph logo-glyph-s">s</span>
        </div>
      </div>
      <div className="logo-text">
        <span className="logo-text-chef">Chef</span>
        <span className="logo-text-station">Station</span>
      </div>
    </div>
  );
}
