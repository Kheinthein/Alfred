import { Spinner } from '@components/Spinner';
import { AIAnalysisDTO, AnalysisType } from '@shared/types';

interface AIAnalysisPanelProps {
  loading: boolean;
  analysis: AIAnalysisDTO | null;
  onAnalyze: (type: AnalysisType) => void;
}

const labels: Record<AnalysisType, string> = {
  syntax: 'Analyse syntaxe',
  style: 'Analyse style',
  progression: 'Suggestions progression',
};

export function AIAnalysisPanel({
  loading,
  analysis,
  onAnalyze,
}: AIAnalysisPanelProps) {
  return (
    <div className="ai-zone font-interface rounded-xl border-2 border-ai-primary/20 bg-gradient-to-br from-ai-bgPure to-ai-bg pt-7 p-5 shadow-lg sm:p-6 sm:pt-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-ai-primary to-ai-accent shadow-sm"></div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-ai-primary to-ai-primaryAlt bg-clip-text text-transparent sm:text-xl">
          Assistant IA
        </h3>
      </div>
      <p className="mb-5 text-xs text-ai-text/70 sm:text-sm">
        Sélectionnez une analyse pour obtenir des suggestions.
      </p>

      <div className="grid gap-2.5 sm:gap-3">
        {(Object.keys(labels) as AnalysisType[]).map((type) => (
          <button
            key={type}
            disabled={loading}
            onClick={() => onAnalyze(type)}
            className="group relative w-full overflow-hidden rounded-lg border-2 border-ai-primary/30 bg-white px-4 py-3 text-left text-sm font-semibold text-ai-primary transition-all hover:border-ai-primary hover:bg-gradient-to-r hover:from-ai-primary/10 hover:to-ai-accent/10 hover:shadow-md disabled:cursor-wait disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2 sm:py-3"
          >
            <span className="relative z-10">{labels[type]}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-ai-primary/5 to-ai-accent/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        ))}
      </div>

      {loading && (
        <div className="mt-5 flex items-center gap-3 rounded-lg bg-ai-primary/10 px-4 py-3">
          <Spinner size="sm" />
          <span className="text-sm font-medium text-ai-primary">
            Analyse en cours...
          </span>
        </div>
      )}

      {analysis ? (
        <div className="mt-5 rounded-lg border border-ai-primary/20 bg-white p-4">
          <div className="mb-3 flex flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <span className="font-semibold text-ai-primary">
              Confiance : {(analysis.confidence * 100).toFixed(0)}%
            </span>
            <span className="text-ai-text/60">
              {new Date(analysis.createdAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <ul className="space-y-2.5 text-sm text-ai-text">
            {analysis.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-gradient-to-r from-ai-bg to-ai-primary/5 border-l-4 border-ai-accent p-3 text-xs sm:p-3.5 sm:text-sm"
              >
                <span className="mt-0.5 flex-shrink-0 text-ai-accent">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && (
          <p className="mt-5 text-center text-xs text-ai-text/50 sm:text-sm">
            Aucune suggestion pour le moment.
          </p>
        )
      )}
    </div>
  );
}
