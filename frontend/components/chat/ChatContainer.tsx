'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from '@/lib/hooks/useWebSocket';
import { Message, AiConversation, ChatMessage } from '@/types/ai-conversation';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { painPointsApi, type PainPoint } from '@/lib/api/pain-points';
import CreateIdeaModal from '@/components/CreateIdeaModal';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';

interface ChatContainerProps {
  painPointId: string;
}

export default function ChatContainer({ painPointId }: ChatContainerProps) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<AiConversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [streamingContent, setStreamingContent] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [relatedPainPoints, setRelatedPainPoints] = useState<PainPoint[]>([]);
  const [showCreateIdeaModal, setShowCreateIdeaModal] = useState(false);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const shouldConnect = !!conversation && !!token;
  
  console.log('ChatContainer state:', {
    conversation,
    token: token ? 'exists' : 'missing',
    shouldConnect
  });
  
  const { isConnected, sendMessage: sendWebSocketMessage } = useWebSocket({
    channelName: 'ConversationChannel',
    channelParams: shouldConnect ? { conversation_id: conversation.id } : {},
    onConnected: () => {
      console.log('WebSocket connected');
      setError(null);
    },
    onDisconnected: () => {
      console.log('WebSocket disconnected');
    },
    onReceived: (data: ChatMessage) => {
      handleWebSocketMessage(data);
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setError('接続エラーが発生しました');
    },
  });

  const handleWebSocketMessage = useCallback((data: ChatMessage) => {
    console.log('WebSocket message received:', data);
    
    switch (data.type) {
      case 'connection_established':
        console.log('Connection established for conversation:', data);
        // conversationのstatusがerrorの場合、エラーメッセージを表示
        if (data.status === 'error') {
          setError('AI会話でエラーが発生しました。新しい会話を開始してください。');
        }
        break;

      case 'message':
      case 'ai_message':
      case 'user_message':
        if (data.message) {
          setMessages(prev => [...prev, data.message!]);
          setIsTyping(false);
          setStreamingContent(prev => {
            const { [data.message!.id]: _removed, ...rest } = prev;
            return rest;
          });
        }
        break;

      case 'stream':
        if (data.message_id && data.content) {
          setStreamingContent(prev => ({
            ...prev,
            [data.message_id!]: (prev[data.message_id!] || '') + data.content!,
          }));
        }
        break;

      case 'typing':
        setIsTyping(true);
        break;

      case 'stop_typing':
        setIsTyping(false);
        break;

      case 'error':
        setError(data.error || 'エラーが発生しました');
        setIsTyping(false);
        setIsSending(false);
        break;
    }
  }, []);


  useEffect(() => {
    // 既に初期化済みの場合はスキップ
    if (initializedRef.current || !token) return;
    
    const initializeChat = async () => {
      console.log('Creating new conversation...');
      try {
        const response = await apiClient.post(`/pain_points/${painPointId}/ai_conversations`, {});
        console.log('createConversation response:', response.data);
        setConversation(response.data);
        initializedRef.current = true;
      } catch (error) {
        console.error('initializeChat error:', error);
        setError('チャットの初期化に失敗しました');
      }
    };

    console.log('Initializing chat for painPointId:', painPointId);
    initializeChat();
  }, []); // 空の依存配列で、コンポーネントマウント時のみ実行

  // 関連ペインポイントを取得
  useEffect(() => {
    const fetchRelatedPainPoints = async () => {
      try {
        const response = await painPointsApi.getRelatedPainPoints(painPointId, 5);
        setRelatedPainPoints(response.related_pain_points);
      } catch (error) {
        console.error('Failed to fetch related pain points:', error);
      }
    };

    fetchRelatedPainPoints();
  }, [painPointId]);

  const handleSendMessage = async (content: string) => {
    if (!conversation || !isConnected || isSending) return;

    setIsSending(true);
    setError(null);

    try {
      // ユーザーメッセージを即座に表示
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        ai_conversation_id: conversation.id,
        sender_type: 'user',
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, tempUserMessage]);

      // WebSocket経由でメッセージを送信
      sendWebSocketMessage('send_message', { 
        content,
        conversation_id: conversation.id 
      });

      // タイピングインジケーターを表示
      setIsTyping(true);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('メッセージの送信に失敗しました');
      // 失敗時はユーザーメッセージを削除
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-')));
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateIdea = (painPoint: PainPoint) => {
    setSelectedPainPoint(painPoint);
    setShowCreateIdeaModal(true);
  };

  return (
    <div className="flex h-full">
      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">AI アシスタント</h3>
            {conversation && (
              <button
                onClick={() => handleCreateIdea({ id: Number(painPointId), title: '現在のペインポイント' } as PainPoint)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                アイディアに昇華
              </button>
            )}
          </div>
          {conversation && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? '接続中' : '切断'}
              </span>
            </div>
          )}
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            streamingContent={streamingContent[message.id]}
          />
        ))}

        {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* 入力エリア */}
        <div className="px-6 py-4 border-t border-gray-200">
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isConnected || isSending || conversation?.status === 'cost_limit_reached'}
            placeholder={
              conversation?.status === 'cost_limit_reached'
                ? '月額の利用上限に達しました'
                : !isConnected
                ? '接続中...'
                : 'メッセージを入力...'
            }
          />
        </div>
      </div>

      {/* 関連ペインポイントサイドバー */}
      {relatedPainPoints.length > 0 && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">関連するペインポイント</h3>
          <div className="space-y-3">
            {relatedPainPoints.map((painPoint) => (
              <div key={painPoint.id} className="bg-white rounded-lg p-3 shadow-sm">
                <Link
                  href={`/pain-points/${painPoint.id}`}
                  className="block hover:bg-gray-50 -m-3 p-3 rounded-lg transition-colors"
                >
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {painPoint.title}
                  </h4>
                  {painPoint.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {painPoint.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      重要度: {painPoint.importance}/5
                    </span>
                    <span className="text-xs text-gray-500">
                      緊急度: {painPoint.urgency}/5
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => handleCreateIdea(painPoint)}
                  className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  <Lightbulb className="w-3 h-3" />
                  アイディアに昇華
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アイディア作成モーダル */}
      {selectedPainPoint && (
        <CreateIdeaModal
          painPointId={selectedPainPoint.id}
          painPointTitle={selectedPainPoint.title}
          isOpen={showCreateIdeaModal}
          onClose={() => {
            setShowCreateIdeaModal(false);
            setSelectedPainPoint(null);
          }}
          fromConversation={true}
        />
      )}
    </div>
  );
}