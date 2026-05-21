'use client';

import { Trash2, Eye } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TableMetadata } from '@/types';

interface ProjectSidebarProps {
  tables: TableMetadata[];
  onDeleteTable: (tableName: string) => void;
  onPreviewTable: (tableName: string) => void;
}

export function ProjectSidebar({
  tables,
  onDeleteTable,
  onPreviewTable,
}: ProjectSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-zinc-950/20">
      <div className="p-4 border-b border-zinc-900 bg-zinc-950/40">
        <h3 className="font-bold text-[10px] text-zinc-400 uppercase tracking-widest leading-none">
          Uploaded Datasets
        </h3>
        <Badge variant="secondary" className="mt-2.5 bg-zinc-900/80 border border-zinc-800 text-zinc-300 font-bold text-[10px] tracking-wide uppercase px-2 py-0.5">
          {tables.length} {tables.length === 1 ? 'dataset' : 'datasets'}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {tables.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-xs">
              <p className="font-semibold text-zinc-400">No datasets uploaded</p>
              <p className="text-[10px] mt-1 text-zinc-500">Upload CSV files above to begin.</p>
            </div>
          ) : (
            tables.map((table) => (
              <div
                key={table.id}
                onClick={() => onPreviewTable(table.tableName)}
                className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-900/60 border border-transparent hover:border-zinc-800/40 transition-all duration-200 cursor-pointer"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors truncate leading-tight">
                    {table.originalName}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                    {table.columns.length} columns
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-250" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 shrink-0 active:scale-95"
                    onClick={() => onPreviewTable(table.tableName)}
                    title="Preview Data"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 shrink-0 active:scale-95"
                    onClick={() => onDeleteTable(table.tableName)}
                    title="Delete Dataset"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
