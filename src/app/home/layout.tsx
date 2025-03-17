import { DocLayout } from '@/components/doc-layout';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Documentation | Next.js React AI',
  description: 'Technical documentation for Next.js React AI project',
};

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <DocLayout>{children}</DocLayout>;
} 