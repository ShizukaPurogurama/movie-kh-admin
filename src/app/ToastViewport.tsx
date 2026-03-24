import type { ToastItem } from './AdminDataProvider';

export default function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          <div className="toast-copy">
            <span className="toast-label">
              {toast.tone === 'error' ? 'Error' : toast.tone === 'success' ? 'Success' : 'Notice'}
            </span>
            <p>{toast.message}</p>
          </div>
          <button
            className="toast-close"
            type="button"
            aria-label="Dismiss notification"
            onClick={() => onDismiss(toast.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
