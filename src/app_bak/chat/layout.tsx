import { ChatLayout } from '@/components/chat/chat-layout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'AI Chat | Next.js React AI',
  description: 'Chat with our AI assistant',
};

export default function ChatPageLayout({ children }: { children: ReactNode }) {
  return <ChatLayout>{children}</ChatLayout>;
} 