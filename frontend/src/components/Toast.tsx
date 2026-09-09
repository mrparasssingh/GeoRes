import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import type { ToastMessage } from '../hooks/useToast'

interface ToastContainerProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

const icons = {
  success: <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />,
  error: <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />,
  warning: <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />,
  info: <Info size={16} style={{ color: '#0d9490', flexShrink: 0 }} />,
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {icons[toast.type]}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm" style={{ color: '#0f1233' }}>{toast.title}</p>
            {toast.message && (
              <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 ml-1 opacity-50 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X size={14} style={{ color: '#0f1233' }} />
          </button>
        </div>
      ))}
    </div>
  )
}
