import { ReactNode } from 'react';

interface ConfirmDialogProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="font-interface w-full max-w-md rounded-lg bg-ai-bgPure border border-neutral-border p-6 shadow-parchment-lg">
        <h3 className="text-lg font-semibold text-neutral-text">{title}</h3>
        <div className="mt-2 text-sm text-neutral-textSecondary">{message}</div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md border border-neutral-border px-4 py-2 text-sm font-semibold text-neutral-text transition-colors hover:bg-neutral-bg"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-action-error px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-action-error/90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
