import { ReactNode } from 'react';
import { DocSidebar } from './doc-sidebar';

interface DocLayoutProps {
  children: ReactNode;
}

export function DocLayout({ children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DocSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  );
} 