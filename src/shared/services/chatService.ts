import { ChatConversationDTO, ChatMessageDTO } from '@shared/types';
import { apiClient } from './apiClient';

export const chatService = {
  /**
   * Crée ou récupère la conversation pour un document donné
   */
  async getOrCreateConversation(
    documentId: string
  ): Promise<ChatConversationDTO> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { conversation: ChatConversationDTO };
    }>('/chat/conversations', { documentId });
    return data.data.conversation;
  },

  /**
   * Récupère l'historique des messages d'une conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessageDTO[]> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: { messages: ChatMessageDTO[] };
    }>(`/chat/conversations/${conversationId}/messages`);
    return data.data.messages;
  },

  /**
   * Envoie un message et retourne la réponse de l'IA
   */
  async sendMessage(
    conversationId: string,
    content: string
  ): Promise<{
    userMessage: ChatMessageDTO;
    assistantMessage: ChatMessageDTO;
  }> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { userMessage: ChatMessageDTO; assistantMessage: ChatMessageDTO };
    }>(`/chat/conversations/${conversationId}/messages`, { content });
    return data.data;
  },
};
