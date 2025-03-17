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
    title: 'Introduction',
    href: '/home',
  },
  {
    title: 'Getting Started',
    href: '/home/getting-started',
    children: [
      {
        title: 'Installation',
        href: '/home/getting-started/installation',
      },
      {
        title: 'Configuration',
        href: '/home/getting-started/configuration',
      },
    ],
  },
  {
    title: 'Components',
    href: '/home/components',
    children: [
      {
        title: 'UI Components',
        href: '/home/components/ui',
      },
      {
        title: 'Layout Components',
        href: '/home/components/layout',
      },
    ],
  },
  {
    title: 'API Reference',
    href: '/home/api',
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
      <div className="text-xl font-bold text-gray-800 mb-6">Documentation</div>
      <nav className="space-y-1">{renderNavItems(navItems)}</nav>
    </div>
  );
} 