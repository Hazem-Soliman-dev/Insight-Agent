'use client';

import { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import AdminSidebar from '@/components/AdminSidebar';
import { Menu, Brain } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-background relative overflow-hidden">
        {/* Decorative background grid & ambient light */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute top-0 right-0 h-[500px] w-[500px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        {/* Sidebar Component */}
        <AdminSidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />

        {/* Layout Body Container */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Navigation Header */}
          <header className="h-16 border-b border-border/40 bg-card/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-accent/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>
            
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Brain className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">
                InsightAgent Admin
              </span>
            </Link>
            
            {/* Balance placeholder or avatar space */}
            <div className="w-8 h-8 rounded-full bg-accent/40 border border-border/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              AD
            </div>
          </header>

          {/* Main Dashboard Screen View */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10 animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
