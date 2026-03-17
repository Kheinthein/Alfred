import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiAdapter } from '@modules/ai-assistant/infrastructure/ai/GeminiAdapter';
import { WritingStyle } from '@modules/document/domain/entities/WritingStyle';

// Mock du SDK Google Generative AI
jest.mock('@google/generative-ai');

const MockedGoogleGenerativeAI = jest.mocked(GoogleGenerativeAI);

describe('GeminiAdapter', () => {
  let adapter: GeminiAdapter;
  const mockApiKey = 'AIzaSy_test_key';

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock de la réponse de l'API
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify({
            errors: [],
            suggestions: ['Suggestion test'],
            confidence: 0.95,
          }),
      },
    });

    // Mock du client Gemini
    MockedGoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent,
      }),
    }));

    adapter = new GeminiAdapter(mockApiKey);
  });

  describe('analyzeSyntax', () => {
    it('devrait analyser la syntaxe et retourner un résultat valide', async () => {
      const text = 'Ceci est un text avec une erreur.';

      const result = await adapter.analyzeSyntax(text);

      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('confidence');
      expect(Array.isArray(result.suggestions)).toBe(true);
      expect(typeof result.confidence).toBe('number');
    });

    it('devrait lancer une erreur si pas de contenu dans la réponse', async () => {
      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => null,
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);

      await expect(newAdapter.analyzeSyntax('test')).rejects.toThrow(
        'Pas de contenu dans la réponse'
      );
    });
  });

  describe('analyzeStyle', () => {
    it('devrait analyser le style et retourner un résultat valide', async () => {
      const text = 'Il était une fois dans un royaume lointain...';
      const style = new WritingStyle(
        'style-1',
        'Fantastique',
        'Style épique et merveilleux'
      );

      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () =>
                JSON.stringify({
                  tone: 'Épique',
                  vocabulary: 'Soutenu',
                  suggestions: ['Ajouter plus de descriptions'],
                  alignmentScore: 0.85,
                }),
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);
      const result = await newAdapter.analyzeStyle(text, style);

      expect(result).toHaveProperty('tone');
      expect(result).toHaveProperty('vocabulary');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('alignmentScore');
      expect(typeof result.alignmentScore).toBe('number');
    });
  });

  describe('suggestProgression', () => {
    it('devrait suggérer une progression narrative', async () => {
      const text = 'Le héros entre dans la forêt sombre.';
      const style = new WritingStyle(
        'style-1',
        'Fantastique',
        'Style épique et merveilleux'
      );

      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () =>
                JSON.stringify({
                  suggestions: [
                    'Décrire la créature mystérieuse',
                    'Introduire un obstacle',
                  ],
                  reasoning: 'Pour créer du suspense',
                  alternatives: ['Rencontre avec un allié'],
                }),
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);
      const result = await newAdapter.suggestProgression(text, style);

      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('reasoning');
      expect(result).toHaveProperty('alternatives');
      expect(Array.isArray(result.suggestions)).toBe(true);
    });

    it('devrait gérer le contexte optionnel', async () => {
      const text = 'Le héros entre dans la forêt.';
      const style = new WritingStyle('style-1', 'Fantastique', 'Épique');
      const context = "Le héros cherche l'épée légendaire";

      const mockGenerateContent = jest.fn().mockResolvedValue({
        response: {
          text: () =>
            JSON.stringify({
              suggestions: ["Rencontrer le gardien de l'épée"],
              reasoning: 'Lié à la quête',
              alternatives: ['Trouver des indices'],
            }),
        },
      });

      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: mockGenerateContent,
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);
      await newAdapter.suggestProgression(text, style, context);

      // Vérifier que le contexte est inclus dans le prompt
      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg.contents[0].parts[0].text).toContain(context);
    });
  });

  describe('summarize', () => {
    it('devrait générer un résumé du texte', async () => {
      const text =
        'Un long texte qui raconte une histoire complexe avec de nombreux personnages et rebondissements.';
      const maxWords = 10;

      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () =>
                'Histoire complexe avec personnages et rebondissements.',
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);
      const result = await newAdapter.summarize(text, maxWords);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('parseJSON', () => {
    it('devrait extraire le JSON des balises markdown', async () => {
      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () =>
                '```json\n{"errors": [], "suggestions": ["test"], "confidence": 0.9}\n```',
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);
      const result = await newAdapter.analyzeSyntax('test');

      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('suggestions');
      expect(result.confidence).toBe(0.9);
    });

    it('devrait lancer une erreur si aucun JSON trouvé', async () => {
      MockedGoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: () => ({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => 'Pas de JSON ici',
            },
          }),
        }),
      }));

      const newAdapter = new GeminiAdapter(mockApiKey);

      await expect(newAdapter.analyzeSyntax('test')).rejects.toThrow(
        'Aucun JSON trouvé dans la réponse'
      );
    });
  });
});
