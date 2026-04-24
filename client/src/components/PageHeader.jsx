import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PageHeader({ title, subtitle, actions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const fallbackPath = user?.role === 'super_admin' ? '/super' : '/dashboard';
  const showBack = location.pathname !== fallbackPath;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath);
  };

  return (
    <div className="page-header">
      <div className="page-header-main">
        {showBack ? (
          <button type="button" className="btn btn-ghost page-back-btn" onClick={handleBack}>
            <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
            <span>Back</span>
          </button>
        ) : null}
        <h1>{title}</h1>
        {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="toolbar">{actions}</div> : null}
    </div>
  );
}
