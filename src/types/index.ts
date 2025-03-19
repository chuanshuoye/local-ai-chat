import { MessageRole } from '@/constants';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachment?: {
    type: string;
    name: string;
    url: string;
    size: number;
  };
  metadata?: {
    model?: string;
    isStreaming?: boolean;
    rawJsonContent?: boolean;
    assistantId?: string;
    assistantName?: string;
    [key: string]: any;
  };
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  isSystem?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  assistantId?: string;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export { MessageRole }; 