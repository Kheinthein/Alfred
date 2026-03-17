'use client';

import { useDroppable } from '@dnd-kit/core';

interface UnassignDropZoneProps {
  isOver?: boolean;
}

/**
 * Zone de drop pour retirer un document de son livre
 */
export function UnassignDropZone({ isOver }: UnassignDropZoneProps) {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: 'unassign',
  });

  const isActive = isOver || isDroppableOver;

  return (
    <section
      ref={setNodeRef}
      className={`writing-zone rounded-xl border-2 p-5 shadow-parchment-md transition-all sm:p-7 ${
        isActive
          ? 'border-ai-primary bg-ai-primary/5 shadow-parchment-lg ring-2 ring-ai-primary border-dashed'
          : 'border-dashed border-parchment-border/40'
      }`}
    >
      <div className="text-center" style={{ minHeight: '100px' }}>
        {isActive ? (
          <p className="font-interface text-sm font-semibold text-ai-primary">
            Déposez le document ici pour le retirer de son livre
          </p>
        ) : (
          <p className="font-writing text-sm text-neutral-textSecondary">
            Déposez un document ici pour le retirer de son livre
          </p>
        )}
      </div>
    </section>
  );
}
