import { AIAnalysisPanel } from '@components/AIAnalysisPanel';
import { AnalysisType } from '@shared/types';
import { fireEvent, screen } from '@testing-library/dom';
import { render } from '@testing-library/react';

describe('AIAnalysisPanel', () => {
  it('affiche un état vide par défaut', () => {
    render(
      <AIAnalysisPanel loading={false} analysis={null} onAnalyze={jest.fn()} />
    );
    expect(
      screen.getByText(/Aucune suggestion pour le moment/i)
    ).toBeInTheDocument();
  });

  it('affiche les suggestions retournées par l’IA', () => {
    render(
      <AIAnalysisPanel
        loading={false}
        onAnalyze={jest.fn()}
        analysis={{
          id: 'analysis-1',
          type: 'syntax',
          suggestions: ['Corriger la ponctuation.', 'Ajouter une transition.'],
          confidence: 0.85,
          createdAt: new Date().toISOString(),
        }}
      />
    );

    expect(screen.getByText(/Corriger la ponctuation/)).toBeInTheDocument();
    expect(screen.getByText(/Ajouter une transition/)).toBeInTheDocument();
  });

  it('déclenche onAnalyze quand on clique sur un bouton', () => {
    const onAnalyze = jest.fn();
    render(
      <AIAnalysisPanel loading={false} analysis={null} onAnalyze={onAnalyze} />
    );

    fireEvent.click(screen.getByRole('button', { name: /Analyse syntaxe/i }));

    expect(onAnalyze).toHaveBeenCalledWith('syntax' satisfies AnalysisType);
  });
});
