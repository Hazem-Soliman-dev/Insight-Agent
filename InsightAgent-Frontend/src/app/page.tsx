'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen, Trash2, Loader2, Brain, Database, Sparkles,
  CheckCircle2, ChevronRight, Terminal, BarChart2, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { Project } from '@/types';

// ==========================================
// INTERACTIVE HIGH-FIDELITY APP PLAYGROUND
// ==========================================
function MockupDashboard() {
  const [activeTab, setActiveTab] = useState<'sales' | 'churn' | 'marketing'>('sales');

  const tabs = {
    sales: {
      fileName: 'sales_data_q1.csv',
      rows: '1,420 rows',
      query: 'Identify the top performing product category and show quarterly revenue trends.',
      response: 'Based on the provided dataset, the top-performing category is Enterprise Software, generating $482,500 (42.8% of total revenue). Here is the visual breakdown and analysis:',
      recommendations: [
        'Increase marketing spend on Enterprise Software by 15% to leverage the 8.4% MoM growth rate.',
        'Optimize discount schedules for Retail SaaS which showed a high transaction volume but lower average deal size ($120 vs $450).'
      ],
      chartTitle: 'Quarterly Revenue by Category (USD)',
      chartData: [
        { label: 'Ent. Software', val: 80, color: 'from-violet-500 to-indigo-500' },
        { label: 'Retail SaaS', val: 45, color: 'from-fuchsia-500 to-pink-500' },
        { label: 'Consulting', val: 30, color: 'from-cyan-500 to-blue-500' },
        { label: 'On-Premise', val: 15, color: 'from-emerald-500 to-teal-500' }
      ]
    },
    churn: {
      fileName: 'customer_churn.csv',
      rows: '850 rows',
      query: 'Analyse customer churn patterns. Who is most likely to cancel their subscription?',
      response: 'Our cohort analysis shows that customers on monthly plans with less than 3 active user seats are 4.2x more likely to churn than annual accounts. Visual cohort breakdown below:',
      recommendations: [
        'Launch an in-app prompt offering 2 months free to monthly plans transitioning to annual billing.',
        'Trigger a customer success review workflow for accounts with seat utilization dropping below 40%.'
      ],
      chartTitle: 'Churn Rate (%) by Cohort & Account Type',
      chartData: [
        { label: 'Monthly (1-3 seats)', val: 92, color: 'from-pink-600 to-red-500' },
        { label: 'Monthly (4+ seats)', val: 48, color: 'from-amber-500 to-orange-500' },
        { label: 'Annual (1-3 seats)', val: 22, color: 'from-violet-500 to-purple-500' },
        { label: 'Annual (4+ seats)', val: 8, color: 'from-emerald-500 to-teal-500' }
      ]
    },
    marketing: {
      fileName: 'marketing_roi.csv',
      rows: '340 rows',
      query: 'Compare acquisition costs (CAC) against Customer Lifetime Value (LTV) across all ad channels.',
      response: 'The data indicates Paid Search remains our most cost-efficient scale channel with an LTV:CAC ratio of 5.8x, followed by Organic Search. Social Ads have high CAC ($240) and low relative LTV.',
      recommendations: [
        'Reallocate 20% of underperforming Social Ads budget directly into high-ROI Paid Search keywords.',
        'Refine the retargeting audience parameters on social platforms to decrease initial acquisition cost.'
      ],
      chartTitle: 'LTV:CAC Ratio by Marketing Channel',
      chartData: [
        { label: 'Paid Search (5.8x)', val: 96, color: 'from-emerald-500 to-teal-500' },
        { label: 'Organic (4.2x)', val: 70, color: 'from-cyan-500 to-blue-500' },
        { label: 'Referrals (3.5x)', val: 58, color: 'from-violet-500 to-indigo-500' },
        { label: 'Social Ads (1.8x)', val: 30, color: 'from-pink-500 to-red-500' }
      ]
    }
  };

  const current = tabs[activeTab];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-lg overflow-hidden text-left flex flex-col md:flex-row h-auto md:h-[620px]">

      {/* Sidebar: Dataset Browser */}
      <div className="w-full md:w-64 border-r border-zinc-800 bg-zinc-950/40 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Active Datasets</span>
          <span className="flex items-center justify-center h-5 w-5 rounded bg-primary/20 text-[10px] font-bold text-primary">3</span>
        </div>

        {/* Dataset Buttons */}
        <div className="flex flex-col gap-2">
          {(Object.keys(tabs) as Array<'sales' | 'churn' | 'marketing'>).map((key) => {
            const data = tabs[key];
            const isSelected = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 ${isSelected
                  ? 'bg-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/5'
                  : 'bg-zinc-900/30 border-zinc-800/40 text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Database className={`h-4 w-4 shrink-0 ${isSelected ? 'text-primary' : 'text-zinc-500'}`} />
                  <div className="truncate">
                    <p className={`text-xs font-bold ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>{data.fileName}</p>
                    <p className="text-[10px] text-zinc-500">{data.rows}</p>
                  </div>
                </div>
                <ChevronRight className={`h-3 w-3 shrink-0 transition-transform ${isSelected ? 'text-primary translate-x-0.5' : 'text-zinc-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Sidebar Info Section */}
        <div className="mt-auto hidden md:flex flex-col gap-3.5 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-zinc-300">HIPAA Compliant Env</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            All user datasets are encrypted at rest with AES-256 and subject to row-level isolation policies.
          </p>
        </div>
      </div>

      {/* Main Panel: Interactive Chat & Dashboard Output */}
      <div className="flex-1 flex flex-col bg-zinc-950/20 overflow-hidden">

        {/* Playground Top Info Bar */}
        <div className="border-b border-zinc-800/60 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950/30">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-300">Autonomous BI Agent: Active</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-semibold px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800">
            <Terminal className="h-3 w-3 text-primary" />
            <span>Schema: auto-profiled</span>
          </div>
        </div>

        {/* Play Space Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 scrollbar-thin">

          {/* User Request Bubble */}
          <div className="flex items-start gap-3.5 max-w-[85%] self-end">
            <div className="bg-primary hover:bg-primary/95 text-primary-foreground p-3.5 rounded-2xl rounded-tr-sm shadow-md">
              <p className="text-xs font-bold leading-relaxed">{current.query}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0 select-none">
              U
            </div>
          </div>

          {/* AI Response Bubble */}
          <div className="flex items-start gap-3.5 max-w-[90%]">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-primary-foreground shrink-0 shadow shadow-primary/25 select-none">
              <Brain className="h-4.5 w-4.5" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800/60 p-4 rounded-2xl rounded-tl-sm shadow-lg shadow-black/10">
                <p className="text-xs text-zinc-300 leading-relaxed">{current.response}</p>
              </div>

              {/* Graphical Insights Card */}
              <div className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800/40 pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-bold text-zinc-200 tracking-wide">{current.chartTitle}</h4>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">Auto-generated</span>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="space-y-3.5">
                  {current.chartData.map((bar, idx) => (
                    <div key={idx} className="space-y-1.5 group">
                      <div className="flex justify-between text-[11px] font-semibold text-zinc-400">
                        <span className="group-hover:text-zinc-200 transition-colors">{bar.label}</span>
                        <span className="text-zinc-500 group-hover:text-zinc-300">{bar.val}%</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                        <div
                          className={`h-full bg-gradient-to-r ${bar.color} rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${bar.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Suggestions */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span>Actionable Recommendations</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {current.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-800/60 bg-zinc-900/35 hover:bg-zinc-900/60 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-[11px] text-zinc-300 leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, logout, refreshUser } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && searchParams.get('payment') === 'success') {
      toast.success('Credits purchased successfully!');
      refreshUser();
      router.replace('/');
    }
  }, [user, searchParams, refreshUser, router]);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const project = await projectsApi.create(newProjectName.trim());
      setProjects((prev) => [project, ...prev]);
      setNewProjectName('');
      setDialogOpen(false);
      toast.success('Project created successfully');
      router.push(`/projects/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? This will delete all uploaded data.')) {
      return;
    }

    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show hero page for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden font-sans">
        {/* Glowing Background Grids & Ambient Blobs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        <div className="absolute top-[20%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none" />

        {/* Unified Premium Navbar */}
        <Navbar user={user} logout={logout} />

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-14 pb-16 text-center relative z-10">
          <div className="max-w-5xl mx-auto space-y-2 sm:space-y-4">

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-100 leading-[1.1] sm:leading-[1.05]">
              Transform Your Raw Data Into
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-cyan-400 select-none">
                Actionable Intelligence
              </span>
            </h2>

            <p className="text-base sm:text-md text-zinc-400 max-w-3xl mx-auto leading-relaxed pt-2">
              Upload complex CSV datasets and converse with agentic workflows in natural language. Our autonomous AI profiles your schemas, queries data instantly, and renders high-end visualizations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-3 sm:pt-4 max-w-md mx-auto">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-8 py-6 rounded-xl text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 group flex items-center justify-center gap-2" asChild>
                <Link href="/register">
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-zinc-800 bg-zinc-950/20 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900/60 font-semibold px-8 py-6 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2" asChild>
                <Link href="/login">
                  Live Playground
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive App Mockup Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-zinc-800/60 via-zinc-800/10 to-transparent">
            <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-2xl pointer-events-none" />
            <MockupDashboard />
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Supercharged with Autonomous Capabilities
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Ditch fragile database queries and manual graph drawing. InsightAgent takes care of the analytical lifecycle end-to-end.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 flex flex-col gap-5 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
                <Database className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-zinc-100 tracking-tight group-hover:text-primary transition-colors">
                  Ingest & Self-Profile
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upload CSV files or link dynamic tables. Our backend profiles your fields, automatically standardizing dates, floats, and categories.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 flex flex-col gap-5 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform duration-300">
                <Brain className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-zinc-100 tracking-tight group-hover:text-violet-400 transition-colors">
                  Ask in Plain English
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Query tables using natural conversations. No complex SQL commands required. Perfect for operational managers and builders.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-zinc-900 bg-zinc-950/40 p-8 flex flex-col gap-5 hover:border-zinc-800 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-zinc-100 tracking-tight group-hover:text-cyan-400 transition-colors">
                  Interactive Dashboards
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instantly obtain actionable recommendations accompanied by gorgeous responsive charts. Click, zoom, and export charts to presentations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-900 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              How InsightAgent Orchestrates Analysis
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Three simple, frictionless steps to uncover hidden signals inside your datasets.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Visual connector lines between steps in desktop */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/10 via-violet-500/10 to-transparent z-0 hidden md:block" />

            {/* Step 1 */}
            <div className="relative z-10 bg-background/80 p-6 rounded-2xl border border-zinc-900 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                1
              </div>
              <h3 className="font-bold text-base text-zinc-200">Connect & Ingest</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Drag and drop your spreadsheet into our dashboard. The agent immediately structures and parses individual columns.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 bg-background/80 p-6 rounded-2xl border border-zinc-900 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-violet-600 text-zinc-100 font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-violet-600/20">
                2
              </div>
              <h3 className="font-bold text-base text-zinc-200">Natural Chat Dialogue</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ask specific questions. Query anomalies, sum revenues by product type, or execute segment trends with ease.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 bg-background/80 p-6 rounded-2xl border border-zinc-900 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-cyan-600 text-zinc-100 font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-cyan-600/20">
                3
              </div>
              <h3 className="font-bold text-base text-zinc-200">Export & Take Action</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                View auto-rendered graphs and bulleted recommendations. Instantly share visual briefs or sync with business systems.
              </p>
            </div>
          </div>
        </section>

        {/* Minimal Proposligo-Style Footer */}
        <footer className="w-full border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl py-8 px-4 sm:px-8 relative overflow-hidden z-10">
          {/* Background Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 blur-[120px] rounded-full -z-10" />

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <Link href="/" className="text-xl font-extrabold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent tracking-tight">
                InsightAgent
              </Link>
              <p className="text-zinc-500 text-xs max-w-xs text-center md:text-start leading-relaxed">
                Autonomous agentic business intelligence that unlocks premium, deep insights from datasets.
              </p>
            </div>

            <div className="flex items-center gap-4 text-zinc-500 text-xs">
              <span>&copy; {new Date().getFullYear()} InsightAgent Inc. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Show projects dashboard for authenticated users
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans pb-24">
      {/* Glowing Background Grids & Ambient Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute inset-0 ambient-glow pointer-events-none" />
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none" />

      {/* Unified Premium Navbar */}
      <Navbar
        user={user}
        logout={logout}
        actions={
          <Button onClick={() => setDialogOpen(true)} className="gap-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-5 px-5 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200">
            New Project
          </Button>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950/95 backdrop-blur-md max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 font-bold text-lg">Create New Project</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Create a new project to start analyzing your data with AI.
            </DialogDescription>
          </DialogHeader>
          <div className="py-5">
            <Input
              placeholder="Project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              className="bg-zinc-900/50 border-zinc-800 focus:border-primary/50 text-zinc-100 placeholder-zinc-600 rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2.5">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl text-xs font-semibold border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850">
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreating || !newProjectName.trim()} className="rounded-xl text-xs font-bold">
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Projects Section */}
      <main className="container mx-auto px-4 py-12 relative z-10 max-w-6xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-900/60 pb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight leading-none">
                Your Projects
              </h2>
              {!isLoading && projects.length > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Manage and analyze your dynamic CSV datasets with autonomous agentic intelligence.
            </p>
          </div>

          {!isLoading && projects.length > 0 && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="w-full sm:w-auto gap-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-5 px-5 rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              Create New Project
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="border border-dashed border-zinc-800 bg-zinc-950/40 backdrop-blur-md rounded-2xl shadow-xl max-w-md mx-auto overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-105 transition-transform duration-300">
                <FolderOpen className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-zinc-100 tracking-tight mb-2">No Projects Found</h3>
              <p className="text-xs text-zinc-400 mb-8 max-w-sm leading-relaxed">
                Connect and upload CSV datasets to explore them instantly using native, natural conversations with autonomous AI agents.
              </p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="gap-2 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-5 px-6 rounded-xl shadow-xl shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer border border-zinc-900 bg-zinc-950/40 backdrop-blur-md hover:border-zinc-800/80 hover:bg-zinc-900/10 transition-all duration-300 relative overflow-hidden group rounded-2xl shadow-md flex flex-col justify-between"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <CardHeader className="p-5 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300 shrink-0">
                        <Database className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base font-extrabold text-zinc-200 group-hover:text-zinc-100 transition-colors truncate tracking-tight">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">
                          Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </CardDescription>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 active:scale-95"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      title="Delete Project"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </CardHeader>

                <div className="px-5 pb-5 pt-3 border-t border-zinc-900/60 flex items-center justify-between text-[11px] font-semibold text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {(project.tables?.length ?? 0) === 0
                        ? 'No Files'
                        : (project.tables?.length === 1 ? '1 CSV File' : `${project.tables?.length} CSV Files`)}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest group-hover:translate-x-0.5 transition-transform duration-200 flex items-center gap-0.5">
                    Enter Workspace
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
