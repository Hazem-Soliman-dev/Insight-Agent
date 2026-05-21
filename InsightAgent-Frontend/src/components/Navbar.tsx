'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Brain, Coins, User, BarChart3, ArrowLeft, Home, LogIn, Sparkles
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
      {/* Top Desktop & Public Navbar (Hidden on mobile) */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900/50 transition-all duration-300 hidden md:block">
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
            <div className="flex items-center">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent group-hover:from-white group-hover:via-zinc-100 group-hover:to-zinc-300 transition-all duration-300">
                InsightAgent
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[8px] font-semibold text-indigo-400 uppercase tracking-wider ml-1.5 shadow-sm shadow-indigo-500/5">
                Agentic
              </span>
            </div>
          </Link>

          {/* Center: Inline Desktop Navigation Links (Only for logged-in users) */}
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3.5 py-1.5 text-xs font-bold transition-all duration-200 rounded-xl border ${isActive
                        ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/5'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30'
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold transition-all duration-200 shadow-sm shadow-indigo-500/5 hover:shadow-indigo-500/10"
              >
                <Coins className="h-3.5 w-3.5 text-indigo-400" />
                <span>{user.creditsBalance} credits</span>
              </Link>
            )}

            {/* Unauthenticated Sign In Button */}
            {!user && (
              <Button asChild className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* User Custom Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800/80 text-zinc-300 hover:text-zinc-100 transition-all duration-200 p-0 flex items-center justify-center focus-visible:ring-1 focus-visible:ring-indigo-500/50 cursor-pointer"
                  >
                    {user.name ? (
                      <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md shadow-indigo-500/10">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <User className="h-4.5 w-4.5" />
                    )}
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
                  {user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push('/admin')}
                        className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2"
                      >
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                    </>
                  )}
                  {logout && (
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-lg text-xs font-medium text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer py-2"
                    >
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

      {/* Premium Mobile Floating Bottom Navigation Dock (Visible on mobile for global pages) */}
      {!title && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-zinc-950/80 backdrop-blur-2xl border-t border-zinc-900/60 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.5)] z-50 flex items-center justify-around px-2">
          {user ? (
            <>
              {/* Authenticated Tabs */}
              {[
                { label: 'Projects', href: '/', icon: <Brain className="h-5 w-5" /> },
                { label: 'Usage', href: '/usage', icon: <BarChart3 className="h-5 w-5" /> },
                { label: 'Pricing', href: '/pricing', icon: <Coins className="h-5 w-5" /> },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex-1 flex flex-col items-center justify-center h-full min-w-0 relative"
                  >
                    <div className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}>
                      <div className={`relative transition-all duration-500 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
                        {item.icon}
                        {isActive && (
                          <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-full -z-10 animate-pulse" />
                        )}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Account Dropdown tab for authenticated users */}
              <div className="flex-1 flex items-center justify-center h-full min-w-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex flex-col items-center justify-center gap-1.5 w-full h-full transition-all duration-300 text-zinc-500 hover:text-primary focus:outline-none cursor-pointer">
                      <div className="relative transition-all duration-500 scale-100 flex items-center justify-center">
                        {user.name ? (
                          <div className="h-5.5 w-5.5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shadow-md shadow-indigo-500/15">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60 translate-y-0.5 whitespace-nowrap">
                        Account
                      </span>
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
                    {user.role === 'ADMIN' && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/admin')} className="rounded-lg text-xs font-medium text-zinc-300 focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer py-2">Admin Dashboard</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />
                      </>
                    )}
                    {logout && (<DropdownMenuItem onClick={logout} className="rounded-lg text-xs font-medium text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 cursor-pointer py-2">Logout</DropdownMenuItem>)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              {/* Unauthenticated Tabs (Landing Page) */}
              {[
                { label: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
                { label: 'Pricing', href: '/pricing', icon: <Coins className="h-5 w-5" /> },
                { label: 'Sign In', href: '/login', icon: <LogIn className="h-5 w-5" /> },
                { label: 'Register', href: '/register', icon: <Sparkles className="h-5 w-5" /> },
              ].filter(item => !(item.label === 'Pricing' && pathname === '/')).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex-1 flex flex-col items-center justify-center h-full min-w-0 relative"
                  >
                    <div className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${isActive ? 'text-primary' : 'text-zinc-500 hover:text-primary'}`}>
                      <div className={`relative transition-all duration-500 ${isActive ? 'scale-110 -translate-y-0.5' : 'scale-100'}`}>
                        {item.icon}
                        {isActive && (
                          <div className="absolute -inset-2 bg-primary/10 blur-xl rounded-full -z-10 animate-pulse" />
                        )}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${isActive ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-0.5'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      )}
    </>
  );
}
