'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: '介绍',
    href: '/docs',
  },
  {
    title: '快速开始',
    href: '/docs/getting-started',
    children: [
      {
        title: '安装配置',
        href: '/docs/getting-started/installation',
      },
      {
        title: '基本用法',
        href: '/docs/getting-started/basic-usage',
      },
    ],
  },
  {
    title: '核心功能',
    href: '/docs/features',
    children: [
      {
        title: '对话管理',
        href: '/docs/features/chat-sessions',
      },
      {
        title: '助手市场',
        href: '/docs/features/assistants',
      },
      {
        title: '模型设置',
        href: '/docs/features/models',
      },
      {
        title: '流式响应',
        href: '/docs/features/streaming',
      },
      {
        title: '自定义助手',
        href: '/docs/features/custom-assistants',
      },
    ],
  },
  {
    title: '组件说明',
    href: '/docs/components',
    children: [
      {
        title: '聊天侧边栏',
        href: '/docs/components/chat-sidebar',
      },
      {
        title: '聊天界面',
        href: '/docs/components/chat-interface',
      },
      {
        title: '消息组件',
        href: '/docs/components/message',
      },
      {
        title: '输入组件',
        href: '/docs/components/input',
      },
    ],
  },
  {
    title: 'AI技术详解',
    href: '/docs/ai-tech',
    children: [
      {
        title: 'Ollama集成',
        href: '/docs/ai-tech/ollama',
      },
      {
        title: '流式生成',
        href: '/docs/ai-tech/streaming',
      },
      {
        title: '上下文管理',
        href: '/docs/ai-tech/context',
      },
      {
        title: '系统提示词',
        href: '/docs/ai-tech/system-prompts',
      },
    ],
  },
  {
    title: '状态管理',
    href: '/docs/state-management',
    children: [
      {
        title: '聊天存储',
        href: '/docs/state-management/chat-store',
      },
      {
        title: '持久化',
        href: '/docs/state-management/persistence',
      },
    ],
  },
  {
    title: '高级用法',
    href: '/docs/advanced',
    children: [
      {
        title: '性能优化',
        href: '/docs/advanced/performance',
      },
      {
        title: '自定义模型接入',
        href: '/docs/advanced/custom-models',
      },
    ],
  },
];

export function DocSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (href: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const isActive = pathname === item.href;
      const hasChildren = item.children && item.children.length > 0;
      const isOpen = openSections[item.href] || pathname.startsWith(item.href);

      return (
        <div key={item.href} className={`pl-${level * 4}`}>
          <div className="flex items-center py-2">
            {hasChildren && (
              <button
                onClick={() => toggleSection(item.href)}
                className="mr-2 text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            <Link
              href={item.href}
              className={`${
                isActive
                  ? 'font-semibold text-blue-600'
                  : 'text-gray-700 hover:text-blue-600'
              } transition-colors`}
            >
              {item.title}
            </Link>
          </div>
          {hasChildren && isOpen && (
            <div className="ml-4 border-l border-gray-200 pl-2">
              {item.children && renderNavItems(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4">
      <div className="text-xl font-bold text-gray-800 mb-6">本地AI聊天助手</div>
      <nav className="space-y-1">{renderNavItems(navItems)}</nav>
    </div>
  );
} 