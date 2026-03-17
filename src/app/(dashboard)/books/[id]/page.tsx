'use client';

import { ChapterContent } from '@components/ChapterContent';
import { SortableDocumentCard } from '@components/SortableDocumentCard';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BookExportButton } from '@components/BookExportButton';
import { bookService } from '@shared/services/bookService';
import { documentService } from '@shared/services/documentService';
import { styleService } from '@shared/services/styleService';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { DocumentDTO } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function BookDetailPage() {
  const params = useParams<{ id: string }>();
  const bookId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: book, isLoading } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookService.getById(bookId),
    enabled: Boolean(bookId),
  });

  const { data: styles } = useQuery({
    queryKey: ['styles'],
    queryFn: () => styleService.list(),
  });

  const [orderedChapters, setOrderedChapters] = useState<DocumentDTO[]>(
    book?.chapters ?? []
  );

  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'success' | 'error'
  >('idle');

  useEffect(() => {
    if (book?.chapters) {
      setOrderedChapters(book.chapters);
    }
  }, [book?.chapters]);

  const reorderChaptersMutation = useMutation({
    mutationFn: async (chapterIds: string[]) => {
      setSaveStatus('saving');
      // Mettre à jour l'ordre des chapitres
      for (let i = 0; i < chapterIds.length; i++) {
        await documentService.moveToBook(chapterIds[i], bookId, i);
      }
    },
    onSuccess: () => {
      setSaveStatus('success');
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    },
    onError: () => {
      setSaveStatus('error');
      // Masquer le message d'erreur après 5 secondes
      setTimeout(() => {
        setSaveStatus('idle');
      }, 5000);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const removeFromBookMutation = useMutation({
    mutationFn: (documentId: string) =>
      documentService.moveToBook(documentId, null, null),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => documentService.remove(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const createChapterMutation = useMutation({
    mutationFn: async () => {
      // 1. Créer un nouveau document
      const defaultStyle = styles?.[0];
      if (!defaultStyle) {
        console.error('❌ Aucun style disponible');
        throw new Error('Aucun style disponible');
      }

      const chapterNumber = orderedChapters.length + 1;

      console.log('🔧 Création chapitre:', {
        title: `Chapitre ${chapterNumber}`,
        styleId: defaultStyle.id,
        styleName: defaultStyle.name,
      });

      const newDoc = await documentService.create({
        title: `Chapitre ${chapterNumber}`,
        content: '...', // Placeholder - l'utilisateur peut le remplacer
        styleId: defaultStyle.id,
      });

      console.log('✅ Document créé:', newDoc.id);

      // 2. Le lier au livre
      await documentService.moveToBook(newDoc.id, bookId, chapterNumber - 1);

      console.log('✅ Document lié au livre');

      return newDoc.id;
    },
    onSuccess: (newDocId) => {
      void queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      // Rediriger vers l'édition du nouveau chapitre
      router.push(`/documents/${newDocId}`);
    },
  });

  const importFileRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const importChapterMutation = useMutation({
    mutationFn: async (file: File) => {
      const defaultStyle = styles?.[0];
      if (!defaultStyle) throw new Error('Aucun style disponible');

      const text = await file.text();

      // Extraire le titre et le contenu selon le format
      let title: string;
      let content: string;

      if (file.name.endsWith('.md')) {
        // Premier titre markdown comme titre, reste comme contenu
        const firstHeading = text.match(/^#{1,2}\s+(.+)$/m);
        title = firstHeading
          ? firstHeading[1].trim()
          : file.name.replace(/\.md$/, '');
        // Retirer la première ligne de titre si présente
        content = firstHeading
          ? text.replace(firstHeading[0], '').trim()
          : text.trim();
      } else {
        // .txt : première ligne non vide comme titre
        const lines = text
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        title = lines[0] ?? file.name.replace(/\.txt$/, '');
        // Retirer la ligne de titre et les séparateurs éventuels (===, ---)
        const bodyLines = lines.slice(1).filter((l) => !/^[=-]{3,}$/.test(l));
        content = bodyLines.join('\n').trim();
      }

      if (!content || content.length < 3) {
        throw new Error('Le fichier semble vide ou trop court.');
      }
      if (title.length > 200) {
        title = title.substring(0, 200);
      }

      const newDoc = await documentService.create({
        title,
        content: content.substring(0, 100000),
        styleId: defaultStyle.id,
      });

      const chapterOrder = orderedChapters.length;
      await documentService.moveToBook(newDoc.id, bookId, chapterOrder);
      return newDoc;
    },
    onSuccess: (newDoc) => {
      setImportError(null);
      void queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      router.push(`/documents/${newDoc.id}`);
    },
    onError: (error: unknown) => {
      setImportError(
        error instanceof Error ? error.message : "Erreur lors de l'import"
      );
    },
  });

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Réinitialiser l'input pour permettre de re-sélectionner le même fichier
    e.target.value = '';
    importChapterMutation.mutate(file);
  };

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedChapters.findIndex(
      (chapter) => chapter.id === active.id
    );
    const newIndex = orderedChapters.findIndex(
      (chapter) => chapter.id === over.id
    );
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(orderedChapters, oldIndex, newIndex);
    const previousOrder = orderedChapters;
    setOrderedChapters(newOrder);
    reorderChaptersMutation.mutate(
      newOrder.map((chapter) => chapter.id),
      {
        onError: () => {
          setOrderedChapters(previousOrder);
        },
      }
    );
  };

  // Fonctions pour mobile : déplacer un chapitre
  const moveChapterUp = (index: number): void => {
    if (index === 0) return;
    const newOrder = arrayMove(orderedChapters, index, index - 1);
    const previousOrder = orderedChapters;
    setOrderedChapters(newOrder);
    reorderChaptersMutation.mutate(
      newOrder.map((chapter) => chapter.id),
      {
        onError: () => {
          setOrderedChapters(previousOrder);
        },
      }
    );
  };

  const moveChapterDown = (index: number): void => {
    if (index === orderedChapters.length - 1) return;
    const newOrder = arrayMove(orderedChapters, index, index + 1);
    const previousOrder = orderedChapters;
    setOrderedChapters(newOrder);
    reorderChaptersMutation.mutate(
      newOrder.map((chapter) => chapter.id),
      {
        onError: () => {
          setOrderedChapters(previousOrder);
        },
      }
    );
  };

  if (isLoading || !book) {
    return (
      <p className="font-writing text-neutral-textSecondary">
        Chargement du livre...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/documents"
          className="font-interface text-sm font-medium text-action-link transition-colors hover:underline"
        >
          ← Retour aux documents
        </Link>
        <BookExportButton book={book} chapters={orderedChapters} />
      </div>

      <div className="writing-zone rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-md sm:p-7">
        <h1 className="font-writing text-2xl font-bold text-parchment-text sm:text-3xl">
          {book.title}
        </h1>
        {book.description && (
          <p className="mt-2 font-writing text-sm text-neutral-textSecondary">
            {book.description}
          </p>
        )}
        <p className="mt-2 font-writing text-xs text-neutral-textSecondary sm:text-sm">
          {book.chapterCount} chapitre{book.chapterCount > 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px,1fr]">
        {/* Sidebar gauche - Liste des chapitres */}
        <aside className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:overflow-x-hidden min-w-0">
          <div className="mb-4">
            <h2 className="font-writing text-xl font-semibold text-parchment-text sm:text-2xl">
              Chapitres
            </h2>

            {/* Messages de feedback pour la sauvegarde */}
            {saveStatus === 'saving' && (
              <p className="mt-1 font-writing text-xs text-blue-600/80">
                Enregistrement en cours...
              </p>
            )}

            {saveStatus === 'success' && (
              <p className="mt-1 font-writing text-xs text-green-600/80">
                Enregistré ✓
              </p>
            )}

            {saveStatus === 'error' && (
              <p className="mt-1 font-writing text-xs text-red-600/80">
                Erreur lors de l&apos;enregistrement
              </p>
            )}
          </div>

          {orderedChapters.length === 0 ? (
            <div className="writing-zone rounded-lg border border-dashed border-parchment-border p-6 text-center text-neutral-textSecondary">
              Aucun chapitre pour l&apos;instant. Ajoutez des documents !
            </div>
          ) : isMobile ? (
            // Version mobile : pas de drag & drop, boutons ↑/↓
            <div className="space-y-3">
              {orderedChapters.map((chapter, index) => (
                <div key={chapter.id} className="relative">
                  <SortableDocumentCard
                    document={chapter}
                    onDelete={(id) => deleteDocumentMutation.mutate(id)}
                    isDeleting={
                      deleteDocumentMutation.isPending &&
                      deleteDocumentMutation.variables === chapter.id
                    }
                    compact={true}
                    additionalActions={
                      <>
                        {/* Boutons de réorganisation mobile */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => moveChapterUp(index)}
                            disabled={
                              index === 0 || reorderChaptersMutation.isPending
                            }
                            className="font-interface rounded-lg border border-neutral-border bg-white px-2 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-neutral-border"
                            title="Monter"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveChapterDown(index)}
                            disabled={
                              index === orderedChapters.length - 1 ||
                              reorderChaptersMutation.isPending
                            }
                            className="font-interface rounded-lg border border-neutral-border bg-white px-2 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-neutral-border"
                            title="Descendre"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                        <button
                          onClick={() =>
                            removeFromBookMutation.mutate(chapter.id)
                          }
                          disabled={removeFromBookMutation.isPending}
                          className="font-interface w-full rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-border focus:ring-offset-2 whitespace-nowrap"
                          title="Retirer du livre"
                        >
                          Retirer
                        </button>
                      </>
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            // Version desktop : drag & drop classique
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedChapters.map((chapter) => chapter.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {orderedChapters.map((chapter) => (
                    <SortableDocumentCard
                      key={chapter.id}
                      document={chapter}
                      onDelete={(id) => deleteDocumentMutation.mutate(id)}
                      isDeleting={
                        deleteDocumentMutation.isPending &&
                        deleteDocumentMutation.variables === chapter.id
                      }
                      compact={true}
                      additionalActions={
                        <button
                          onClick={() =>
                            removeFromBookMutation.mutate(chapter.id)
                          }
                          disabled={removeFromBookMutation.isPending}
                          className="font-interface w-full rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-border focus:ring-offset-2 sm:w-auto flex-shrink-0 whitespace-nowrap"
                          title="Retirer du livre"
                        >
                          Retirer
                        </button>
                      }
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Bouton Nouveau chapitre */}
          <button
            onClick={() => createChapterMutation.mutate()}
            disabled={createChapterMutation.isPending || !styles}
            className="font-interface mt-4 w-full rounded-lg border-2 border-ai-primary bg-ai-primary/10 px-4 py-3 text-sm font-semibold text-ai-primary transition-all hover:bg-ai-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
          >
            {createChapterMutation.isPending
              ? 'Création...'
              : '+ Nouveau chapitre'}
          </button>

          {/* Bouton importer un fichier */}
          <input
            ref={importFileRef}
            type="file"
            accept=".txt,.md"
            className="sr-only"
            onChange={handleImportFile}
          />
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={importChapterMutation.isPending || !styles}
            className="font-interface mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-border bg-white px-4 py-2.5 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg hover:border-neutral-border/60 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-border"
          >
            <Upload size={14} />
            {importChapterMutation.isPending
              ? 'Import en cours...'
              : 'Importer un fichier'}
          </button>
          <p className="mt-1 text-center font-interface text-xs text-neutral-textSecondary/60">
            .txt ou .md acceptés
          </p>
          {importError && (
            <p className="mt-1 font-interface text-xs text-action-error">
              {importError}
            </p>
          )}
        </aside>

        {/* Contenu central - Affichage de tous les chapitres dans l'ordre */}
        <main className="min-h-[600px]">
          {orderedChapters.length === 0 ? (
            <div className="writing-zone rounded-lg border border-dashed border-parchment-border p-12 text-center text-neutral-textSecondary">
              <p className="font-writing text-lg">
                Aucun chapitre pour l&apos;instant. Ajoutez des documents !
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {orderedChapters.map((chapter, index) => (
                <div key={chapter.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-writing text-sm text-neutral-textSecondary">
                      Chapitre {index + 1} sur {orderedChapters.length}
                    </p>
                    <Link
                      href={`/documents/${chapter.id}`}
                      className="font-interface text-sm font-medium text-action-link transition-colors hover:underline"
                    >
                      Éditer ce chapitre →
                    </Link>
                  </div>
                  <ChapterContent chapter={chapter} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
