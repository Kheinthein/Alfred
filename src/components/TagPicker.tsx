'use client';

import { tagService } from '@shared/services/tagService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Tag, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface TagPickerProps {
  readonly documentId: string;
}

const TAG_COLORS = [
  '#6B46C1',
  '#3B82F6',
  '#06B6D4',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#EC4899',
  '#8B5CF6',
];

export function TagPicker({ documentId }: TagPickerProps): React.JSX.Element {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.list(),
  });

  const { data: docTags = [] } = useQuery({
    queryKey: ['document-tags', documentId],
    queryFn: () => tagService.getDocumentTags(documentId),
  });

  const toggleTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const current = docTags.map((t) => t.id);
      const next = current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId];
      return tagService.setDocumentTags(documentId, next);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['document-tags', documentId],
      });
    },
  });

  const createTagMutation = useMutation({
    mutationFn: () =>
      tagService.create({ name: newTagName.trim(), color: newTagColor }),
    onSuccess: (newTag) => {
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      // Ajouter automatiquement le nouveau tag au document
      const current = docTags.map((t) => t.id);
      void tagService
        .setDocumentTags(documentId, [...current, newTag.id])
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: ['document-tags', documentId],
          });
        });
      setNewTagName('');
      setShowCreate(false);
    },
  });

  // Fermer au clic extérieur (en excluant le portal lui-même)
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = buttonRef.current
        ?.closest('[data-tag-picker]')
        ?.contains(target);
      const insidePortal = portalRef.current?.contains(target);
      if (!insideTrigger && !insidePortal) {
        setOpen(false);
      }
    };
    globalThis.document.addEventListener('mousedown', handler);
    return () => globalThis.document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" data-tag-picker="">
      {/* Tags actuels + bouton */}
      <div className="flex flex-wrap items-center gap-1.5">
        {docTags.map((tag) => (
          <span
            key={tag.id}
            className="font-interface inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color ?? '#6B46C1' }}
          >
            {tag.name}
          </span>
        ))}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-interface inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-border px-2.5 py-0.5 text-xs text-neutral-textSecondary transition-colors hover:border-ai-primary hover:text-ai-primary"
        >
          <Tag size={11} />
          {docTags.length === 0 ? 'Ajouter un tag' : 'Modifier'}
        </button>
      </div>

      {/* Dropdown */}
      {open &&
        createPortal(
          <div
            ref={portalRef}
            className="fixed z-50"
            style={{
              top: (buttonRef.current?.getBoundingClientRect().bottom ?? 0) + 6,
              left: buttonRef.current?.getBoundingClientRect().left ?? 0,
            }}
          >
            <div className="font-interface w-64 rounded-lg border border-neutral-border bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-border/50 px-3 py-2">
                <span className="text-xs font-semibold text-neutral-textSecondary">
                  Tags
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                >
                  <X size={13} className="text-neutral-textSecondary" />
                </button>
              </div>

              {/* Liste des tags */}
              <div className="max-h-48 overflow-y-auto py-1">
                {allTags.length === 0 && !showCreate && (
                  <p className="px-3 py-4 text-center text-xs text-neutral-textSecondary">
                    Aucun tag. Créez-en un !
                  </p>
                )}
                {allTags.map((tag) => {
                  const selected = docTags.some((t) => t.id === tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTagMutation.mutate(tag.id)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-bg"
                    >
                      <span
                        className="h-3 w-3 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: tag.color ?? '#6B46C1' }}
                      />
                      <span className="flex-1 text-neutral-text">
                        {tag.name}
                      </span>
                      {selected && (
                        <span className="text-xs font-bold text-ai-primary">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Créer un tag */}
              {showCreate ? (
                <div className="border-t border-neutral-border/50 p-3 space-y-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nom du tag"
                    autoFocus
                    maxLength={50}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagName.trim())
                        createTagMutation.mutate();
                      if (e.key === 'Escape') setShowCreate(false);
                    }}
                    className="w-full rounded-md border border-neutral-border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ai-primary"
                  />
                  <div className="flex gap-1.5">
                    {TAG_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewTagColor(c)}
                        className="h-5 w-5 rounded-full transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          outline:
                            newTagColor === c ? `2px solid ${c}` : 'none',
                          outlineOffset: '2px',
                        }}
                        aria-label={`Couleur ${c}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded px-2.5 py-1 text-xs text-neutral-textSecondary hover:bg-neutral-bg"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={
                        !newTagName.trim() || createTagMutation.isPending
                      }
                      onClick={() => createTagMutation.mutate()}
                      className="rounded bg-ai-primary px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                    >
                      Créer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-t border-neutral-border/50 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="flex w-full items-center gap-1.5 text-xs text-ai-primary transition-colors hover:text-ai-primary/80"
                  >
                    <Plus size={12} />
                    Créer un nouveau tag
                  </button>
                </div>
              )}
            </div>
          </div>,
          globalThis.document.body
        )}
    </div>
  );
}
