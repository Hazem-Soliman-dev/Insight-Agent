'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { uploadApi } from '@/lib/api';
import type { UploadResult } from '@/types';

interface FileUploadProps {
  projectId: string;
  onUploadComplete: (result: UploadResult) => void;
}

interface UploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  result?: UploadResult;
  error?: string;
}

export function FileUpload({ projectId, onUploadComplete }: FileUploadProps) {
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const processFile = useCallback(
    async (file: File) => {
      setUploads((prev) => [
        ...prev,
        { file, status: 'uploading' },
      ]);

      try {
        const result = await uploadApi.uploadFile(projectId, file);
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'success', result } : u
          )
        );
        onUploadComplete(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploads((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'error', error: errorMessage } : u
          )
        );
      }
    },
    [projectId, onUploadComplete]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        processFile(file);
      });
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: true,
  });

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'uploading'));
  };

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`cursor-pointer border-2 border-dashed transition-all duration-200 ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <input {...getInputProps()} />
          <Upload
            className={`h-10 w-10 mb-4 ${
              isDragActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop CSV files here...</p>
          ) : (
            <>
              <p className="text-muted-foreground font-medium">
                Drag & drop CSV files here
              </p>
              <p className="text-sm text-muted-foreground/75 mt-1">
                or click to browse
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Uploads</h4>
            {uploads.some((u) => u.status !== 'uploading') && (
              <button
                onClick={clearCompleted}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear completed
              </button>
            )}
          </div>
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
            >
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.result && (
                  <p className="text-xs text-muted-foreground">
                    {upload.result.rowCount} rows, {upload.result.columns.length} columns
                  </p>
                )}
                {upload.error && (
                  <p className="text-xs text-destructive">{upload.error}</p>
                )}
              </div>
              {upload.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
              {upload.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              {upload.status === 'error' && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
