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
import AiProcessingModal from '@/components/AiProcessingModal';
import Link from 'next/link';
import { Lightbulb, Sparkles } from 'lucide-react';

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
  const [showAiProcessingModal, setShowAiProcessingModal] = useState(false);
  const [selectedPainPoint, setSelectedPainPoint] = useState<PainPoint | null>(null);
  const [currentPainPoint, setCurrentPainPoint] = useState<PainPoint | null>(null);
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
        if (data.message) {
          setMessages(prev => [...prev, data.message!]);
          setIsTyping(false);
          setStreamingContent(prev => {
            const { [data.message!.id]: _removed, ...rest } = prev;
            return rest;
          });
        }
        break;
        
      case 'user_message':
        if (data.message) {
          // 一時メッセージを実際のメッセージで置き換える
          setMessages(prev => prev.map(msg => 
            msg.id.startsWith('temp-') && msg.content === data.message!.content
              ? data.message!
              : msg
          ));
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

  // 関連ペインポイントと現在のペインポイントを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 現在のペインポイントを取得
        const currentResponse = await apiClient.get(`/pain_points/${painPointId}`);
        setCurrentPainPoint(currentResponse.data.pain_point);
        
        // 関連ペインポイントを取得
        const relatedResponse = await painPointsApi.getRelatedPainPoints(painPointId, 5);
        setRelatedPainPoints(relatedResponse.related_pain_points);
      } catch (error) {
        console.error('Failed to fetch pain points:', error);
      }
    };

    fetchData();
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

  const handleAiProcess = (painPoint: PainPoint) => {
    setSelectedPainPoint(painPoint);
    setShowAiProcessingModal(true);
  };

  return (
    <div className="flex h-full">
      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col bg-card rounded-lg shadow-lg border border-border">
        {/* ヘッダー */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-foreground">AI アシスタント</h3>
            {conversation && currentPainPoint && (
              <button
                onClick={() => handleAiProcess(currentPainPoint)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI自動処理
              </button>
            )}
          </div>
          {conversation && (
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isConnected ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-destructive/10 text-destructive'
              }`}>
                {isConnected ? '接続中' : '切断'}
              </span>
            </div>
          )}
        </div>

        {/* メッセージエリア */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
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
        <div className="px-6 py-4 border-t border-border bg-secondary/20">
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
        <div className="w-80 bg-secondary/10 border-l border-border p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-foreground mb-4">関連するペインポイント</h3>
          <div className="space-y-3">
            {relatedPainPoints.map((painPoint) => (
              <div key={painPoint.id} className="bg-card rounded-lg p-3 shadow-sm border border-border">
                <Link
                  href={`/pain-points/${painPoint.id}`}
                  className="block hover:bg-accent/10 -m-3 p-3 rounded-lg transition-colors"
                >
                  <h4 className="font-medium text-card-foreground mb-1 line-clamp-2">
                    {painPoint.title}
                  </h4>
                  {painPoint.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {painPoint.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      重要度: {painPoint.importance}/5
                    </span>
                    <span className="text-xs text-muted-foreground">
                      緊急度: {painPoint.urgency}/5
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => handleAiProcess(painPoint)}
                  className="mt-2 w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  AI自動処理
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アイディア作成モーダル */}
      {selectedPainPoint && (
        <>
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
          <AiProcessingModal
            isOpen={showAiProcessingModal}
            onClose={() => {
              setShowAiProcessingModal(false);
              setSelectedPainPoint(null);
            }}
            painPointId={selectedPainPoint.id}
            painPointTitle={selectedPainPoint.title}
            painPointDescription={selectedPainPoint.description}
            currentProcessCount={selectedPainPoint.ai_process_count || 0}
            onProcessComplete={() => {
              // 処理完了後に現在のペインポイントを再取得
              const fetchCurrentPainPoint = async () => {
                try {
                  const response = await apiClient.get(`/pain_points/${painPointId}`);
                  setCurrentPainPoint(response.data.pain_point);
                } catch (error) {
                  console.error('Failed to refresh pain point:', error);
                }
              };
              fetchCurrentPainPoint();
            }}
          />
        </>
      )}
    </div>
  );
}