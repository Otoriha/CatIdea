import { useEffect, useRef, useState, useCallback } from 'react';
import { createConsumer, Consumer, Subscription } from '@rails/actioncable';
import { useAuth } from '@/contexts/AuthContext';

interface UseWebSocketOptions {
  channelName: string;
  channelParams?: Record<string, unknown>;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onReceived?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (action: string, data: unknown) => void;
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
  const channelParamsRef = useRef(channelParams);
  const callbacksRef = useRef({ onConnected, onDisconnected, onReceived, onError });

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

  // コールバックを最新の値に更新
  useEffect(() => {
    callbacksRef.current = { onConnected, onDisconnected, onReceived, onError };
  }, [onConnected, onDisconnected, onReceived, onError]);

  const connect = useCallback(() => {
    if (!token) {
      callbacksRef.current.onError?.(new Error('認証トークンがありません'));
      return;
    }

    try {
      // WebSocket URLにトークンを含める
      // NEXT_PUBLIC_WS_URL が設定されていない場合は、NEXT_PUBLIC_API_URL から自動生成する
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
      // API エンドポイント（例: http://localhost:3000/api/v1）を WebSocket エンドポイント（例: ws://localhost:3000/cable）へ変換
      const apiOrigin = apiBaseUrl.replace(/\/?api(?:\/v\d+)?$/, '');
      const fallbackWsBase = apiOrigin.replace(/^http/, 'ws') + '/cable';
      const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL || fallbackWsBase;
      const wsUrl = `${wsBaseUrl}?token=${encodeURIComponent(token)}`;
      
      // Action Cableコンシューマーを作成
      const consumer = createConsumer(wsUrl);
      consumerRef.current = consumer;

      // チャンネルにサブスクライブ
      console.log('Creating subscription with params:', {
        channel: channelName,
        ...channelParamsRef.current,
      });
      
      const subscription = consumer.subscriptions.create(
        {
          channel: channelName,
          ...channelParamsRef.current,
        },
        {
          connected() {
            console.log('Channel connected!');
            setIsConnected(true);
            callbacksRef.current.onConnected?.();
          },

          disconnected() {
            console.log('Channel disconnected!');
            setIsConnected(false);
            callbacksRef.current.onDisconnected?.();
          },

          received(data: unknown) {
            console.log('Data received from channel:', data);
            callbacksRef.current.onReceived?.(data);
          },
        }
      );

      subscriptionRef.current = subscription;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('WebSocket接続エラー');
      callbacksRef.current.onError?.(err);
      setIsConnected(false);
    }
  }, [token, channelName]); // 依存配列を最小限に

  const sendMessage = useCallback((action: string, data: unknown) => {
    if (!subscriptionRef.current) {
      callbacksRef.current.onError?.(new Error('WebSocket接続がありません'));
      return;
    }

    try {
      subscriptionRef.current.perform(action, data);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('メッセージ送信エラー');
      callbacksRef.current.onError?.(err);
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [disconnect, connect]);

  // channelParamsの変更を検知して再接続
  useEffect(() => {
    console.log('useWebSocket effect triggered with:', {
      channelParams,
      token: token ? 'exists' : 'missing',
      channelName
    });
    
    const hasValidParams = channelParams && 
                          Object.keys(channelParams).length > 0 && 
                          Object.values(channelParams).every(v => v !== undefined && v !== null);
    
    console.log('hasValidParams:', hasValidParams);
    
    channelParamsRef.current = channelParams;
    
    if (hasValidParams && token) {
      console.log('Attempting to connect...');
      // 既存の接続があれば切断してから再接続
      if (subscriptionRef.current) {
        disconnect();
        setTimeout(() => {
          connect();
        }, 100);
      } else {
        connect();
      }
    } else {
      console.log('Not connecting because:', {
        hasValidParams,
        hasToken: !!token
      });
    }

    return () => {
      disconnect();
    };
  }, [channelParams?.conversation_id, token]); // conversation_idが変わったら再接続

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect,
  };
}