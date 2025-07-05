'use client';

import { Message } from '@/types/ai-conversation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface MessageBubbleProps {
  message: Message;
  streamingContent?: string;
}

export default function MessageBubble({ message, streamingContent }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user';
  const displayContent = streamingContent !== undefined ? streamingContent : message.content;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{displayContent}</p>
        
        <div className={`flex items-center gap-2 mt-1 text-xs ${
          isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          <time dateTime={message.created_at}>
            {format(new Date(message.created_at), 'HH:mm', { locale: ja })}
          </time>
          
          {message.cost !== undefined && message.cost > 0 && (
            <span className="opacity-75">
              ${message.cost.toFixed(6)}
            </span>
          )}
          
          {message.output_tokens && (
            <span className="opacity-75">
              {message.output_tokens} tokens
            </span>
          )}
        </div>
      </div>
    </div>
  );
}