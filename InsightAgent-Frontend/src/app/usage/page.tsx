'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, HardDrive, TrendingUp, Brain, User, LogOut, BarChart3, CreditCard, Shield, Loader2, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UsageData {
  tier: string;
  projects: {
    used: number;
    limit: number;
  };
  queries: {
    used: number;
    limit: number;
    resetAt: string;
  };
  fileSize: {
    limit: number;
  };
}

export default function UsageDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const { data } = await api.get('/subscription/usage');
      setUsage(data);
    } catch (error) {
      toast.error('Failed to load usage data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load usage data</p>
      </div>
    );
  }

  const projectsPercentage = usage.projects.limit === -1 
    ? 0 
    : (usage.projects.used / usage.projects.limit) * 100;
  
  const queriesPercentage = usage.queries.limit === -1 
    ? 0 
    : (usage.queries.used / usage.queries.limit) * 100;

  const resetDate = new Date(usage.queries.resetAt);
  const nextResetDate = new Date(resetDate.getFullYear(), resetDate.getMonth() + 1, 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl">InsightAgent</h1>
              <p className="text-xs text-muted-foreground">Agentic Business Intelligence</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/">Dashboard</Link>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user?.name || 'User'}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/usage')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Usage & Limits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/pricing')}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pricing
                </DropdownMenuItem>
                {user?.role === 'ADMIN' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b">
            <div>
              <h2 className="text-4xl font-bold tracking-tight">Usage & Limits</h2>
              <p className="text-lg text-muted-foreground mt-2">
                Monitor your subscription usage and resource limits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base px-4 py-1.5 font-semibold border-primary/20 bg-primary/5">
                {usage.tier} Plan
              </Badge>
              <Button asChild size="lg">
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            </div>
          </div>

          {/* Usage Cards */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Projects Usage */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Projects</CardTitle>
                  </div>
                  <Badge variant={projectsPercentage >= 80 ? 'destructive' : 'secondary'} className="font-bold">
                    {usage.projects.used} / {usage.projects.limit === -1 ? '∞' : usage.projects.limit}
                  </Badge>
                </div>
                <CardDescription className="pt-2">Number of active analytics projects</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.projects.limit !== -1 ? (
                  <div className="space-y-4">
                    <Progress value={projectsPercentage} className="h-2.5" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {usage.projects.limit - usage.projects.used} projects remaining
                      </span>
                      <span className="font-medium">{Math.round(projectsPercentage)}%</span>
                    </div>
                    {projectsPercentage >= 80 && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Approaching project limit</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2 text-primary font-medium">Unlimited projects included</div>
                )}
              </CardContent>
            </Card>

            {/* Queries Usage */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">AI Queries</CardTitle>
                  </div>
                  <Badge variant={queriesPercentage >= 80 ? 'destructive' : 'secondary'} className="font-bold">
                    {usage.queries.used} / {usage.queries.limit === -1 ? '∞' : usage.queries.limit}
                  </Badge>
                </div>
                <CardDescription className="pt-2">Monthly AI-driven analysis usage</CardDescription>
              </CardHeader>
              <CardContent>
                {usage.queries.limit !== -1 ? (
                  <div className="space-y-4">
                    <Progress value={queriesPercentage} className="h-2.5" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {usage.queries.limit - usage.queries.used} queries remaining
                      </span>
                      <span className="font-medium">{Math.round(queriesPercentage)}%</span>
                    </div>
                    {queriesPercentage >= 80 && (
                      <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                        <span>⚠️</span>
                        <span>Approaching query limit</span>
                      </div>
                    )}
                    <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Resets on {nextResetDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-primary font-medium">Unlimited queries included</div>
                )}
              </CardContent>
            </Card>

            {/* File Size Limit */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <HardDrive className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">File Size</CardTitle>
                </div>
                <CardDescription className="pt-2">Maximum size per data upload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-bold">{usage.fileSize.limit}</span>
                  <span className="text-xl font-medium text-muted-foreground text-opacity-70">MB</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 pb-2">
                  Maximum size for individual CSV data files
                </p>
              </CardContent>
            </Card>

            {/* Upgrade Prompt */}
            <Card className="shadow-sm hover:shadow-md transition-shadow border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Need More?</CardTitle>
                </div>
                <CardDescription className="pt-2">Get higher limits for better scaling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6 h-10">
                  {usage.tier === 'FREE' && 'Upgrade to PRO for 20 projects and 500 queries/month'}
                  {usage.tier === 'PRO' && 'Upgrade to ENTERPRISE for unlimited projects'}
                  {usage.tier === 'ENTERPRISE' && 'You have the highest tier with maximum limits'}
                </p>
                {usage.tier !== 'ENTERPRISE' && (
                  <Button asChild className="w-full shadow-sm" variant="default">
                    <Link href="/pricing">View All Plans</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
