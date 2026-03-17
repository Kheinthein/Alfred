import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIChatMessage,
  IAIServicePort,
  ProgressionSuggestionResult,
  StyleAnalysisResult,
  SyntaxAnalysisResult,
} from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';

/**
 * Adapter pour le service Google Gemini
 * Implémente IAIServicePort
 */
export class GeminiAdapter implements IAIServicePort {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
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

    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Pas de contenu dans la réponse');
    }

    return this.parseJSON(content);
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

    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Pas de contenu dans la réponse');
    }

    return this.parseJSON(content);
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

    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
    });

    const result = await generativeModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const content = response.text();

    if (!content) {
      throw new Error('Pas de contenu dans la réponse');
    }

    // Log de debug pour voir la réponse brute
    console.log('📝 Réponse brute de Gemini (suggestProgression):');
    console.log(content);
    console.log('---');

    return this.parseJSON(content);
  }

  async summarize(text: string, maxWords: number): Promise<string> {
    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
    });

    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Résume ce texte en maximum ${maxWords} mots:\n\n${text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response;
    return response.text().trim();
  }

  async chat(
    messages: AIChatMessage[],
    documentContext: string
  ): Promise<string> {
    const systemInstruction = `Tu es Alfred, un assistant littéraire expert et bienveillant. Tu aides les écrivains à améliorer leur texte.
Tu as accès au document en cours que l'utilisateur est en train d'écrire. Base tes réponses sur ce contenu pour donner des conseils personnalisés et pertinents.

Document en cours :
---
${documentContext.substring(0, 3000)}
---

Réponds en français, de façon concise et utile.`;

    const generativeModel = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = generativeModel.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);

    return result.response.text().trim();
  }

  /**
   * Parse le JSON de la réponse Gemini
   * Extrait le JSON même s'il y a du texte avant/après
   */
  private parseJSON<T>(text: string): T {
    console.log('🔍 Tentative de parsing JSON...');
    console.log('Texte original:', text.substring(0, 200) + '...');

    // Retirer les balises de code markdown si présentes
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    console.log(
      'Après nettoyage markdown:',
      cleanText.substring(0, 200) + '...'
    );

    // Essayer de trouver un bloc JSON dans le texte
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Aucun JSON trouvé dans la réponse !');
      console.error('Texte complet reçu:', text);
      throw new Error('Aucun JSON trouvé dans la réponse');
    }

    console.log('✅ JSON trouvé:', jsonMatch[0].substring(0, 100) + '...');

    try {
      const parsed = JSON.parse(jsonMatch[0]) as T;
      console.log('✅ JSON parsé avec succès');
      return parsed;
    } catch (error) {
      console.error('❌ Erreur de parsing JSON:', error);
      console.error('JSON qui a échoué:', jsonMatch[0]);
      throw new Error(
        `Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
