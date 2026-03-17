'use client';

import { DocumentDTO } from '@shared/types';

interface ChapterContentProps {
  chapter: DocumentDTO;
}

export function ChapterContent({ chapter }: ChapterContentProps) {
  return (
    <div className="writing-zone relative rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-lg sm:p-7">
      <div className="mb-5 border-b border-parchment-border/40 pb-4">
        <h2 className="font-writing text-2xl font-bold text-parchment-text sm:text-3xl break-words leading-tight">
          {chapter.title}
        </h2>
        <p className="mt-2 font-writing text-xs text-neutral-textSecondary sm:text-sm">
          <span className="inline-block font-medium">
            Style : {chapter.style.name}
          </span>
          <span className="mx-2 text-parchment-border">•</span>
          <span className="inline-block">Version {chapter.version}</span>
          <span className="mx-2 hidden sm:inline text-parchment-border">•</span>
          <span className="block mt-1 sm:inline sm:mt-0">
            {chapter.wordCount} mots
          </span>
        </p>
      </div>

      <div className="writing-editor font-writing w-full whitespace-pre-wrap rounded-lg border-2 border-parchment-border/50 px-4 py-3 text-sm leading-relaxed sm:px-5 sm:py-4 sm:text-base sm:leading-relaxed min-h-[400px]">
        {chapter.content || (
          <span className="text-neutral-textSecondary italic">
            Ce chapitre est vide.
          </span>
        )}
      </div>
    </div>
  );
}
