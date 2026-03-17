'use client';

import { SortableBookCard } from '@components/SortableBookCard';
import { DndContext, type DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { bookService } from '@shared/services/bookService';
import type { BookDTO } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export default function BooksPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '' });

  const { data: booksData, isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => bookService.list(),
  });

  const books = useMemo<BookDTO[]>(() => booksData ?? [], [booksData]);

  const [orderedBooks, setOrderedBooks] = useState<BookDTO[]>(books);
  useEffect(() => {
    if (!booksData) return;
    setOrderedBooks(booksData);
  }, [booksData]);

  const [creationError, setCreationError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      bookService.create({
        title: form.title,
        description: form.description || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      setForm({ title: '', description: '' });
      setCreationError(null);
    },
    onError: (error: unknown) => {
      setCreationError(
        error instanceof Error ? error.message : 'Impossible de créer le livre'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bookService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (bookIds: string[]) => bookService.reorder(bookIds),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedBooks.findIndex((book) => book.id === active.id);
    const newIndex = orderedBooks.findIndex((book) => book.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(orderedBooks, oldIndex, newIndex);
    const previousOrder = orderedBooks;
    setOrderedBooks(newOrder);
    reorderMutation.mutate(
      newOrder.map((book) => book.id),
      {
        onError: () => {
          setOrderedBooks(previousOrder);
        },
      }
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="writing-zone rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-md sm:p-7">
        <h2 className="font-writing text-xl font-bold text-parchment-text sm:text-2xl">
          Nouveau livre
        </h2>
        <p className="mt-2 font-writing text-sm text-neutral-textSecondary">
          Créez un livre pour organiser vos documents en chapitres.
        </p>

        <div className="mt-4 grid gap-4">
          <div>
            <label
              className="font-writing block text-sm font-medium text-parchment-text"
              htmlFor="new-book-title"
            >
              Titre
            </label>
            <input
              id="new-book-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <textarea
              id="new-book-description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="font-writing mt-1 w-full rounded-md border border-parchment-border bg-writing-editor px-3 py-2 text-sm text-parchment-text focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow focus:ring-offset-1 sm:text-base"
              placeholder="Description du livre..."
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={() => createMutation.mutate()}
            disabled={!form.title || createMutation.isPending}
            className="font-interface w-full rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:w-auto"
          >
            {createMutation.isPending ? 'Création...' : 'Créer'}
          </button>
          {creationError && (
            <p className="mt-2 font-writing text-sm text-action-error">
              {creationError}
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-writing text-xl font-semibold text-parchment-text sm:text-2xl">
            Mes livres
          </h2>
          <p className="mt-1 font-writing text-sm text-neutral-textSecondary">
            {books.length} livre{books.length > 1 ? 's' : ''}
          </p>
          {reorderMutation.isPending && (
            <p className="mt-1 font-writing text-xs text-ai-primary">
              Enregistrement de l&apos;ordre...
            </p>
          )}
        </div>

        {isLoading ? (
          <p className="font-writing text-neutral-textSecondary">
            Chargement des livres...
          </p>
        ) : orderedBooks.length === 0 ? (
          <div className="writing-zone rounded-lg border border-dashed border-parchment-border p-8 text-center text-neutral-textSecondary sm:p-10">
            Aucun livre pour l&apos;instant. Créez-en un nouveau !
          </div>
        ) : (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={orderedBooks.map((book) => book.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid gap-4">
                {orderedBooks.map((book) => (
                  <SortableBookCard
                    key={book.id}
                    book={book}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={
                      deleteMutation.isPending &&
                      deleteMutation.variables === book.id
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </section>
    </div>
  );
}
