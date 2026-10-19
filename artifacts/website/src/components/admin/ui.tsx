import type { ReactNode } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

/* ─── Page shell: consistent max-width, header with count + action ─── */

export function AdminPage({ title, count, countLabel, actionLabel, onAction, actionTestId, children }: {
  title: string;
  count?: number;
  countLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestId?: string;
  children: ReactNode;
}) {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-baseline gap-3 min-w-0">
          <h1 className="text-2xl md:text-3xl font-serif text-paper truncate">{title}</h1>
          {count !== undefined && (
            <span className="text-fog text-sm shrink-0">{count} {countLabel ?? (count === 1 ? "item" : "items")}</span>
          )}
        </div>
        {actionLabel && onAction && (
          <button onClick={onAction} data-testid={actionTestId} className="flex items-center gap-2 shrink-0 bg-brand text-ink px-5 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors">
            <Plus size={16} /> {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── Standard list row with edit/delete icon actions ─── */

export function AdminRow({ testId, title, meta, published, onEdit, editTestId, onDelete, deleteTestId, deleteLabel = "Delete", children }: {
  testId: string;
  title: ReactNode;
  meta?: ReactNode;
  published?: boolean;
  onEdit?: () => void;
  editTestId?: string;
  onDelete?: () => void;
  deleteTestId?: string;
  deleteLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div data-testid={testId} className="bg-panel border border-line px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-paper truncate">{title}</h3>
          {(meta !== undefined || published !== undefined) && (
            <p className="text-fog text-xs mt-1 truncate">
              {meta}
              {meta !== undefined && published !== undefined ? " · " : ""}
              {published !== undefined && (published
                ? <span className="text-green-400">Published</span>
                : <span className="text-red-400">Draft</span>)}
            </p>
          )}
          {children}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0">
            {onEdit && <button onClick={onEdit} data-testid={editTestId} aria-label="Edit" title="Edit" className="text-fog hover:text-brand transition-colors p-2"><Pencil size={15} /></button>}
            {onDelete && <button onClick={onDelete} data-testid={deleteTestId} aria-label={deleteLabel} title={deleteLabel} className="text-fog hover:text-red-400 transition-colors p-2"><Trash2 size={15} /></button>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Two-column grid for compact lists (halves scroll on wide screens) ─── */

export function AdminGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div>;
}

/* ─── Loading / empty states ─── */

export function AdminLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4].slice(0, rows).map(i => <div key={i} className="h-16 bg-panel border border-line" />)}
    </div>
  );
}

export function AdminEmpty({ message }: { message: string }) {
  return <div className="border border-line p-12 text-center text-fog">{message}</div>;
}

/* ─── Modal shell ─── */

export function AdminModal({ title, onClose, onSave, saveLabel = "Save", saveTestId, saving, children, wide }: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  saveTestId?: string;
  saving?: boolean;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-panel border border-line p-6 md:p-8 w-full ${wide ? "max-w-3xl" : "max-w-xl"} max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-paper">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-fog hover:text-paper"><X size={20} /></button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex gap-4 mt-8">
          <button onClick={onSave} disabled={saving} data-testid={saveTestId} className="bg-brand text-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-brand-deep transition-colors disabled:opacity-50">
            {saving ? "Saving..." : saveLabel}
          </button>
          <button onClick={onClose} className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirm dialog (replaces native confirm()) ─── */

export function ConfirmDialog({ title, message, confirmLabel = "Delete", onConfirm, onCancel, pending, testId }: {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  pending?: boolean;
  testId?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-panel border border-line p-6 md:p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-serif text-paper mb-3">{title}</h2>
        {message && <p className="text-fog text-sm leading-relaxed mb-6">{message}</p>}
        <div className="flex gap-4">
          <button onClick={onConfirm} disabled={pending} data-testid={testId} className="bg-red-500/90 hover:bg-red-500 text-white px-8 py-3 text-sm font-semibold uppercase tracking-widest transition-colors disabled:opacity-50">
            {pending ? "Working..." : confirmLabel}
          </button>
          <button onClick={onCancel} className="border border-line text-fog px-8 py-3 text-sm hover:border-brand transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Form fields ─── */

export function AdminField({ label, value, onChange, type = "text", textarea, rows = 3, placeholder }: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-fog text-xs uppercase tracking-widest mb-2">{label}</label>
      {textarea ? (
        <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none" />
      )}
    </div>
  );
}

export function AdminSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="block text-fog text-xs uppercase tracking-widest mb-2">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-ink border border-line text-paper px-3 py-2 text-sm focus:border-brand focus:outline-none">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function AdminCheck({ label, checked, onChange, id }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 accent-brand" />
      <label htmlFor={id} className="text-fog text-sm">{label}</label>
    </div>
  );
}

/* Shared error-message extractor for mutations */
export function mutationError(err: unknown): string {
  return (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Operation failed";
}
