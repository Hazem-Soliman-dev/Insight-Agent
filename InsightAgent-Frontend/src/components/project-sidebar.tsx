'use client';

import { FileSpreadsheet, Trash2, Eye } from 'lucide-react';
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Uploaded Files
        </h3>
        <Badge variant="secondary" className="mt-2">
          {tables.length} {tables.length === 1 ? 'table' : 'tables'}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {tables.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-xs mt-1">Upload CSV files to get started</p>
            </div>
          ) : (
            tables.map((table) => (
              <div
                key={table.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {table.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {table.columns.length} columns
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onPreviewTable(table.tableName)}
                    title="Preview data"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDeleteTable(table.tableName)}
                    title="Delete table"
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
