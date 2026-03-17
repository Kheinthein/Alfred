'use client';

import { BookCard } from '@components/BookCard';
import { useDroppable } from '@dnd-kit/core';
import { BookDTO } from '@shared/types';
import { BookOpen, Plus } from 'lucide-react';

interface BookDropZoneProps {
  book: BookDTO;
  isOver?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Zone de drop pour un livre - permet de recevoir des documents en drag and drop
 */
export function BookDropZone({
  book,
  isOver,
  onDelete,
  isDeleting,
}: BookDropZoneProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: `book-${book.id}`,
  });

  const isActive = isOver || isDroppableOver;

  return (
    <div
      ref={setNodeRef}
      className={`book-cover-wrapper font-writing rounded-r-xl rounded-l-none p-5 shadow-lg transition-all sm:p-6 relative overflow-hidden flex flex-col ${
        isActive
          ? 'ring-2 ring-ai-primary ring-offset-2 scale-[1.02]'
          : 'hover:shadow-xl hover:scale-[1.01]'
      }`}
    >
      <div className="relative z-10 flex-1 flex flex-col">
        <BookCard
          book={book}
          onDelete={onDelete}
          isDeleting={isDeleting}
          isDragging={false}
          isInWrapper={true}
        />
        {isActive && (
          <div className="mt-3 rounded-lg bg-ai-primary/20 backdrop-blur-sm p-3 text-center pointer-events-none">
            <p className="font-interface text-sm font-semibold text-white drop-shadow-md">
              Déposez le document ici pour l&apos;ajouter au livre
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface BooksSectionProps {
  books: BookDTO[];
  onCreateBook?: () => void;
  onDeleteBook?: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * Section affichant tous les livres avec zones de drop
 */
export function BooksSection({
  books,
  onCreateBook,
  onDeleteBook,
  isDeleting,
}: BooksSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-writing text-xl font-semibold text-parchment-text sm:text-2xl">
            Mes livres
          </h2>
          <p className="mt-1 font-writing text-sm text-neutral-textSecondary">
            {books.length} livre{books.length > 1 ? 's' : ''}
          </p>
        </div>
        {onCreateBook && (
          <button
            onClick={onCreateBook}
            className="font-interface flex items-center gap-2 rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nouveau livre</span>
            <span className="sm:hidden">Nouveau</span>
          </button>
        )}
      </div>

      {books.length === 0 ? (
        <div className="writing-zone rounded-lg border border-dashed border-parchment-border p-8 text-center text-neutral-textSecondary sm:p-10">
          <BookOpen
            className="mx-auto mb-3 text-neutral-textSecondary/50"
            size={32}
          />
          <p>Aucun livre pour l&apos;instant.</p>
          {onCreateBook && (
            <button
              onClick={onCreateBook}
              className="font-interface mt-4 rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
            >
              Créer votre premier livre
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookDropZone
              key={book.id}
              book={book}
              onDelete={onDeleteBook}
              isDeleting={isDeleting && onDeleteBook !== undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}
