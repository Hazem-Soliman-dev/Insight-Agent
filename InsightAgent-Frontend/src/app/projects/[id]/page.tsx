'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Brain, Loader2 } from 'lucide-react';
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

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState<{
    tableName: string;
    data: Record<string, unknown>[];
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getOne(projectId);
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = useCallback((result: UploadResult) => {
    // Reload project to get updated table list
    loadProject();
    toast.success(`Uploaded ${result.originalName} (${result.rowCount} rows)`);
    setIsMobileMenuOpen(false);
  }, []);

  const handleDeleteTable = async (tableName: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;

    try {
      await uploadApi.deleteTable(projectId, tableName);
      await loadProject();
      toast.success('Table deleted');
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const handlePreviewTable = async (tableName: string) => {
    setIsPreviewLoading(true);
    try {
      const data = await agentApi.previewTable(projectId, tableName);
      setPreviewData({ tableName, data });
      setIsMobileMenuOpen(false);
    } catch (error) {
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4 px-4 py-3 justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold">{project.name}</h1>
          </div>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
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
              className="h-5 w-5"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-visible relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r flex-col bg-muted/20 sticky top-[57px] h-[calc(100vh-57px)]">
          <div className="p-4">
            <FileUpload
              projectId={projectId}
              onUploadComplete={handleUploadComplete}
            />
          </div>
          <Separator />
          <div className="flex-1 overflow-auto">
            <ProjectSidebar
              tables={project.tables}
              onDeleteTable={handleDeleteTable}
              onPreviewTable={handlePreviewTable}
            />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-30 md:hidden">
            {/* 
              Backdrop 
              Using key to force remount if needed, but simple conditional rendering works.
              Clicking outside closes it.
            */}
            <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar Content */}
            <div className="absolute inset-y-0 left-0 w-[80%] max-w-sm bg-background border-r shadow-lg flex flex-col pt-16 animate-in slide-in-from-left">
               {/* Close button inside sidebar is optional since backdrop handles it, or toggle in header handles it */}
              <div className="p-4">
                <FileUpload
                  projectId={projectId}
                  onUploadComplete={handleUploadComplete}
                />
              </div>
              <Separator />
              <div className="flex-1 overflow-auto">
                <ProjectSidebar
                  tables={project.tables}
                  onDeleteTable={handleDeleteTable}
                  onPreviewTable={handlePreviewTable}
                />
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <main className="flex-1">
          <ChatInterface
            projectId={projectId}
            hasData={project.tables.length > 0}
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
