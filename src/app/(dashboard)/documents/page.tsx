'use client';

import { AddToBookButton } from '@components/AddToBookButton';
import { BooksSection } from '@components/BookDropZone';
import { BooksList } from '@components/BooksList';
import { ConfirmDialog } from '@components/ConfirmDialog';
import { SortableDocumentCard } from '@components/SortableDocumentCard';
import { UnassignDropZone } from '@components/UnassignDropZone';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { bookService } from '@shared/services/bookService';
import { documentService } from '@shared/services/documentService';
import { styleService } from '@shared/services/styleService';
import { tagService, TagDTO } from '@shared/services/tagService';
import type { BookDTO, DocumentDTO } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WritingStats } from '@components/WritingStats';
import { Plus, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ title: '', styleId: '' });
  const [bookForm, setBookForm] = useState({ title: '', description: '' });
  const [showBookForm, setShowBookForm] = useState(false);
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showBookDeleteConfirm, setShowBookDeleteConfirm] = useState<
    string | null
  >(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
    }, 300);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { data: documentsData, isLoading } = useQuery({
    queryKey: [
      'documents',
      searchQuery,
      selectedTagId,
      selectedStyleId,
      sortField,
      sortOrder,
    ],
    queryFn: () =>
      documentService.list({
        search: searchQuery || undefined,
        tagId: selectedTagId ?? undefined,
        styleId: selectedStyleId ?? undefined,
        sortField,
        sortOrder,
      }),
  });

  const { data: booksData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['books'],
    queryFn: () => bookService.list(),
  });

  const { data: styles = [] } = useQuery({
    queryKey: ['styles'],
    queryFn: () => styleService.list(),
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.list(),
  });

  // Les document-tags sont chargés via les cartes individuellement,
  // on fait un filtre côté client avec les tags du document via l'API
  const documents = useMemo<DocumentDTO[]>(
    () => documentsData ?? [],
    [documentsData]
  );

  const books = useMemo<BookDTO[]>(() => booksData ?? [], [booksData]);

  const [orderedDocuments, setOrderedDocuments] =
    useState<DocumentDTO[]>(documents);
  useEffect(() => {
    if (!documentsData) return;
    setOrderedDocuments(documentsData);
  }, [documentsData]);

  const [creationError, setCreationError] = useState<string | null>(null);
  const [moveStatus, setMoveStatus] = useState<
    'idle' | 'moving' | 'success' | 'error'
  >('idle');

  const createMutation = useMutation({
    mutationFn: () =>
      documentService.create({
        title: form.title,
        styleId: form.styleId,
        content:
          'Commencez votre histoire ici. Décrivez le contexte, vos personnages ou l’idée générale pour que l’IA puisse vous aider 🍀',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      setForm({ title: '', styleId: '' });
      setCreationError(null);
      setShowDocumentForm(false);
    },
    onError: (error: unknown) => {
      setCreationError(
        error instanceof Error
          ? error.message
          : 'Impossible de créer le document'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (documentIds: string[]) => documentService.reorder(documentIds),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const createBookMutation = useMutation({
    mutationFn: () =>
      bookService.create({
        title: bookForm.title,
        description: bookForm.description || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      setBookForm({ title: '', description: '' });
      setShowBookForm(false);
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: string) => bookService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      setShowBookDeleteConfirm(null);
    },
  });

  const moveToBookMutation = useMutation({
    mutationFn: ({
      documentId,
      bookId,
      chapterOrder,
    }: {
      documentId: string;
      bookId: string | null;
      chapterOrder?: number | null;
    }) => {
      setMoveStatus('moving');
      return documentService.moveToBook(documentId, bookId, chapterOrder);
    },
    onSuccess: () => {
      setMoveStatus('success');
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setMoveStatus('idle');
      }, 3000);
    },
    onError: () => {
      setMoveStatus('error');
      // Masquer le message d'erreur après 5 secondes
      setTimeout(() => {
        setMoveStatus('idle');
      }, 5000);
    },
  });

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over) return;

    // Si on drop sur un livre (format: "book-{id}")
    if (typeof over.id === 'string' && over.id.startsWith('book-')) {
      const bookId = over.id.replace('book-', '');
      const documentId = active.id as string;

      // Trouver le document
      const document = documents.find((doc) => doc.id === documentId);
      if (!document) return;

      // Calculer le chapterOrder (nombre de documents déjà dans le livre + 1)
      const book = books.find((b) => b.id === bookId);
      const chapterOrder = book ? book.chapterCount + 1 : 1;

      moveToBookMutation.mutate({
        documentId,
        bookId,
        chapterOrder,
      });
      return;
    }

    // Si on drop sur "unassign" (retirer du livre)
    if (over.id === 'unassign') {
      const documentId = active.id as string;
      moveToBookMutation.mutate({
        documentId,
        bookId: null,
        chapterOrder: null,
      });
      return;
    }

    // Sinon, réorganisation normale des documents
    if (active.id === over.id) return;
    const oldIndex = orderedDocuments.findIndex((doc) => doc.id === active.id);
    const newIndex = orderedDocuments.findIndex((doc) => doc.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(orderedDocuments, oldIndex, newIndex);
    const previousOrder = orderedDocuments;
    setOrderedDocuments(newOrder);
    reorderMutation.mutate(
      newOrder.map((doc) => doc.id),
      {
        onError: () => {
          setOrderedDocuments(previousOrder);
        },
      }
    );
  };

  // Vérifier s'il y a des documents dans des livres pour afficher la zone de retrait
  const hasDocumentsInBooks = useMemo(
    () => documents.some((doc) => doc.bookId),
    [documents]
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        // Utiliser pointerWithin pour les zones de drop (livres)
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          return pointerCollisions;
        }
        // Fallback sur closestCenter pour les autres cas
        return closestCenter(args);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Section des livres */}
        {!isLoadingBooks &&
          (isMobile ? (
            // Version mobile : simple liste sans drag & drop
            <BooksList
              books={books}
              onCreateBook={() => setShowBookForm(true)}
              onDeleteBook={(id) => setShowBookDeleteConfirm(id)}
              isDeleting={
                deleteBookMutation.isPending &&
                deleteBookMutation.variables === showBookDeleteConfirm
              }
            />
          ) : (
            // Version desktop : avec zones de drop
            <BooksSection
              books={books}
              onCreateBook={() => setShowBookForm(true)}
              onDeleteBook={(id) => setShowBookDeleteConfirm(id)}
              isDeleting={
                deleteBookMutation.isPending &&
                deleteBookMutation.variables === showBookDeleteConfirm
              }
            />
          ))}

        {/* Formulaire de création de livre */}
        {showBookForm && (
          <section className="writing-zone rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-md sm:p-7">
            <h2 className="font-writing text-xl font-bold text-parchment-text sm:text-2xl">
              Nouveau livre
            </h2>
            <p className="mt-2 font-writing text-sm text-neutral-textSecondary">
              Organisez vos documents en chapitres.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="font-writing block text-sm font-medium text-parchment-text"
                  htmlFor="new-book-title"
                >
                  Titre
                </label>
                <input
                  id="new-book-title"
                  value={bookForm.title}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, title: e.target.value })
                  }
                  className="font-writing mt-1 w-full rounded-md border border-parchment-border bg-writing-editor px-3 py-2 text-sm text-parchment-text focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1 sm:text-base"
                  placeholder="Titre du livre"
                />
              </div>

              <div>
                <label
                  className="font-writing block text-sm font-medium text-parchment-text"
                  htmlFor="new-book-description"
                >
                  Description (optionnel)
                </label>
                <input
                  id="new-book-description"
                  value={bookForm.description}
                  onChange={(e) =>
                    setBookForm({ ...bookForm, description: e.target.value })
                  }
                  className="font-writing mt-1 w-full rounded-md border border-parchment-border bg-writing-editor px-3 py-2 text-sm text-parchment-text focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1 sm:text-base"
                  placeholder="Description du livre"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => createBookMutation.mutate()}
                disabled={!bookForm.title || createBookMutation.isPending}
                className="font-interface rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
              >
                {createBookMutation.isPending ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => {
                  setShowBookForm(false);
                  setBookForm({ title: '', description: '' });
                }}
                className="font-interface rounded-lg border-2 border-parchment-border px-6 py-3 text-sm font-semibold text-parchment-text transition-all hover:bg-parchment-border/20 focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-2"
              >
                Annuler
              </button>
            </div>
          </section>
        )}

        {/* Formulaire de création de document */}
        {showDocumentForm && (
          <section className="writing-zone rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-md sm:p-7">
            <h2 className="font-writing text-xl font-bold text-parchment-text sm:text-2xl">
              Nouveau document
            </h2>
            <p className="mt-2 font-writing text-sm text-neutral-textSecondary">
              Choisissez un titre et un style pour commencer.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="font-writing block text-sm font-medium text-parchment-text"
                  htmlFor="new-document-title"
                >
                  Titre
                </label>
                <input
                  id="new-document-title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="font-writing mt-1 w-full rounded-md border border-parchment-border bg-writing-editor px-3 py-2 text-sm text-parchment-text focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1 sm:text-base"
                  placeholder="Titre du document"
                />
              </div>

              <div>
                <label
                  className="font-writing block text-sm font-medium text-parchment-text"
                  htmlFor="new-document-style"
                >
                  Style
                </label>
                <select
                  id="new-document-style"
                  value={form.styleId}
                  onChange={(e) =>
                    setForm({ ...form, styleId: e.target.value })
                  }
                  className="font-writing mt-1 w-full rounded-md border border-parchment-border bg-writing-editor px-3 py-2 text-sm text-parchment-text focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1 sm:text-base"
                >
                  <option value="">Choisir un style</option>
                  {styles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => createMutation.mutate()}
                disabled={
                  !form.title || !form.styleId || createMutation.isPending
                }
                className="font-interface rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
              >
                {createMutation.isPending ? 'Création...' : 'Créer'}
              </button>
              <button
                onClick={() => {
                  setShowDocumentForm(false);
                  setForm({ title: '', styleId: '' });
                  setCreationError(null);
                }}
                className="font-interface rounded-lg border-2 border-parchment-border px-6 py-3 text-sm font-semibold text-parchment-text transition-all hover:bg-parchment-border/20 focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-2"
              >
                Annuler
              </button>
            </div>
            {creationError && (
              <p className="mt-2 font-writing text-sm text-action-error">
                {creationError}
              </p>
            )}
          </section>
        )}

        {/* Statistiques */}
        <section className="mb-6">
          <WritingStats />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-writing text-xl font-semibold text-parchment-text sm:text-2xl">
                Mes documents
              </h2>
              <p className="mt-1 font-writing text-sm text-neutral-textSecondary">
                {searchQuery
                  ? `${documents.length} résultat${documents.length > 1 ? 's' : ''} pour "${searchQuery}"`
                  : `${documents.length} document${documents.length > 1 ? 's' : ''}`}
              </p>
              {reorderMutation.isPending && (
                <p className="mt-1 font-writing text-xs text-ai-primary">
                  Enregistrement de l&apos;ordre...
                </p>
              )}

              {moveStatus === 'moving' && (
                <p className="mt-1 font-writing text-xs text-blue-600/80">
                  Enregistrement en cours...
                </p>
              )}
              {moveStatus === 'success' && (
                <p className="mt-1 font-writing text-xs text-green-600/80">
                  Enregistré ✓
                </p>
              )}
              {moveStatus === 'error' && (
                <p className="mt-1 font-writing text-xs text-red-600/80">
                  Erreur lors de l&apos;enregistrement
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/documents/trash"
                className="font-interface flex items-center gap-1.5 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg"
                title="Corbeille"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Corbeille</span>
              </Link>
              <button
                onClick={() => setShowDocumentForm(true)}
                className="font-interface flex items-center gap-2 rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Nouveau document</span>
                <span className="sm:hidden">Nouveau</span>
              </button>
            </div>
          </div>

          {/* Barre de recherche + filtres + tri */}
          <div className="mb-5 space-y-2">
            {/* Ligne 1 : Recherche */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-textSecondary pointer-events-none"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Rechercher un document..."
                className="font-writing w-full rounded-lg border border-parchment-border bg-writing-editor py-2.5 pl-9 pr-9 text-sm text-parchment-text placeholder:text-neutral-textSecondary/60 focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1"
              />
              {searchInput && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-textSecondary hover:text-parchment-text"
                  aria-label="Effacer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Ligne 2 : Filtre style + tri */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtre par style */}
              <select
                value={selectedStyleId ?? ''}
                onChange={(e) => setSelectedStyleId(e.target.value || null)}
                className="font-interface rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs text-neutral-textSecondary focus:outline-none focus:ring-2 focus:ring-ai-primary"
              >
                <option value="">Tous les styles</option>
                {styles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="font-interface rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs text-neutral-textSecondary focus:outline-none focus:ring-2 focus:ring-ai-primary"
              >
                <option value="updatedAt">Date de modification</option>
                <option value="createdAt">Date de création</option>
                <option value="title">Titre</option>
                <option value="wordCount">Nombre de mots</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
                }
                className="font-interface flex items-center gap-1 rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs text-neutral-textSecondary transition-colors hover:bg-neutral-bg"
                title={sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
                {sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}
              </button>

              {/* Filtre tags actifs */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {(allTags as TagDTO[]).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        setSelectedTagId(
                          selectedTagId === tag.id ? null : tag.id
                        )
                      }
                      className="font-interface inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          selectedTagId === tag.id
                            ? (tag.color ?? '#6B46C1')
                            : 'transparent',
                        color:
                          selectedTagId === tag.id
                            ? '#fff'
                            : (tag.color ?? '#6B46C1'),
                        border: `1.5px solid ${tag.color ?? '#6B46C1'}`,
                      }}
                    >
                      {tag.name}
                      {selectedTagId === tag.id && <X size={10} />}
                    </button>
                  ))}
                </div>
              )}

              {/* Réinitialiser les filtres */}
              {(selectedStyleId ?? selectedTagId ?? searchQuery !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStyleId(null);
                    setSelectedTagId(null);
                    handleSearchChange('');
                  }}
                  className="font-interface text-xs text-neutral-textSecondary underline hover:text-parchment-text"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className="font-writing text-neutral-textSecondary">
              Chargement des documents...
            </p>
          ) : orderedDocuments.length === 0 ? (
            <div className="writing-zone rounded-lg border border-dashed border-parchment-border p-8 text-center text-neutral-textSecondary sm:p-10">
              {searchQuery
                ? `Aucun document ne correspond à "${searchQuery}".`
                : "Aucun document pour l'instant. Créez-en un nouveau !"}
            </div>
          ) : (
            <SortableContext
              items={orderedDocuments.map((doc) => doc.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {orderedDocuments.map((doc) => {
                  // Pour mobile : ajouter un bouton "Ajouter au livre" si le doc n'est pas dans un livre
                  const additionalActions =
                    isMobile && !doc.bookId ? (
                      <AddToBookButton
                        books={books}
                        onSelect={(bookId) => {
                          const book = books.find((b) => b.id === bookId);
                          const chapterOrder = book ? book.chapterCount + 1 : 1;
                          moveToBookMutation.mutate({
                            documentId: doc.id,
                            bookId,
                            chapterOrder,
                          });
                        }}
                        disabled={moveToBookMutation.isPending}
                      />
                    ) : undefined;

                  return (
                    <SortableDocumentCard
                      key={doc.id}
                      document={doc}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      isDeleting={
                        deleteMutation.isPending &&
                        deleteMutation.variables === doc.id
                      }
                      additionalActions={additionalActions}
                    />
                  );
                })}
              </div>
            </SortableContext>
          )}
        </section>

        {/* Zone de drop pour retirer un document d'un livre - seulement sur desktop */}
        {hasDocumentsInBooks && !isMobile && <UnassignDropZone />}

        {showBookDeleteConfirm && (
          <ConfirmDialog
            title="Supprimer ce livre ?"
            message={
              <p>
                Le livre sera définitivement supprimé. Les chapitres ne seront
                pas supprimés mais retirés du livre.
              </p>
            }
            confirmLabel="Oui, supprimer"
            cancelLabel="Annuler"
            onCancel={() => setShowBookDeleteConfirm(null)}
            onConfirm={() => {
              if (showBookDeleteConfirm) {
                deleteBookMutation.mutate(showBookDeleteConfirm);
              }
            }}
          />
        )}
      </div>
    </DndContext>
  );
}
