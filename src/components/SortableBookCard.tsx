import { BookCard } from '@components/BookCard';
import { BookDTO } from '@shared/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableBookCardProps {
  book: BookDTO;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function SortableBookCard({
  book,
  onDelete,
  isDeleting,
}: SortableBookCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: book.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BookCard
        book={book}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
        isDeleting={isDeleting}
      />
    </div>
  );
}
