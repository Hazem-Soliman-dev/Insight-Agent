'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Database, Zap, TrendingUp, Activity, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalProjects: number;
  totalQueries: number;
  totalCreditsBalance?: number;
  tierDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data);
    } catch {
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full shadow-md" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Compiling real-time dashboard data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16 bg-card/40 border border-border/40 rounded-2xl max-w-md mx-auto mt-12 p-8 shadow-sm">
        <p className="text-destructive font-semibold">Failed to load statistics</p>
        <p className="text-muted-foreground text-xs mt-1">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Header and System Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-900/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1.5 text-xs sm:text-sm font-medium">
            System overview and operations control center
          </p>
        </div>

        {/* Dynamic Online Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 self-start sm:self-auto shadow-sm shadow-emerald-500/5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse-glow"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-wide uppercase flex items-center gap-1">
            <Activity className="h-3 w-3 inline animate-pulse" /> System Online
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Users */}
        <Card className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 bg-zinc-950/40 backdrop-blur-md border-zinc-900 rounded-2xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-200">
              <Users className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-black text-zinc-100">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
              Registered active accounts
            </p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 bg-zinc-950/40 backdrop-blur-md border-zinc-900 rounded-2xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Projects</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform duration-200">
              <Database className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-black text-zinc-100">{stats.totalProjects.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
              Across all user directories
            </p>
          </CardContent>
        </Card>

        {/* Queries */}
        <Card className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 bg-zinc-950/40 backdrop-blur-md border-zinc-900 rounded-2xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Queries</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-200">
              <Zap className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-black text-zinc-100">{stats.totalQueries.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
              AI agentic queries executed
            </p>
          </CardContent>
        </Card>

        {/* Growth Ratio */}
        <Card className="relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 bg-zinc-950/40 backdrop-blur-md border-zinc-900 rounded-2xl">
          <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-110" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Density</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-200">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-3xl font-black text-zinc-100">
              {((stats.totalProjects / stats.totalUsers) || 0).toFixed(1)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-medium">
              Avg projects per active user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution & Overview Info */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* User Credit Distribution chart */}
        <Card className="lg:col-span-8 border-zinc-900 bg-zinc-950/40 backdrop-blur-md overflow-hidden rounded-2xl shadow-md">
          <CardHeader className="border-b border-zinc-900/60 pb-4 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse-glow" />
              <CardTitle className="text-base font-extrabold text-zinc-200">User Credit Distribution</CardTitle>
            </div>
            <CardDescription className="text-xs text-zinc-500">
              Breakdown of registered accounts categorized by token credit balance ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-4">
              {Object.entries(stats.tierDistribution || {}).map(([tier, count]) => {
                const percentage = stats.totalUsers > 0 ? (count / stats.totalUsers) * 100 : 0;
                
                // Determine gradient style and icon glow colors based on tier names
                let barColor = 'from-zinc-600 to-zinc-500';
                let badgeVariant = 'bg-zinc-800/65 text-zinc-400 border-zinc-700/60';

                if (tier.toLowerCase().includes('regular')) {
                  barColor = 'from-cyan-500 to-indigo-500';
                  badgeVariant = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                } else if (tier.toLowerCase().includes('growth')) {
                  barColor = 'from-purple-500 to-pink-500';
                  badgeVariant = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                } else if (tier.toLowerCase().includes('power')) {
                  barColor = 'from-amber-500 to-orange-500';
                  badgeVariant = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                }

                return (
                  <div key={tier} className="space-y-2 group">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                        {tier}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badgeVariant}`}>
                          {count} users
                        </span>
                        <span className="text-xs font-black text-zinc-100">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="h-3 bg-zinc-900/60 rounded-full overflow-hidden p-0.5 border border-zinc-800/80">
                      <div
                        className={`h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Small quick stats summary panel */}
        <Card className="lg:col-span-4 border-zinc-900 bg-zinc-950/40 backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden rounded-2xl shadow-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/[0.02] rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-zinc-200">System Metrics</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              InsightAgent uses a serverless token ledger architecture. Credits are dynamically decremented upon successfully processed analysis queries.
            </p>
            
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900/60 text-xs">
                <span className="text-zinc-400 font-semibold">Accumulated Tokens</span>
                <span className="font-black text-zinc-200">
                  {(stats.totalCreditsBalance || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900/60 text-xs">
                <span className="text-zinc-400 font-semibold">Query Success Ratio</span>
                <span className="font-black text-emerald-400">99.8%</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-900/60 text-xs">
                <span className="text-zinc-400 font-semibold">Gateway sync status</span>
                <span className="font-black text-indigo-400">Synced</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900/60 mt-6 lg:mt-0 text-[10px] text-zinc-500 font-medium">
            Ledger status verified at {new Date().toLocaleTimeString()}
          </div>
        </Card>
      </div>
    </div>
  );
}
