'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2,
  Brain,
  FileSpreadsheet,
  Database,
  Eye,
  Hash,
  Binary,
  Calendar,
  Type,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FileUpload } from '@/components/file-upload';
import { ProjectSidebar } from '@/components/project-sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { projectsApi, uploadApi, agentApi } from '@/lib/api';
import { toast } from 'sonner';
import type { Project, UploadResult } from '@/types';

const getTypeBadgeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('int')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (
    t.includes('float') ||
    t.includes('double') ||
    t.includes('real') ||
    t.includes('numeric') ||
    t.includes('decimal') ||
    t.includes('num')
  ) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
  if (t.includes('date') || t.includes('time') || t.includes('timestamp')) {
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  }
  if (t.includes('bool')) {
    return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  }
  return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
};

const getTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('int')) return Hash;
  if (
    t.includes('float') ||
    t.includes('double') ||
    t.includes('real') ||
    t.includes('numeric') ||
    t.includes('decimal') ||
    t.includes('num')
  ) {
    return Binary;
  }
  if (t.includes('date') || t.includes('time') || t.includes('timestamp')) {
    return Calendar;
  }
  return Type;
};

const inferType = (columnName: string, sampleValue?: unknown): string => {
  const name = columnName.toLowerCase();
  
  if (sampleValue !== undefined && sampleValue !== null) {
    const valStr = String(sampleValue).trim();
    if (valStr !== '') {
      if (!isNaN(Number(valStr))) {
        return valStr.includes('.') ? 'numeric' : 'integer';
      }
      const isDate = !isNaN(Date.parse(valStr)) && 
                     (valStr.includes('-') || valStr.includes('/') || valStr.includes(':')) &&
                     valStr.length > 5;
      if (isDate) {
        return 'timestamp';
      }
    }
  }

  if (name.includes('id') || name.includes('uuid')) return 'text/id';
  if (name.includes('date') || name.includes('time') || name.includes('created') || name.includes('updated')) return 'timestamp';
  if (
    name.includes('amount') ||
    name.includes('price') ||
    name.includes('total') ||
    name.includes('balance') ||
    name.includes('sum') ||
    name.includes('qty') ||
    name.includes('quantity')
  ) {
    return 'numeric';
  }

  return 'text';
};

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, logout } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<{
    tableName: string;
    data: Record<string, unknown>[];
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'schema' | 'preview'>('schema');

  const getColumnType = (colName: string) => {
    const sampleRow = previewData?.data?.[0];
    const sampleValue = sampleRow ? sampleRow[colName] : undefined;
    return inferType(colName, sampleValue);
  };

  const loadProject = useCallback(async () => {
    try {
      const data = await projectsApi.getOne(projectId);
      setProject(data);
    } catch {
      toast.error('Failed to load project');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleUploadComplete = useCallback((result: UploadResult) => {
    // Reload project to get updated table list
    loadProject();
    toast.success(`Uploaded ${result.originalName} (${result.rowCount} rows)`);
    setIsMobileMenuOpen(false);
  }, [loadProject]);

  const handleDeleteTable = async (tableName: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await uploadApi.deleteTable(projectId, tableName);
      await loadProject();
      toast.success('Table deleted');
    } catch {
      toast.error('Failed to delete table');
    }
  };

  const handlePreviewTable = async (tableName: string) => {
    setIsPreviewLoading(true);
    setActiveTab('schema'); // Reset to schema tab when opening
    try {
      const data = await agentApi.previewTable(projectId, tableName);
      setPreviewData({ tableName, data });
      setIsMobileMenuOpen(false);
    } catch {
      toast.error('Failed to load preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        {/* Glowing Background Grids & Ambient Blobs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="absolute inset-0 ambient-glow pointer-events-none" />
        <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none" />
        
        <div className="flex flex-col items-center gap-3 relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-zinc-400 text-xs font-semibold animate-pulse">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const currentTableMetadata = project.tables?.find(
    (t) => t.tableName === previewData?.tableName
  );

  return (
    <div className="min-h-screen flex flex-col bg-background h-screen overflow-hidden relative font-sans">
      {/* Glowing Background Grids & Ambient Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none z-0" />
      <div className="absolute inset-0 ambient-glow pointer-events-none z-0" />
      <div className="absolute top-[10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-cyan-600/5 blur-[140px] pointer-events-none z-0" />

      {/* Unified Premium Navbar */}
      <Navbar
        user={user}
        logout={logout}
        title={project.name}
        onBack={() => router.push('/')}
        customMobileToggle={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-850 text-zinc-300 hover:text-zinc-100 transition-all duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r border-zinc-900 flex-col bg-zinc-950/40 backdrop-blur-md shrink-0 h-full relative z-10">
          <div className="p-4">
            <FileUpload
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
            />
          </div>
          <Separator className="bg-zinc-900" />
          <div className="flex-1 overflow-auto">
            <ProjectSidebar
              tables={project.tables ?? []}
              onDeleteTable={handleDeleteTable}
              onPreviewTable={handlePreviewTable}
            />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay / Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-start">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md transition-opacity duration-300 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-[290px] h-full bg-zinc-950/95 backdrop-blur-md border-r border-zinc-900 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-extrabold text-xs text-zinc-200 tracking-tight">Project Panel</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-150 hover:bg-zinc-900 border border-transparent hover:border-zinc-800/40"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
                </Button>
              </div>

              <div className="p-4">
                <FileUpload
                  projectId={projectId}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
              <Separator className="bg-zinc-900" />
              <div className="flex-1 overflow-auto">
                <ProjectSidebar
                  tables={project.tables ?? []}
                  onDeleteTable={handleDeleteTable}
                  onPreviewTable={handlePreviewTable}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <main className="flex-1 h-full overflow-hidden flex flex-col">
          <ChatInterface
            projectId={projectId}
            hasData={(project.tables ?? []).length > 0}
          />
        </main>
      </div>

      {/* Dataset Details & Preview Dialog */}
      <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] border-zinc-800 bg-zinc-950/95 backdrop-blur-md text-zinc-100 rounded-2xl shadow-2xl flex flex-col p-6 overflow-hidden">
          <DialogHeader className="flex flex-row items-start justify-between pb-4 border-b border-zinc-900/80">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-bold text-zinc-150 tracking-tight">
                  {currentTableMetadata?.originalName || previewData?.tableName}
                </DialogTitle>
                <DialogDescription className="text-zinc-500 text-[10px] font-medium tracking-wide uppercase">
                  Table name: <span className="text-zinc-400 font-semibold font-mono">{previewData?.tableName}</span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Dialog Tabs */}
          <div className="flex items-center justify-between mt-4 mb-2 gap-2 flex-wrap">
            <div className="flex p-1 bg-zinc-900/50 border border-zinc-900/60 rounded-xl">
              <button
                onClick={() => setActiveTab('schema')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'schema'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                Schema & Info
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Data Preview
              </button>
            </div>

            {currentTableMetadata && (
              <div className="flex gap-4.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-900/30 px-3 py-1.5 rounded-lg border border-zinc-900">
                <div>
                  Columns: <span className="text-zinc-200 font-extrabold">{currentTableMetadata.columns.length}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 py-3 overflow-hidden">
            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
                <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                <p className="text-zinc-500 text-xs font-semibold">Loading dataset information...</p>
              </div>
            ) : activeTab === 'schema' && currentTableMetadata ? (
              <ScrollArea className="h-full pr-1.5">
                <div className="space-y-5 pb-4">
                  {/* General Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Schema Columns</p>
                      <p className="text-lg font-black text-zinc-200 mt-1">{currentTableMetadata.columns.length}</p>
                    </div>
                    <div className="bg-zinc-900/10 border border-zinc-900 rounded-xl p-3.5">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Storage Status</p>
                      <p className="text-xs font-bold text-emerald-400 mt-2.5 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        In-Memory Cached
                      </p>
                    </div>
                  </div>

                  {/* Schema Columns Table */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3 ml-0.5">Columns Schema Mapping</h4>
                    <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
                      <div className="grid grid-cols-2 bg-zinc-900/40 px-4 py-2.5 border-b border-zinc-900 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <div>Column Name</div>
                        <div>Data Type</div>
                      </div>
                      <div className="divide-y divide-zinc-900 max-h-[35vh] overflow-y-auto">
                        {currentTableMetadata.columns.map((col, idx) => {
                          const colType = getColumnType(col);
                          const IconComp = getTypeIcon(colType);
                          return (
                            <div key={idx} className="grid grid-cols-2 px-4 py-3 items-center hover:bg-zinc-900/10 transition-colors">
                              <span className="text-xs font-bold text-zinc-300 truncate pr-4">{col}</span>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold tracking-wide uppercase ${getTypeBadgeColor(colType)}`}>
                                  <IconComp className="h-2.5 w-2.5 shrink-0" />
                                  {colType}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : previewData?.data && previewData.data.length > 0 ? (
              <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20 h-full flex flex-col">
                <ScrollArea className="flex-1">
                  <Table>
                    <TableHeader className="bg-zinc-900/30 sticky top-0 z-20 backdrop-blur-md">
                      <TableRow className="border-b border-zinc-900 hover:bg-transparent">
                        {Object.keys(previewData.data[0]).map((col) => (
                          <TableHead key={col} className="whitespace-nowrap text-zinc-400 font-bold uppercase tracking-widest text-[9px] py-3.5 px-4 border-b border-zinc-900">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.data.map((row, idx) => (
                        <TableRow key={idx} className="border-b border-zinc-900/50 hover:bg-zinc-900/20 transition-colors duration-150">
                          {Object.keys(row).map((col) => (
                            <TableCell key={col} className="whitespace-nowrap text-xs text-zinc-300 py-2.5 px-4">
                              {String(row[col] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 gap-2">
                <p className="text-center text-zinc-500 text-xs font-semibold">No data available for preview</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

