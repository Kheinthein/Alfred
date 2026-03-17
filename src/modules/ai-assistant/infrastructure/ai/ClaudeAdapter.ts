import Anthropic from '@anthropic-ai/sdk';
import {
  AIChatMessage,
  IAIServicePort,
  ProgressionSuggestionResult,
  StyleAnalysisResult,
  SyntaxAnalysisResult,
} from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';

/**
 * Adapter pour le service Claude (Anthropic)
 * Implémente IAIServicePort
 */
export class ClaudeAdapter implements IAIServicePort {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async analyzeSyntax(text: string): Promise<SyntaxAnalysisResult> {
    const prompt = `Tu es un expert en correction de textes français. Analyse ce texte et identifie les erreurs de syntaxe, grammaire, ponctuation et orthographe.

Texte à analyser:
${text}

Retourne UNIQUEMENT un objet JSON avec cette structure exacte (pas de texte avant ou après):
{
  "errors": [{"message": "description de l'erreur", "position": 0}],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "confidence": 0.95
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse inattendue de Claude');
    }

    return this.parseJSON(content.text);
  }

  async analyzeStyle(
    text: string,
    targetStyle: WritingStyle
  ): Promise<StyleAnalysisResult> {
    const prompt = `Tu es un expert en analyse littéraire. Analyse le style d'écriture de ce texte par rapport au style cible "${targetStyle.name}".

Style cible: ${targetStyle.description}

Texte à analyser:
${text}

Retourne UNIQUEMENT un objet JSON avec cette structure exacte:
{
  "tone": "description du ton",
  "vocabulary": "description du vocabulaire",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "alignmentScore": 0.9
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse inattendue de Claude');
    }

    return this.parseJSON(content.text);
  }

  async suggestProgression(
    text: string,
    style: WritingStyle,
    context?: string
  ): Promise<ProgressionSuggestionResult> {
    const contextStr = context ? `\n\nContexte additionnel: ${context}` : '';

    const prompt = `Tu es un expert en écriture créative spécialisé dans le style "${style.name}". Analyse ce texte et suggère comment faire progresser le récit.${contextStr}

Texte actuel:
${text}

Retourne UNIQUEMENT un objet JSON avec cette structure exacte:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "reasoning": "explication de pourquoi ces suggestions",
  "alternatives": ["alternative 1", "alternative 2"]
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse inattendue de Claude');
    }

    return this.parseJSON(content.text);
  }

  async summarize(text: string, maxWords: number): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Résume ce texte en maximum ${maxWords} mots:\n\n${text}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Réponse inattendue de Claude');
    }

    return content.text.trim();
  }

  async chat(
    messages: AIChatMessage[],
    documentContext: string
  ): Promise<string> {
    const systemPrompt = `Tu es Alfred, un assistant littéraire expert et bienveillant. Tu aides les écrivains à améliorer leur texte.
Tu as accès au document en cours que l'utilisateur est en train d'écrire. Base tes réponses sur ce contenu pour donner des conseils personnalisés et pertinents.

Document en cours :
---
${documentContext.substring(0, 3000)}
---

Réponds en français, de façon concise et utile.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text')
      throw new Error('Réponse inattendue de Claude');
    return content.text.trim();
  }

  /**
   * Parse le JSON de la réponse Claude
   * Extrait le JSON même s'il y a du texte avant/après
   */
  private parseJSON<T>(text: string): T {
    // Essayer de trouver un bloc JSON dans le texte
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Aucun JSON trouvé dans la réponse');
    }

    try {
      return JSON.parse(jsonMatch[0]) as T;
    } catch (error) {
      throw new Error(
        `Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
