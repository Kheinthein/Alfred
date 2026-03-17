import { BookDTO } from '@shared/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpen, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { HTMLAttributes } from 'react';

interface BookCardProps {
  book: BookDTO;
  onDelete?: (id: string) => void;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  isDeleting?: boolean;
  isInWrapper?: boolean;
}

export function BookCard({
  book,
  onDelete,
  dragHandleProps,
  isDragging,
  isDeleting,
  isInWrapper = false,
}: BookCardProps) {
  return (
    <div
      data-testid="book-card"
      data-book-id={book.id}
      data-book-title={book.title}
      className={`font-writing transition-all flex flex-col ${
        isInWrapper
          ? 'bg-transparent border-0 shadow-none p-0 h-full'
          : 'writing-zone rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-md hover:shadow-parchment-lg hover:border-parchment-border sm:p-6'
      } ${isDragging ? 'ring-2 ring-ai-primary scale-105' : ''}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between flex-1">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-start gap-2">
            {dragHandleProps && (
              <button
                type="button"
                aria-label="Déplacer le livre"
                {...dragHandleProps}
                className={`mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing ${
                  isInWrapper
                    ? 'text-white/70 hover:text-white'
                    : 'text-neutral-textSecondary hover:text-parchment-text'
                }`}
              >
                <GripVertical size={18} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <BookOpen
                  size={20}
                  className={`flex-shrink-0 ${
                    isInWrapper
                      ? 'text-white drop-shadow-md'
                      : 'text-ai-primary'
                  }`}
                />
                <h3
                  className={`text-lg font-semibold sm:text-xl break-words ${
                    isInWrapper
                      ? 'text-white drop-shadow-lg'
                      : 'text-parchment-textDark'
                  }`}
                >
                  {book.title}
                </h3>
              </div>
              {book.description && (
                <p
                  className={`mt-1 text-sm line-clamp-2 break-words ${
                    isInWrapper
                      ? 'text-white/90 drop-shadow-md'
                      : 'text-neutral-textSecondary'
                  }`}
                >
                  {book.description}
                </p>
              )}
              <p
                className={`mt-2 text-xs sm:text-sm ${
                  isInWrapper
                    ? 'text-white/85 drop-shadow-sm'
                    : 'text-neutral-textSecondary'
                }`}
              >
                <span className="inline-block">
                  {book.chapterCount} chapitre{book.chapterCount > 1 ? 's' : ''}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div
          className={`flex-shrink-0 text-left text-xs sm:text-right sm:ml-4 ${
            isInWrapper
              ? 'text-white/80 drop-shadow-md'
              : 'text-neutral-textSecondary'
          }`}
        >
          <p className="whitespace-nowrap">
            Modifié le{' '}
            {format(new Date(book.updatedAt), 'dd MMM yyyy', {
              locale: fr,
            })}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-between sm:items-center">
        <Link
          href={`/books/${book.id}`}
          data-testid="open-book-button"
          className="font-interface w-full rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:w-auto"
        >
          Ouvrir
        </Link>
        {onDelete && (
          <button
            data-testid="delete-book-button"
            onClick={() => onDelete(book.id)}
            disabled={isDeleting}
            className={`font-interface w-full rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto sm:ml-auto ${
              isInWrapper
                ? 'border-white/40 text-white hover:bg-white/20 hover:border-white/60 focus:ring-white'
                : 'border-action-error/40 text-action-error hover:bg-action-error/10 hover:border-action-error focus:ring-action-error'
            }`}
          >
            Supprimer
          </button>
        )}
      </div>
    </div>
  );
}
