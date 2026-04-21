'use client';

import { AIAnalysisPanel } from '@components/AIAnalysisPanel';
import { ChatPanel } from '@components/ChatPanel';
import { Spinner } from '@components/Spinner';
import { TagPicker } from '@components/TagPicker';
import { VersionHistory } from '@components/VersionHistory';
import { aiService } from '@shared/services/aiService';
import { documentService } from '@shared/services/documentService';
import { AIAnalysisDTO, AnalysisType, DocumentDTO } from '@shared/types';
import { useMutation } from '@tanstack/react-query';
import { Bot, Wand2 } from 'lucide-react';
import React, { ChangeEvent, useEffect, useState } from 'react';

interface DocumentEditorProps {
  readonly document: DocumentDTO;
}

type SidePanelTab = 'analyze' | 'chat';

function getSaveLabel(isSuccess: boolean): string {
  return isSuccess ? '✓ Sauvegardé' : 'Dernière sauvegarde auto';
}

export function DocumentEditor({
  document,
}: DocumentEditorProps): React.JSX.Element {
  const [content, setContent] = useState(document.content);
  const [title, setTitle] = useState(document.title);
  const [analysis, setAnalysis] = useState<AIAnalysisDTO | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SidePanelTab>('analyze');

  useEffect(() => {
    setContent(document.content);
    setTitle(document.title);
  }, [document.content, document.title]);

  const updateMutation = useMutation({
    mutationFn: (payload: { content?: string; title?: string }) =>
      documentService.update(document.id, payload),
  });

  // On extrait `mutate` qui est stable entre les renders (React Query garantit sa référence).
  // Mettre `updateMutation` entier dans les deps déclencherait l'effet à chaque changement
  // d'état (pending → success) et entraînerait plusieurs sauvegardes — donc plusieurs version++.
  const { mutate: saveDocument } = updateMutation;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (content !== document.content) {
        saveDocument({ content });
      }
    }, 1500);

    return () => clearTimeout(timeout);
  }, [content, document.content, document.id, saveDocument]);

  const handleContentChange = (
    event: ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setContent(event.target.value);
  };

  const performAnalyze = async (type: AnalysisType): Promise<void> => {
    setAnalyzeError(null);
    setIsAnalyzing(true);
    try {
      const response = await aiService.analyze(document.id, type);
      setAnalysis(response.analysis);
    } catch (err) {
      setAnalyzeError(
        err instanceof Error ? err.message : "Erreur lors de l'analyse"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleAnalyze = (type: AnalysisType): void => {
    void performAnalyze(type);
  };

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr,1fr]">
      {/* Zone d'écriture */}
      <div className="writing-zone relative rounded-xl border-2 border-parchment-border/60 p-5 shadow-parchment-lg sm:p-7">
        <div className="mb-5 border-b border-parchment-border/40 pb-4">
          <h1 className="font-writing text-2xl font-bold text-parchment-text sm:text-3xl break-words leading-tight">
            {title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-writing text-xs text-neutral-textSecondary sm:text-sm">
              <span className="inline-block font-medium">
                Style : {document.style.name}
              </span>
              <span className="mx-2 text-parchment-border">•</span>
              <span className="inline-block">
                {content.split(/\s+/).filter(Boolean).length} mots
              </span>
            </p>
            <VersionHistory
              documentId={document.id}
              onRestored={(restoredTitle, restoredContent) => {
                setTitle(restoredTitle);
                setContent(restoredContent);
              }}
            />
          </div>
          <div className="mt-3">
            <TagPicker documentId={document.id} />
          </div>
        </div>

        <textarea
          value={content}
          onChange={handleContentChange}
          rows={15}
          className="writing-editor font-writing w-full resize-none rounded-lg border-2 border-parchment-border/50 px-4 py-3 text-sm leading-relaxed focus:border-parchment-border focus:outline-none focus:ring-2 focus:ring-parchment-shadow/50 focus:ring-offset-2 sm:px-5 sm:py-4 sm:text-base sm:leading-relaxed sm:rows-20"
          placeholder="Commencez à écrire..."
        />

        <div className="mt-4 flex items-center justify-between border-t border-parchment-border/40 pt-3">
          <p className="font-writing text-xs italic text-neutral-textSecondary">
            {updateMutation.isPending
              ? 'Sauvegarde...'
              : getSaveLabel(updateMutation.isSuccess)}
          </p>
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-parchment-bg/95 backdrop-blur-md">
            <Spinner />
            <p className="font-writing text-base font-medium text-ai-primary">
              Analyse IA en cours...
            </p>
          </div>
        )}
      </div>

      {/* Panel latéral avec onglets Analyse / Chat */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {/* Onglets */}
        <div className="mb-3 flex gap-1 rounded-xl border border-ai-primary/20 bg-white/60 p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`font-interface flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeTab === 'analyze'
                ? 'bg-gradient-to-r from-ai-primary to-ai-primaryAlt text-white shadow-sm'
                : 'text-neutral-textSecondary hover:text-ai-primary'
            }`}
          >
            <Wand2 size={13} />
            Analyser
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`font-interface flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-ai-primary to-ai-primaryAlt text-white shadow-sm'
                : 'text-neutral-textSecondary hover:text-ai-primary'
            }`}
          >
            <Bot size={13} />
            Chat IA
          </button>
        </div>

        {/* Contenu de l'onglet */}
        <div className="rounded-xl border border-ai-primary/20 bg-white/60 p-4 backdrop-blur-sm shadow-sm">
          {activeTab === 'analyze' ? (
            <AIAnalysisPanel
              loading={isAnalyzing}
              analysis={analysis}
              error={analyzeError}
              onAnalyze={handleAnalyze}
            />
          ) : (
            <ChatPanel documentId={document.id} />
          )}
        </div>
      </div>
    </div>
  );
}
