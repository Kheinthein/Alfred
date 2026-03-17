import { BookDTO } from '@shared/types';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';

interface AddToBookButtonProps {
  books: BookDTO[];
  onSelect: (bookId: string) => void;
  disabled?: boolean;
}

/**
 * Bouton pour ajouter un document à un livre (version mobile-friendly)
 */
export function AddToBookButton({
  books,
  onSelect,
  disabled,
}: AddToBookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (books.length === 0) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="font-interface w-full rounded-lg border border-ai-primary/40 bg-ai-primary/5 px-3 py-1.5 text-xs font-medium text-ai-primary transition-all hover:bg-ai-primary/10 hover:border-ai-primary disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:w-auto flex-shrink-0 whitespace-nowrap flex items-center justify-center gap-1.5"
        title="Ajouter à un livre"
      >
        <BookOpen size={14} />
        Ajouter au livre
      </button>
    );
  }

  return (
    <div className="flex gap-1.5 w-full sm:w-auto">
      <select
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            setIsOpen(false);
          }
        }}
        disabled={disabled}
        className="font-interface w-full rounded-lg border border-ai-primary bg-white px-3 py-1.5 text-xs font-medium text-ai-primary transition-all focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <option value="">Choisir un livre...</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>
      <button
        onClick={() => setIsOpen(false)}
        disabled={disabled}
        className="font-interface rounded-lg border border-neutral-border bg-white px-3 py-1.5 text-xs font-medium text-neutral-textSecondary transition-all hover:bg-neutral-bg disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-neutral-border flex-shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
