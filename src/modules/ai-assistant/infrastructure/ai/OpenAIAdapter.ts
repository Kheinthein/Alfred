import OpenAI from 'openai';
import {
  AIChatMessage,
  IAIServicePort,
  ProgressionSuggestionResult,
  StyleAnalysisResult,
  SyntaxAnalysisResult,
} from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';

/**
 * Adapter pour le service OpenAI (GPT)
 * Implémente IAIServicePort - alternative à Claude
 */
export class OpenAIAdapter implements IAIServicePort {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4-turbo') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async analyzeSyntax(text: string): Promise<SyntaxAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'Tu es un expert en correction de textes français. Retourne uniquement du JSON valide.',
        },
        {
          role: 'user',
          content: `Analyse la syntaxe de ce texte: "${text}". Retourne JSON: {errors: [{message, position}], suggestions: [], confidence: 0-1}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Pas de contenu dans la réponse');

    return JSON.parse(content) as SyntaxAnalysisResult;
  }

  async analyzeStyle(
    text: string,
    targetStyle: WritingStyle
  ): Promise<StyleAnalysisResult> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'Tu es un expert en analyse littéraire. Retourne uniquement du JSON valide.',
        },
        {
          role: 'user',
          content: `Analyse le style de "${text}" par rapport au style "${targetStyle.name}: ${targetStyle.description}". JSON: {tone, vocabulary, suggestions: [], alignmentScore: 0-1}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Pas de contenu dans la réponse');

    return JSON.parse(content) as StyleAnalysisResult;
  }

  async suggestProgression(
    text: string,
    style: WritingStyle,
    context?: string
  ): Promise<ProgressionSuggestionResult> {
    const contextStr = context ? ` Contexte: ${context}` : '';

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en écriture créative pour le style "${style.name}". Retourne uniquement du JSON valide.`,
        },
        {
          role: 'user',
          content: `Suggère comment faire progresser ce texte: "${text}".${contextStr} JSON: {suggestions: [], reasoning: "", alternatives: []}`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Pas de contenu dans la réponse');

    return JSON.parse(content) as ProgressionSuggestionResult;
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

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content?.trim() ?? '';
  }

  async summarize(text: string, maxWords: number): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `Tu résumes des textes en maximum ${maxWords} mots.`,
        },
        { role: 'user', content: text },
      ],
    });

    return response.choices[0].message.content || '';
  }
}
