'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Brain, Coins, User, LogOut, BarChart3, Shield, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
  user?: {
    id: string;
    email: string;
    name?: string;
    creditsBalance: number;
    role: string;
  } | null;
  logout?: () => void;
  actions?: React.ReactNode;
  title?: string;
  onBack?: () => void;
  customMobileToggle?: React.ReactNode;
}

export function Navbar({
  user,
  logout,
  actions,
  title,
  onBack,
  customMobileToggle
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { name: 'Projects', href: '/' },
    { name: 'Usage & Limits', href: '/usage' },
    { name: 'Pricing & Credits', href: '/pricing' },
  ];

  return (
    <>
      {/* Top Desktop & Public Navbar (Hidden on mobile for logged-in users) */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${user ? 'hidden md:block' : ''}`}>
        {/* Neon Breathing Top Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between relative">
          
          {/* Left: Brand Identity / Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/10 group-hover:shadow-indigo-500/25 transition-all duration-300">
              <div className="h-full w-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
                <Brain className="h-4.5 w-4.5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-zinc-100 group-hover:text-white transition-colors">
                InsightAgent
              </span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider -mt-0.5">
                Agentic BI
              </span>
            </div>
          </Link>

          {/* Center: Inline Desktop Navigation Links (Only for logged-in users) */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5 px-1.5 py-1 rounded-full border border-zinc-800/40 bg-zinc-900/30 backdrop-blur-sm shadow-inner">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 relative ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/30'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right: Actions, Credits, Profiles */}
          <div className="flex items-center gap-3">
            {/* Custom Actions (e.g. New Project button) */}
            {user && actions && (
              <div className="hidden sm:block">
                {actions}
              </div>
            )}

            {/* Credits Balance Pack */}
            {user && (
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all duration-300 text-xs font-bold text-indigo-400 group shadow-lg shadow-indigo-500/2"
              >
                <Coins className="h-3.5 w-3.5 animate-pulse text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
                <span>{user.creditsBalance} credits</span>
              </Link>
            )}

            {/* Unauthenticated Sign In Button */}
            {!user && (
              <Button variant="ghost" className="text-zinc-300 hover:text-zinc-100 transition-colors text-xs font-semibold px-4 py-2 border border-zinc-800/40 hover:border-zinc-700 bg-zinc-900/10 rounded-xl" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* User Custom Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all duration-200"
                  >
                    <User className="h-4.5 w-4.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl p-1.5 rounded-xl animate-in fade-in duration-200">
                  <DropdownMenuLabel className="px-2.5 py-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-zinc-100 text-xs truncate">{user.name || 'User'}</span>
                      <span className="text-[10px] text-zinc-400 font-normal truncate">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                  <DropdownMenuItem
                    onClick={() => router.push('/')}
                    className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                  >
                    <Brain className="mr-2 h-4 w-4 text-zinc-400" />
                    Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/usage')}
                    className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                  >
                    <BarChart3 className="mr-2 h-4 w-4 text-zinc-400" />
                    Usage & Limits
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push('/pricing')}
                    className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                  >
                    <Coins className="mr-2 h-4 w-4 text-zinc-400" />
                    Pricing
                  </DropdownMenuItem>
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                      <DropdownMenuItem
                        onClick={() => router.push('/admin')}
                        className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                      >
                        <Shield className="mr-2 h-4 w-4 text-zinc-400" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                  {logout && (
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-lg text-xs font-medium text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer py-2"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Clean Mobile Subpage Header (Visible only on mobile for subpages like projects) */}
      {user && (title || onBack) && (
        <div className="md:hidden sticky top-0 z-40 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/60 px-4 py-3 flex items-center justify-between shadow-sm">
          {/* Left: Back Button */}
          <div className="w-10">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all duration-200"
                onClick={onBack}
              >
                <ArrowLeft className="h-4.5 w-4.5" />
              </Button>
            )}
          </div>

          {/* Center: Page Title */}
          <div className="flex-1 text-center px-2 overflow-hidden">
            {title && (
              <h1 className="text-sm font-bold text-zinc-100 truncate tracking-tight">
                {title}
              </h1>
            )}
          </div>

          {/* Right: Custom Sidebar Drawer Toggle Trigger */}
          <div className="w-10 flex justify-end">
            {customMobileToggle}
          </div>
        </div>
      )}

      {/* Premium Mobile Floating Bottom Navigation Dock (Visible on mobile for authenticated global pages) */}
      {user && !title && (
        <div className="md:hidden fixed bottom-4 inset-x-4 h-[64px] bg-zinc-950/80 backdrop-blur-xl border border-zinc-900/80 rounded-2xl z-50 flex items-center justify-around px-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Tab 1: Projects */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 ${
              pathname === '/'
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
            }`}
          >
            <Brain className="h-5.5 w-5.5" />
            {pathname === '/' && (
              <span className="text-[10px] font-bold tracking-wide uppercase">Projects</span>
            )}
          </Link>

          {/* Tab 2: Usage */}
          <Link
            href="/usage"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 ${
              pathname === '/usage'
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
            }`}
          >
            <BarChart3 className="h-5.5 w-5.5" />
            {pathname === '/usage' && (
              <span className="text-[10px] font-bold tracking-wide uppercase">Usage</span>
            )}
          </Link>

          {/* Tab 3: Pricing */}
          <Link
            href="/pricing"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 active:scale-95 ${
              pathname === '/pricing'
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                : 'text-zinc-400 hover:text-zinc-250 border border-transparent'
            }`}
          >
            <Coins className="h-5.5 w-5.5" />
            {pathname === '/pricing' && (
              <span className="text-[10px] font-bold tracking-wide uppercase">Pricing</span>
            )}
          </Link>

          {/* Tab 4: Profile Dropdown Menu Trigger (Upward facing menu) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-250 border border-transparent transition-all duration-300 active:scale-95">
                <User className="h-5.5 w-5.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={12}
              className="w-52 border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl p-1.5 rounded-xl z-[60] animate-in slide-in-from-bottom-2 duration-200"
            >
              <DropdownMenuLabel className="px-2.5 py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-zinc-100 text-xs truncate">{user.name || 'User'}</span>
                  <span className="text-[10px] text-zinc-400 font-normal truncate">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
              <DropdownMenuItem
                onClick={() => router.push('/')}
                className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
              >
                <Brain className="mr-2 h-4 w-4 text-zinc-400" />
                Projects
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/usage')}
                className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
              >
                <BarChart3 className="mr-2 h-4 w-4 text-zinc-400" />
                Usage & Limits
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/pricing')}
                className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
              >
                <Coins className="mr-2 h-4 w-4 text-zinc-400" />
                Pricing
              </DropdownMenuItem>
              {user.role === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                  <DropdownMenuItem
                    onClick={() => router.push('/admin')}
                    className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                  >
                    <Shield className="mr-2 h-4 w-4 text-zinc-400" />
                    Admin Dashboard
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
              {logout && (
                <DropdownMenuItem
                  onClick={logout}
                  className="rounded-lg text-xs font-medium text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer py-2"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </>
  );
}

