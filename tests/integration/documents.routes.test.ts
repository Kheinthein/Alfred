/** @jest-environment node */

import { POST as RegisterRoute } from '@/app/api/auth/register/route';
import { POST as ReorderRoute } from '@/app/api/documents/reorder/route';
import {
  GET as DocumentsGetRoute,
  POST as DocumentsPostRoute,
} from '@/app/api/documents/route';
import { getAnyStyleId } from './setupDb';
import { createJsonRequest, parseJson, uniqueEmail } from './utils';

describe('Documents API Routes', () => {
  async function createAuthenticatedUser(): Promise<{ token: string }> {
    const payload = {
      email: uniqueEmail('doc'),
      password: 'SecurePass123',
    };

    const response = await RegisterRoute(
      createJsonRequest('/api/auth/register', 'POST', payload)
    );
    const body = await parseJson<{ data: { token: string } }>(response);
    return { token: body.data.token };
  }

  it('crée un document et le retourne dans la liste', async () => {
    const { token } = await createAuthenticatedUser();
    const styleId = await getAnyStyleId();

    const createResponse = await DocumentsPostRoute(
      createJsonRequest(
        '/api/documents',
        'POST',
        {
          title: 'Chapitre 1',
          content: 'Il était une fois...',
          styleId,
        },
        { Authorization: `Bearer ${token}` }
      )
    );

    expect(createResponse.status).toBe(201);

    const listResponse = await DocumentsGetRoute(
      createJsonRequest('/api/documents', 'GET', undefined, {
        Authorization: `Bearer ${token}`,
      })
    );

    expect(listResponse.status).toBe(200);

    const body = await parseJson<{
      data: { documents: Array<{ title: string }> };
    }>(listResponse);
    expect(body.data.documents).toHaveLength(1);
    expect(body.data.documents[0].title).toBe('Chapitre 1');
  });

  it('permet de réordonner les documents', async () => {
    const { token } = await createAuthenticatedUser();
    const styleId = await getAnyStyleId();

    const createDocument = async (title: string): Promise<Response> =>
      DocumentsPostRoute(
        createJsonRequest(
          '/api/documents',
          'POST',
          { title, content: 'Texte', styleId },
          { Authorization: `Bearer ${token}` }
        )
      );

    const docAResponse = await createDocument('Doc A');
    const docBResponse = await createDocument('Doc B');
    const docABody = await parseJson<{ data: { document: { id: string } } }>(
      docAResponse
    );
    const docBBody = await parseJson<{ data: { document: { id: string } } }>(
      docBResponse
    );

    const reorderResponse = await ReorderRoute(
      createJsonRequest(
        '/api/documents/reorder',
        'POST',
        { documentIds: [docBBody.data.document.id, docABody.data.document.id] },
        { Authorization: `Bearer ${token}` }
      )
    );

    expect(reorderResponse.status).toBe(200);

    const listResponse = await DocumentsGetRoute(
      createJsonRequest('/api/documents', 'GET', undefined, {
        Authorization: `Bearer ${token}`,
      })
    );
    const listBody = await parseJson<{
      data: { documents: Array<{ id: string; title: string }> };
    }>(listResponse);

    expect(listBody.data.documents.map((doc) => doc.title)).toEqual([
      'Doc B',
      'Doc A',
    ]);
  });

  it('refuse la création sans jeton', async () => {
    const styleId = await getAnyStyleId();

    const response = await DocumentsPostRoute(
      createJsonRequest('/api/documents', 'POST', {
        title: 'Sans auth',
        content: 'Impossible',
        styleId,
      })
    );

    expect(response.status).toBe(401);
  });
});
