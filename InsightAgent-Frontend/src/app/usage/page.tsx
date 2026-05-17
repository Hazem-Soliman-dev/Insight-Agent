'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, HardDrive, TrendingUp, Coins } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 text-foreground">
      {/* Unified Premium Navbar */}
      <Navbar user={user} logout={logout} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Usage & Credits</h2>
              <p className="text-lg text-muted-foreground mt-2">
                Monitor your credits balance, transactions, and resource quotas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base px-4 py-1.5 font-semibold border-primary/20 bg-primary/5">
                Pay-As-You-Go
              </Badge>
              <Button asChild size="lg">
                <Link href="/pricing">Buy Credits</Link>
              </Button>
            </div>
          </div>

          {/* Credits Balance Display Card */}
          <Card className="border border-indigo-500/20 bg-indigo-950/10 shadow-2xl backdrop-blur-md overflow-hidden relative">
            <div className="absolute right-0 top-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl" />
            <CardHeader className="pb-4 relative">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
                  <Coins className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Credits Balance</CardTitle>
                  <CardDescription>Available credits for AI querying and analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    {usage.creditsBalance}
                  </span>
                  <span className="text-lg text-indigo-400 font-semibold">credits</span>
                </div>
                <p className="text-sm text-zinc-400 mt-2">
                  1 credit is spent per successful AI analytical query. Zero monthly reset limits.
                </p>
              </div>
              <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/30 w-full md:w-auto">
                <Link href="/pricing">Get More Credits</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quotas and Stats */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Projects Quota */}
            <Card className="shadow-lg bg-zinc-950/40 border border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Projects</CardTitle>
                  </div>
                  <Badge variant={projectsPercentage >= 80 ? 'destructive' : 'secondary'} className="font-bold">
                    {usage.projects.used} / {usage.projects.limit === -1 ? '∞' : usage.projects.limit}
                  </Badge>
                </div>
                <CardDescription className="pt-2">Active analytics databases/projects</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.projects.limit !== -1 ? (
                  <div className="space-y-4">
                    <Progress value={projectsPercentage} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">
                        {usage.projects.limit - usage.projects.used} projects remaining
                      </span>
                      <span className="font-medium">{Math.round(projectsPercentage)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-primary text-sm font-semibold">Unlimited projects</div>
                )}
              </CardContent>
            </Card>

            {/* AI Queries Count */}
            <Card className="shadow-lg bg-zinc-950/40 border border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <CardTitle className="text-lg">Queries Made</CardTitle>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {usage.queries.totalExecuted}
                  </Badge>
                </div>
                <CardDescription className="pt-2">Total AI-driven insights generated</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-zinc-200">{usage.queries.totalExecuted}</span>
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Successful operations</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Successfully generated optimized SQL structures and visual reports.
                </p>
              </CardContent>
            </Card>

            {/* File Upload Quotas */}
            <Card className="shadow-lg bg-zinc-950/40 border border-zinc-800">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <HardDrive className="h-5 w-5 text-purple-400" />
                  </div>
                  <CardTitle className="text-lg">File Upload Limit</CardTitle>
                </div>
                <CardDescription className="pt-2">Maximum size per individual upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="py-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-zinc-200">{usage.fileSize.limit}</span>
                  <span className="text-lg font-bold text-zinc-500">MB</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">
                  Optimized for fast CSV parsing and in-memory Neon DB schema syncing.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick FAQ info panel */}
          <Card className="shadow-lg bg-zinc-950/20 border border-zinc-800 p-6 flex flex-col md:flex-row items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-200">How do Credits work?</h4>
              <p className="text-sm text-zinc-400 mt-1">
                Every prompt executing deep SQL querying costs 1 credit. Free users get 5 default credits. Purchase more credits whenever you run out. Credits do not expire, allowing you to use the platform on your own schedule.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
