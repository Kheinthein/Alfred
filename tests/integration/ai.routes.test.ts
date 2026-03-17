/** @jest-environment node */

import { POST as AnalyzeRoute } from '@/app/api/ai/analyze/route';
import { POST as RegisterRoute } from '@/app/api/auth/register/route';
import { POST as DocumentsPostRoute } from '@/app/api/documents/route';
import { container } from '@/container';
import { IAIServicePort } from '@modules/ai-assistant/domain/repositories/IAIServicePort';
import { getAnyStyleId } from './setupDb';
import { createJsonRequest, parseJson, uniqueEmail } from './utils';

const mockAIService: IAIServicePort = {
  analyzeSyntax: jest.fn().mockResolvedValue({
    errors: [],
    suggestions: ['Parfait !'],
    confidence: 0.95,
  }),
  analyzeStyle: jest.fn(),
  suggestProgression: jest.fn(),
  summarize: jest.fn(),
};

beforeAll(() => {
  if (container.isBound('IAIServicePort')) {
    container
      .rebind<IAIServicePort>('IAIServicePort')
      .toConstantValue(mockAIService);
  } else {
    container
      .bind<IAIServicePort>('IAIServicePort')
      .toConstantValue(mockAIService);
  }
});

describe('AI API Routes', () => {
  async function createUserWithDocument(): Promise<{
    token: string;
    documentId: string;
  }> {
    const credentials = { email: uniqueEmail('ai'), password: 'SecurePass123' };

    const registerResponse = await RegisterRoute(
      createJsonRequest('/api/auth/register', 'POST', credentials)
    );
    const registerBody = await parseJson<{ data: { token: string } }>(
      registerResponse
    );

    const styleId = await getAnyStyleId();

    const createDocResponse = await DocumentsPostRoute(
      createJsonRequest(
        '/api/documents',
        'POST',
        { title: 'Doc IA', content: 'Texte à analyser', styleId },
        { Authorization: `Bearer ${registerBody.data.token}` }
      )
    );

    if (createDocResponse.status !== 201) {
      const errorText = await createDocResponse.text();
      throw new Error(
        `Document creation failed (${createDocResponse.status}): ${errorText}`
      );
    }

    const createDocBody = await parseJson<{
      data: { document: { id: string } };
    }>(createDocResponse);

    return {
      token: registerBody.data.token,
      documentId: createDocBody.data.document.id,
    };
  }

  it("retourne des suggestions d'analyse syntaxique", async () => {
    const { token, documentId } = await createUserWithDocument();

    const response = await AnalyzeRoute(
      createJsonRequest(
        '/api/ai/analyze',
        'POST',
        { documentId, analysisType: 'syntax' },
        { Authorization: `Bearer ${token}` }
      )
    );

    expect(response.status).toBe(200);

    const body = await parseJson<{
      data: { analysis: { suggestions: string[] } };
    }>(response);

    expect(body.data.analysis.suggestions).toContain('Parfait !');
    expect(
      (mockAIService.analyzeSyntax as jest.Mock).mock.calls.length
    ).toBeGreaterThan(0);
  });
});
