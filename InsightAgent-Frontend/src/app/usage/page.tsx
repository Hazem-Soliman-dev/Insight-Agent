'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Database, Zap, HardDrive } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface UsageData {
  creditsBalance: number;
  projects: {
    used: number;
    limit: number;
  };
  queries: {
    totalExecuted: number;
  };
  fileSize: {
    limit: number;
  };
}

export default function UsageDashboard() {
  const { user, logout } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const { data } = await api.get('/subscription/usage');
      setUsage(data);
    } catch {
      toast.error('Failed to load usage data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background py-12">
        <p className="text-muted-foreground mb-4">Failed to load usage data</p>
        <Button onClick={loadUsage}>Retry</Button>
      </div>
    );
  }

  const projectsPercentage = usage.projects.limit === -1 
    ? 0 
    : (usage.projects.used / usage.projects.limit) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans pb-0">
      {/* Glowing Background Grids & Ambient Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none" />

      {/* Unified Premium Navbar */}
      <Navbar user={user} logout={logout} />

      <main className="container mx-auto px-4 py-8 sm:py-12 relative z-10 max-w-4xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900/60 pb-4 sm:pb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight leading-none">
                Usage & Limits
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Monitor your credits balance, transactions, and resource quotas.
              </p>
            </div>
          </div>

          {/* Credits Balance Display Card */}
          <Card className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-md">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <CardHeader className="p-5 pb-2 relative">
              <div>
                <CardTitle className="text-lg sm:text-xl font-extrabold text-zinc-200">Credits Balance</CardTitle>
                <CardDescription className="text-xs text-zinc-500">Available credits for AI querying and analysis</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2 relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 select-none">
                    {usage.creditsBalance}
                  </span>
                  <span className="text-sm sm:text-base text-indigo-400 font-bold uppercase tracking-wider">credits</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed max-w-md">
                  1 credit is spent per successful AI analytical query. Zero monthly reset limits.
                </p>
              </div>
              <Button asChild className="w-full sm:w-auto gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 transition-all duration-200">
                <Link href="/pricing">Get More Credits</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quotas and Stats */}
          <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
            {/* Projects Quota */}
            <Card className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 shrink-0 md:shrink border border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-md flex flex-col justify-between snap-center">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <Database className="h-5 w-5 text-indigo-400" />
                    </div>
                    <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-200">Projects</CardTitle>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${projectsPercentage >= 80 ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' : 'bg-zinc-800/55 border-zinc-700/60 text-zinc-300'}`}>
                    {usage.projects.used} / {usage.projects.limit === -1 ? '∞' : usage.projects.limit}
                  </span>
                </div>
                <CardDescription className="text-xs text-zinc-500 pt-1.5">Active analytics databases/projects</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1">
                {usage.projects.limit !== -1 ? (
                  <div className="space-y-3">
                    <Progress value={projectsPercentage} className="h-1.5 bg-zinc-900" />
                    <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                      <span>
                        {usage.projects.limit - usage.projects.used} remaining
                      </span>
                      <span>{Math.round(projectsPercentage)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-indigo-400 text-xs font-bold uppercase tracking-wider pt-1">Unlimited projects</div>
                )}
              </CardContent>
            </Card>

            {/* AI Queries Count */}
            <Card className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 shrink-0 md:shrink border border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-md flex flex-col justify-between snap-center">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-200">Queries Made</CardTitle>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 uppercase tracking-wider">
                    {usage.queries.totalExecuted}
                  </span>
                </div>
                <CardDescription className="text-xs text-zinc-500 pt-1.5">Total AI-driven insights generated</CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-200">{usage.queries.totalExecuted}</span>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">operations</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                  Successfully generated optimized SQL structures and visual reports.
                </p>
              </CardContent>
            </Card>

            {/* File Upload Quotas */}
            <Card className="min-w-[280px] sm:min-w-[320px] md:min-w-0 flex-1 shrink-0 md:shrink border border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-md flex flex-col justify-between snap-center">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                    <HardDrive className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-200">File Upload Limit</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-zinc-200">{usage.fileSize.limit}</span>
                  <span className="text-sm font-bold text-zinc-500">MB</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
                  Optimized for fast CSV parsing and in-memory Neon DB schema syncing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick FAQ info panel */}
          <Card className="border border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-5 sm:p-6 flex flex-col md:flex-row items-center gap-4 rounded-2xl shadow-sm mb-14 sm:mb-0">
            <div>
              <h4 className="font-extrabold text-zinc-200 text-sm tracking-wide">How do Credits work?</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Every prompt executing deep SQL querying costs 1 credit. Free users get 5 default credits. Purchase more credits whenever you run out. Credits do not expire, allowing you to use the platform on your own schedule.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
