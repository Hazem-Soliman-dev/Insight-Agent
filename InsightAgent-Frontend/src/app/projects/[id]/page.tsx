'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Brain } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background h-screen overflow-hidden">
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
            className="md:hidden h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r border-zinc-900 flex-col bg-zinc-950/20 shrink-0 h-full">
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
              className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Content */}
            <div className="relative w-[290px] h-full bg-zinc-950 border-r border-zinc-900 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300">
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-900/10">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-extrabold text-xs text-zinc-200 tracking-tight">Project Panel</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
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

      {/* Preview Dialog */}
      <Dialog open={!!previewData} onOpenChange={() => setPreviewData(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Table Preview</DialogTitle>
            <DialogDescription>
              Showing first 10 rows of {previewData?.tableName}
            </DialogDescription>
          </DialogHeader>
          {isPreviewLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : previewData?.data && previewData.data.length > 0 ? (
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(previewData.data[0]).map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.data.map((row, idx) => (
                    <TableRow key={idx}>
                      {Object.keys(row).map((col) => (
                        <TableCell key={col} className="whitespace-nowrap">
                          {String(row[col] ?? '')}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
