import { ReactNode } from 'react';
import { ChatSidebar } from './chat-sidebar';

interface ChatLayoutProps {
  children: ReactNode;
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-screen bg-white">
      <ChatSidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
} 