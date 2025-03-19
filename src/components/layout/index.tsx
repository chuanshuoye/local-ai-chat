import { Outlet, Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      'min-h-screen bg-background font-sans antialiased',
      'grid grid-rows-[auto_1fr_auto]'
    )}>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold">Local AI Chat</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link to="/chat" className="transition-colors hover:text-foreground/80 text-foreground/60">聊天</Link>
              <Link to="/docs" className="transition-colors hover:text-foreground/80 text-foreground/60">文档</Link>
              <Link to="/workflow" className="transition-colors hover:text-foreground/80 text-foreground/60">工作流</Link>
              <Link to="/mcp" className="transition-colors hover:text-foreground/80 text-foreground/60">MCP</Link>
              <Link to="/agents" className="transition-colors hover:text-foreground/80 text-foreground/60">代理</Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React + Vite + React Router
          </div>
        </div>
      </footer>
    </div>
  )
} 