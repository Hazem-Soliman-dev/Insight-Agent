'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, LayoutDashboard, Users, TrendingUp, DollarSign, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Plans', href: '/admin/plans', icon: DollarSign },
  { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-md">
      {/* Logo */}
      <div className="p-6 border-b border-border/40 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105">
            <Brain className="h-5.5 w-5.5 text-primary-foreground animate-pulse-glow" />
          </div>
          <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            InsightAgent
          </h1>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-border/40 hover:bg-accent hover:text-foreground md:hidden transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md shadow-primary/10'
                  : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:translate-x-1'
              )}
            >
              {/* Highlight bar for inactive on hover */}
              {!isActive && (
                <span className="absolute left-0 w-1 h-0 bg-primary/60 rounded-r-md transition-all duration-200 group-hover:h-6" />
              )}
              
              <span className="font-semibold text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/40">
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary rounded-xl hover:bg-accent/40 transition-all duration-200 group"
        >
          <span>Back to App</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (persistent) */}
      <aside className="hidden md:flex w-64 border-r border-border/40 bg-card h-screen sticky top-0 flex-col overflow-hidden">
        {/* Subtle top glow ambient effect */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (overlay) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <aside className="relative flex w-64 max-w-xs flex-col bg-card border-r border-border/40 h-full animate-in slide-in-from-left duration-300 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
