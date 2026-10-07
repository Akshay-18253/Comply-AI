import { Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      <p className="text-surface-400 text-sm">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-red-500/15 flex items-center justify-center">
        <span className="text-3xl">⚠️</span>
      </div>
      <p className="text-surface-300 text-center max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-800/60 flex items-center justify-center">
          <Icon className="w-8 h-8 text-surface-500" />
        </div>
      )}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-surface-200">{title}</h3>
        <p className="text-sm text-surface-400 mt-1 max-w-md">{description}</p>
      </div>
      {action}
    </div>
  );
}

const statusTranslationMap = {
  'Completed': 'status_completed',
  'In Progress': 'status_in_progress',
  'Not Started': 'status_not_started',
  'Documents Pending': 'status_documents_pending',
  'Ready to File': 'status_ready_to_file',
  'Overdue': 'status_overdue',
  'Verified': 'status_verified',
  'Needs Review': 'status_needs_review',
  'Running': 'status_running',
  'Waiting': 'status_waiting',
  'Failed': 'status_failed',
  'Pending': 'status_waiting',
  'Active': 'status_verified',
};

const priorityTranslationMap = {
  'Critical': 'priority_critical',
  'High': 'priority_high',
  'Medium': 'priority_medium',
  'Low': 'priority_low',
};

export function StatusBadge({ status }) {
  let t;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch (e) {
    t = (k) => k;
  }

  const styles = {
    'Completed': 'badge-success',
    'In Progress': 'badge-info',
    'Not Started': 'badge-neutral',
    'Documents Pending': 'badge-warning',
    'Ready to File': 'badge-info',
    'Not Applicable': 'badge-neutral',
    'Needs Verification': 'badge-warning',
    'Overdue': 'badge-danger',
    'Pending': 'badge-warning',
    'Active': 'badge-success',
    'Running': 'badge-info',
    'Waiting': 'badge-neutral',
    'Failed': 'badge-danger',
    'Needs Review': 'badge-warning',
  };

  const translationKey = statusTranslationMap[status];
  const translatedText = translationKey ? t(translationKey) : status;

  return <span className={styles[status] || 'badge-neutral'}>{translatedText}</span>;
}

export function PriorityBadge({ priority }) {
  let t;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch (e) {
    t = (k) => k;
  }

  const styles = {
    Critical: 'bg-red-500/15 text-red-400 border border-red-500/20',
    High: 'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    Low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  };

  const translationKey = priorityTranslationMap[priority];
  const translatedText = translationKey ? t(translationKey) : priority;

  return (
    <span className={`badge ${styles[priority] || 'badge-neutral'}`}>
      {translatedText}
    </span>
  );
}

export function ConfidenceMeter({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-surface-700 rounded-full overflow-hidden max-w-[100px]">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-surface-400 font-medium">{pct}%</span>
    </div>
  );
}

export function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', danger = false }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="glass-card p-6 max-w-md w-full animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-surface-100">{title}</h3>
        <p className="text-surface-400 text-sm mt-2">{message}</p>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onCancel} className="btn-secondary text-sm py-2 px-4">Cancel</button>
          <button onClick={onConfirm} className={`${danger ? 'btn-danger' : 'btn-primary'} text-sm py-2 px-4`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />;
}
