import { useEffect, useRef, useState, useCallback } from 'react';
import { createConsumer, Consumer, Subscription } from '@rails/actioncable';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebSocketOptions {
  channelName: string;
  channelParams?: Record<string, any>;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReceived?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (action: string, data: any) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export function useWebSocket({
  channelName,
  channelParams = {},
  onConnected,
  onDisconnected,
  onReceived,
  onError,
}: UseWebSocketOptions): UseWebSocketReturn {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const consumerRef = useRef<Consumer | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    if (consumerRef.current) {
      consumerRef.current.disconnect();
      consumerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!token) {
      onError?.(new Error('認証トークンがありません'));
      return;
    }

    try {
      // WebSocket URLにトークンを含める
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${encodeURIComponent(token)}`;
      
      // Action Cableコンシューマーを作成
      const consumer = createConsumer(wsUrl);
      consumerRef.current = consumer;

      // チャンネルにサブスクライブ
      const subscription = consumer.subscriptions.create(
        {
          channel: channelName,
          ...channelParams,
        },
        {
          connected() {
            setIsConnected(true);
            onConnected?.();
          },

          disconnected() {
            setIsConnected(false);
            onDisconnected?.();
          },

          received(data: any) {
            onReceived?.(data);
          },
        }
      );

      subscriptionRef.current = subscription;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('WebSocket接続エラー');
      onError?.(err);
      setIsConnected(false);
    }
  }, [token, channelName, channelParams, onConnected, onDisconnected, onReceived, onError]);

  const sendMessage = useCallback((action: string, data: any) => {
    if (!subscriptionRef.current) {
      onError?.(new Error('WebSocket接続がありません'));
      return;
    }

    try {
      subscriptionRef.current.perform(action, data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('メッセージ送信エラー');
      onError?.(err);
    }
  }, [onError]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect,
  };
}