'use client';

import { apiClient } from '@shared/services/apiClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, History, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface VersionSummary {
  version: number;
  title: string;
  wordCount: number;
  createdAt: string;
}

interface VersionsResponse {
  currentVersion: number;
  versions: VersionSummary[];
}

interface VersionHistoryProps {
  readonly documentId: string;
  readonly onRestored: (title: string, content: string) => void;
}

async function fetchVersions(documentId: string): Promise<VersionsResponse> {
  const { data } = await apiClient.get<{
    success: boolean;
    data: VersionsResponse;
  }>(`/documents/${documentId}/versions`);
  return data.data;
}

export function VersionHistory({
  documentId,
  onRestored,
}: VersionHistoryProps): React.JSX.Element {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmVersion, setConfirmVersion] = useState<VersionSummary | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: ['versions', documentId],
    queryFn: () => fetchVersions(documentId),
    enabled: open,
  });

  const restoreMutation = useMutation({
    mutationFn: async (version: number) => {
      const { data: res } = await apiClient.post<{
        success: boolean;
        data: { document: { title: string; content: string; version: number } };
      }>(`/documents/${documentId}/versions`, { version });
      return res.data.document;
    },
    onSuccess: (doc) => {
      onRestored(doc.title, doc.content);
      setConfirmVersion(null);
      setOpen(false);
      void queryClient.invalidateQueries({
        queryKey: ['versions', documentId],
      });
    },
  });

  const versions = data?.versions ?? [];
  const currentVersion = data?.currentVersion ?? 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-interface flex items-center gap-1.5 rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 focus:outline-none focus:ring-2 focus:ring-neutral-border"
        title="Historique des versions"
      >
        <History size={13} />v{currentVersion > 0 ? currentVersion : '–'}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
            <div className="font-interface w-full max-w-md rounded-t-2xl border border-neutral-border bg-white shadow-xl sm:rounded-2xl">
              <div className="flex items-center justify-between border-b border-neutral-border/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-ai-primary" />
                  <h3 className="font-semibold text-neutral-text">
                    Historique des versions
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-xs text-neutral-textSecondary hover:bg-neutral-bg"
                >
                  Fermer
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {isLoading && (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-ai-primary border-t-transparent" />
                  </div>
                )}
                {!isLoading && versions.length === 0 && (
                  <div className="py-10 text-center">
                    <History
                      size={24}
                      className="mx-auto mb-2 text-neutral-border"
                    />
                    <p className="text-sm text-neutral-textSecondary">
                      Aucune version sauvegardée pour l&apos;instant.
                    </p>
                    <p className="mt-1 text-xs text-neutral-textSecondary/60">
                      Les versions sont créées automatiquement lors des
                      modifications.
                    </p>
                  </div>
                )}
                {!isLoading && versions.length > 0 && (
                  <ul className="divide-y divide-neutral-border/30">
                    {versions.map((v) => {
                      const isCurrent = v.version === currentVersion;
                      return (
                        <li
                          key={v.version}
                          className="flex items-center justify-between gap-3 px-5 py-3.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-interface text-xs font-semibold text-ai-primary">
                                v{v.version}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full bg-ai-primary/10 px-1.5 py-0.5 text-xs text-ai-primary">
                                  actuelle
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-sm font-medium text-neutral-text">
                              {v.title}
                            </p>
                            <p className="text-xs text-neutral-textSecondary">
                              {v.wordCount} mots ·{' '}
                              {format(
                                new Date(v.createdAt),
                                'dd MMM yyyy HH:mm',
                                { locale: fr }
                              )}
                            </p>
                          </div>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => setConfirmVersion(v)}
                              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-ai-primary/40 bg-ai-primary/5 px-2.5 py-1.5 text-xs font-medium text-ai-primary transition-all hover:bg-ai-primary/10"
                            >
                              <RotateCcw size={11} />
                              {'Restaurer'}
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>,
          globalThis.document.body
        )}

      {/* Confirmation restauration */}
      {confirmVersion &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
            <div className="font-interface w-full max-w-sm rounded-xl border border-neutral-border bg-white p-5 shadow-xl">
              <h4 className="font-semibold text-neutral-text">
                Restaurer la version {confirmVersion.version} ?
              </h4>
              <p className="mt-2 text-sm text-neutral-textSecondary">
                Le contenu actuel sera sauvegardé en tant que nouvelle version
                avant la restauration.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmVersion(null)}
                  className="rounded-lg border border-neutral-border px-3 py-2 text-sm text-neutral-text hover:bg-neutral-bg"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={restoreMutation.isPending}
                  onClick={() => restoreMutation.mutate(confirmVersion.version)}
                  className="rounded-lg bg-ai-primary px-3 py-2 text-sm font-semibold text-white hover:bg-ai-primary/90 disabled:opacity-50"
                >
                  {restoreMutation.isPending ? 'Restauration...' : 'Restaurer'}
                </button>
              </div>
            </div>
          </div>,
          globalThis.document.body
        )}
    </>
  );
}
