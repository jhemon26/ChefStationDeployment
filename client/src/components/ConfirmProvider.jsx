import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { confirmAction, resetConfirmImplementation, setConfirmImplementation } from '../utils/confirmAction';

const ConfirmContext = createContext({ confirm: confirmAction });

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    setConfirmImplementation((message, options = {}) =>
      new Promise((resolve) => {
        setDialog({
          message,
          title: options.title || 'Warning',
          confirmLabel: options.confirmLabel || 'Delete',
          cancelLabel: options.cancelLabel || 'Cancel',
          onResolve: resolve,
        });
      })
    );

    return () => {
      resetConfirmImplementation();
    };
  }, []);

  const value = useMemo(
    () => ({
      confirm: confirmAction,
    }),
    []
  );

  const close = (result) => {
    if (!dialog) return;
    dialog.onResolve(result);
    setDialog(null);
  };

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {dialog ? (
        <div className="confirm-overlay" onClick={() => close(false)}>
          <div className="confirm-dialog" onClick={(event) => event.stopPropagation()}>
            <div className="confirm-badge">Delete</div>
            <h2 className="confirm-title">{dialog.title}</h2>
            <p className="confirm-message">{dialog.message}</p>
            <p className="confirm-hint">This action may remove data permanently. Please confirm before continuing.</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-ghost" onClick={() => close(false)}>
                {dialog.cancelLabel}
              </button>
              <button type="button" className="btn confirm-danger-btn" onClick={() => close(true)}>
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
