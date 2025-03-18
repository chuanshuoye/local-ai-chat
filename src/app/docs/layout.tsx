import { DocSidebar } from '@/components/doc/doc-sidebar';
import { DocLayout } from '@/components/doc/doc-layout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Documentation | Next.js React AI',
  description: 'Technical documentation for Next.js React AI project',
};

interface HomeLayoutProps {
  children: ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <DocLayout sidebar={<DocSidebar />}>
      {children}
    </DocLayout>
  );
} 