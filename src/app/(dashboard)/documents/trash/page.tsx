'use client';

import { ConfirmDialog } from '@components/ConfirmDialog';
import { Spinner } from '@components/Spinner';
import { documentService } from '@shared/services/documentService';
import { DocumentDTO } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function TrashPage(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [purgeTarget, setPurgeTarget] = useState<DocumentDTO | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents-trash'],
    queryFn: () => documentService.listTrash(),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => documentService.restore(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents-trash'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const purgeMutation = useMutation({
    mutationFn: (id: string) => documentService.purge(id),
    onSuccess: () => {
      setPurgeTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['documents-trash'] });
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* En-tête */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/documents"
          className="font-interface flex items-center gap-1.5 text-sm text-neutral-textSecondary transition-colors hover:text-parchment-text"
        >
          <ArrowLeft size={16} />
          Retour aux documents
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="font-writing text-2xl font-bold text-parchment-text">
          Corbeille
        </h1>
        <p className="font-interface mt-1 text-sm text-neutral-textSecondary">
          Les documents supprimés peuvent être restaurés ou supprimés
          définitivement.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-border p-12 text-center">
          <Trash2 size={32} className="mx-auto mb-3 text-neutral-border" />
          <p className="font-interface text-neutral-textSecondary">
            La corbeille est vide.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="scroll-parchment flex items-center justify-between gap-4 rounded-lg p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-writing truncate font-semibold text-parchment-text">
                  {doc.title}
                </p>
                <p className="font-interface mt-0.5 text-xs text-neutral-textSecondary">
                  {doc.style.name} · {doc.wordCount} mots · supprimé le{' '}
                  {format(new Date(doc.updatedAt), 'dd MMM yyyy', {
                    locale: fr,
                  })}
                </p>
              </div>

              <div className="flex flex-shrink-0 gap-2">
                <button
                  onClick={() => restoreMutation.mutate(doc.id)}
                  disabled={restoreMutation.isPending}
                  title="Restaurer"
                  className="font-interface flex items-center gap-1.5 rounded-lg border border-ai-primary/40 bg-ai-primary/5 px-3 py-1.5 text-xs font-medium text-ai-primary transition-all hover:bg-ai-primary/10 hover:border-ai-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  Restaurer
                </button>
                <button
                  onClick={() => setPurgeTarget(doc)}
                  title="Supprimer définitivement"
                  className="font-interface flex items-center gap-1.5 rounded-lg border border-action-error/40 px-3 py-1.5 text-xs font-medium text-action-error transition-all hover:bg-action-error/10 hover:border-action-error"
                >
                  <Trash2 size={13} />
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {purgeTarget &&
        createPortal(
          <ConfirmDialog
            title="Supprimer définitivement ?"
            message={
              <p>
                Le document <strong>{purgeTarget.title}</strong> sera supprimé
                de façon permanente et ne pourra plus être récupéré.
              </p>
            }
            confirmLabel="Supprimer définitivement"
            cancelLabel="Annuler"
            onCancel={() => setPurgeTarget(null)}
            onConfirm={() => purgeMutation.mutate(purgeTarget.id)}
          />,
          globalThis.document.body
        )}
    </div>
  );
}
