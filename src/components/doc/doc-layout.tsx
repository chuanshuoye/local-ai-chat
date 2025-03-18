import { ReactNode } from 'react';

interface DocLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function DocLayout({ sidebar, children }: DocLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {sidebar}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
} 