import { ConfirmDialog } from '@components/ConfirmDialog';
import { DocumentDTO } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { GripVertical } from 'lucide-react';
import Link from 'next/link';
import { HTMLAttributes, useState } from 'react';
import { createPortal } from 'react-dom';

interface DocumentCardProps {
  document: DocumentDTO;
  onDelete?: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isDeleting?: boolean;
  additionalActions?: React.ReactNode;
  compact?: boolean;
}

export function DocumentCard({
  document,
  onDelete,
  dragHandleProps,
  isDragging,
  isDeleting,
  additionalActions,
  compact = false,
}: DocumentCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      data-testid="document-card"
      data-document-id={document.id}
      data-document-title={document.title}
      className={`scroll-parchment font-writing rounded-l-xl rounded-r-md transition-all relative overflow-hidden min-w-0 ${
        compact
          ? 'p-4'
          : 'p-6 sm:p-7 hover:shadow-parchment-lg hover:scale-[1.01]'
      } ${isDragging ? 'ring-2 ring-ai-primary scale-105 z-10' : ''}`}
    >
      {!compact && (
        <>
          {/* Détails de parchemin - bords roulés */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-parchment-border/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-t from-parchment-border/20 to-transparent pointer-events-none" />

          {/* Petites imperfections de papier */}
          <div className="absolute top-8 right-12 w-1 h-1 bg-parchment-border/30 rounded-full pointer-events-none" />
          <div className="absolute top-16 left-16 w-0.5 h-0.5 bg-parchment-border/20 rounded-full pointer-events-none" />
          <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-parchment-border/25 rounded-full pointer-events-none" />
        </>
      )}

      <div className="relative z-10 flex flex-col gap-3 min-w-0">
        <div className="flex items-start gap-2 min-w-0">
          {dragHandleProps && (
            <button
              type="button"
              aria-label="Déplacer le document"
              {...dragHandleProps}
              className="mt-1 flex-shrink-0 cursor-grab text-neutral-textSecondary hover:text-parchment-text active:cursor-grabbing"
            >
              <GripVertical size={18} />
            </button>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3
              className={`font-semibold text-parchment-text break-words ${
                compact ? 'text-base' : 'text-lg sm:text-xl'
              }`}
              style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
            >
              {document.title}
            </h3>
            {!compact && (
              <>
                <p className="mt-1 text-xs text-neutral-textSecondary sm:text-sm">
                  <span className="inline-block">{document.style.name}</span>
                  <span className="mx-1.5">•</span>
                  <span className="inline-block">
                    {document.wordCount} mots
                  </span>
                  <span className="mx-1.5 hidden sm:inline">•</span>
                  <span className="block mt-0.5 sm:inline sm:mt-0">
                    version {document.version}
                  </span>
                  {document.bookId && (
                    <>
                      <span className="mx-1.5">•</span>
                      <span className="inline-block text-ai-primary">
                        Dans un livre
                      </span>
                    </>
                  )}
                </p>
                <div className="mt-2 flex-shrink-0 text-left text-xs text-neutral-textSecondary sm:text-right">
                  <p>
                    Modifié le{' '}
                    {format(new Date(document.updatedAt), 'dd MMM yyyy', {
                      locale: fr,
                    })}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {!compact && (
          <p className="line-clamp-2 text-sm text-neutral-textSecondary sm:line-clamp-3">
            {document.content}
          </p>
        )}
      </div>

      <div
        className={`flex flex-col gap-2.5 sm:flex-row sm:items-center min-w-0 ${
          compact ? 'mt-3' : 'mt-5 sm:justify-between'
        }`}
      >
        <Link
          href={`/documents/${document.id}`}
          data-testid="open-document-button"
          className={`font-interface w-full rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt text-center text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:w-auto flex-shrink-0 ${
            compact
              ? 'px-3 py-1.5 text-xs font-medium hover:scale-[1.02]'
              : 'px-5 py-2.5 text-sm font-semibold hover:scale-[1.02]'
          }`}
        >
          Ouvrir
        </Link>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center w-full sm:w-auto min-w-0">
          {additionalActions}
          {onDelete && (
            <button
              data-testid="delete-document-button"
              onClick={() => setConfirming(true)}
              disabled={isDeleting}
              className={`font-interface w-full rounded-lg border-2 border-action-error/40 text-action-error transition-all hover:bg-action-error/10 hover:border-action-error disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-action-error focus:ring-offset-2 sm:w-auto sm:ml-auto flex-shrink-0 ${
                compact
                  ? 'px-3 py-1.5 text-xs font-medium'
                  : 'px-5 py-2.5 text-sm font-semibold'
              }`}
            >
              Supprimer
            </button>
          )}
        </div>
      </div>

      {confirming &&
        onDelete &&
        createPortal(
          <ConfirmDialog
            title="Supprimer ce document ?"
            message={
              <p>
                Le document <strong>{document.title}</strong> sera
                définitivement supprimé.
              </p>
            }
            confirmLabel="Oui, supprimer"
            cancelLabel="Annuler"
            onCancel={() => setConfirming(false)}
            onConfirm={() => {
              setConfirming(false);
              onDelete(document.id);
            }}
          />,
          globalThis.document.body
        )}
    </div>
  );
}
