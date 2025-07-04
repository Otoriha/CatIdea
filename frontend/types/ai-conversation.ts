export interface Message {
  id: string;
  ai_conversation_id: string;
  sender_type: 'user' | 'ai';
  content: string;
  input_tokens?: number;
  output_tokens?: number;
  cost?: number;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  pain_point_id: string;
  status: 'active' | 'completed' | 'error' | 'cost_limit_reached';
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  type: 'message' | 'stream' | 'error' | 'typing' | 'stop_typing';
  content?: string;
  message?: Message;
  message_id?: string;
  error?: string;
}