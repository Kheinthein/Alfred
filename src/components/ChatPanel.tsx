'use client';

import { chatService } from '@shared/services/chatService';
import { ChatMessageDTO } from '@shared/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Send, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ChatPanelProps {
  readonly documentId: string;
}

export function ChatPanel({ documentId }: ChatPanelProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Créer ou récupérer la conversation au montage
  const { data: conversation, isLoading: isInitializing } = useQuery({
    queryKey: ['chat-conversation', documentId],
    queryFn: () => chatService.getOrCreateConversation(documentId),
    enabled: Boolean(documentId),
    staleTime: Infinity,
  });

  // Synchroniser le conversationId dès que la query retourne
  useEffect(() => {
    if (conversation?.id) setConversationId(conversation.id);
  }, [conversation?.id]);

  // Récupérer les messages
  const { data: messages = [] } = useQuery<ChatMessageDTO[]>({
    queryKey: ['chat-messages', conversationId],
    queryFn: () => chatService.getMessages(conversationId ?? ''),
    enabled: Boolean(conversationId),
  });

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage(conversationId ?? '', content),
    onSuccess: (data) => {
      queryClient.setQueryData<ChatMessageDTO[]>(
        ['chat-messages', conversationId],
        (prev = []) => [
          ...prev.filter(
            (m) =>
              m.id !== data.userMessage.id && m.id !== data.assistantMessage.id
          ),
          data.userMessage,
          data.assistantMessage,
        ]
      );
    },
  });

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || sendMutation.isPending || !conversationId) return;
    setInput('');
    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-textSecondary">
        Initialisation du chat...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* En-tête */}
      <div className="mb-3 flex items-center gap-2 border-b border-ai-primary/20 pb-3">
        <Bot size={18} className="text-ai-primary flex-shrink-0" />
        <div>
          <p className="font-interface text-sm font-semibold text-ai-primary">
            Alfred
          </p>
          <p className="font-interface text-xs text-neutral-textSecondary">
            Conseil personnalisé basé sur votre texte
          </p>
        </div>
      </div>

      {/* Fil de messages */}
      <div
        className="flex-1 overflow-y-auto space-y-3 pr-1"
        style={{ minHeight: 0, maxHeight: '320px' }}
      >
        {messages.length === 0 && !sendMutation.isPending && (
          <div className="py-6 text-center">
            <Bot size={32} className="mx-auto mb-2 text-ai-primary/30" />
            <p className="font-writing text-sm text-neutral-textSecondary">
              Posez une question sur votre texte...
            </p>
            <p className="font-writing mt-1 text-xs text-neutral-textSecondary/60">
              Exemple : &ldquo;Comment améliorer mon introduction ?&rdquo;
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full ${
                message.role === 'user'
                  ? 'bg-parchment-border/40'
                  : 'bg-ai-primary/15'
              }`}
            >
              {message.role === 'user' ? (
                <User size={14} className="text-parchment-text" />
              ) : (
                <Bot size={14} className="text-ai-primary" />
              )}
            </div>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-parchment-border/20 text-parchment-text font-writing'
                  : 'bg-ai-primary/10 text-parchment-text font-writing'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Indicateur "en train d'écrire" */}
        {sendMutation.isPending && (
          <div className="flex gap-2">
            <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-ai-primary/15">
              <Bot size={14} className="text-ai-primary" />
            </div>
            <div className="rounded-xl bg-ai-primary/10 px-3 py-2">
              <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-ai-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-ai-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-ai-primary animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie */}
      <div className="mt-3 border-t border-ai-primary/20 pt-3">
        {sendMutation.isError && (
          <p className="mb-2 font-interface text-xs text-action-error">
            Erreur lors de l&apos;envoi. Réessayez.
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Votre question... (Entrée pour envoyer)"
            rows={2}
            disabled={sendMutation.isPending || !conversationId}
            className="font-writing flex-1 resize-none rounded-lg border border-ai-primary/30 bg-white/50 px-3 py-2 text-sm text-parchment-text placeholder:text-neutral-textSecondary/50 focus:border-ai-primary focus:outline-none focus:ring-2 focus:ring-ai-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={
              !input.trim() || sendMutation.isPending || !conversationId
            }
            className="flex-shrink-0 flex h-full items-center justify-center rounded-lg bg-gradient-to-b from-ai-primary to-ai-primaryAlt px-3 text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ai-primary focus:ring-offset-2"
            aria-label="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-1.5 font-interface text-xs text-neutral-textSecondary/60">
          Maj+Entrée pour aller à la ligne
        </p>
      </div>
    </div>
  );
}
