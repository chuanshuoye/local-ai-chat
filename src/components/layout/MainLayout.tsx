import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  path: string;
}

const navItems: NavItem[] = [
  { key: 'chat', label: '对话', icon: '💬', path: '/chat' },
  { key: 'agents', label: 'Agent管理', icon: '🤖', path: '/agents' },
  { key: 'workflow', label: '工作流编辑', icon: '⚙️', path: '/workflow' },
  { key: 'workflow-manage', label: '工作流管理', icon: '📋', path: '/workflow/manage' },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 左侧导航 */}
      <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Local AI Chat</h1>
          <ThemeToggle />
        </div>
        <ul className="space-y-1 p-4">
          {navItems.map((item) => (
            <li key={item.key}>
              <Link 
                href={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.path 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 