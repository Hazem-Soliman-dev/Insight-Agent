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
        className={`cursor-pointer border border-dashed backdrop-blur-sm rounded-2xl transition-all duration-200 ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-zinc-800 bg-zinc-950/40 hover:border-indigo-500/50 hover:bg-zinc-900/20'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <input {...getInputProps()} />
          <Upload
            className={`h-10 w-10 mb-4 transition-colors duration-200 ${
              isDragActive ? 'text-indigo-450 animate-pulse' : 'text-zinc-500 group-hover:text-zinc-300'
            }`}
          />
          {isDragActive ? (
            <p className="text-indigo-400 font-bold text-xs">Drop CSV files here...</p>
          ) : (
            <>
              <p className="text-zinc-300 font-bold text-xs">
                Drag & drop CSV files here
              </p>
              <p className="text-[11px] text-zinc-500 font-medium mt-1">
                or click to browse
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {uploads.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Uploads</h4>
            {uploads.some((u) => u.status !== 'uploading') && (
              <button
                onClick={clearCompleted}
                className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
          {uploads.map((upload, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950/50 border border-zinc-900 animate-in fade-in duration-200"
            >
              <FileSpreadsheet className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">{upload.file.name}</p>
                {upload.result && (
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {upload.result.rowCount} rows, {upload.result.columns.length} columns
                  </p>
                )}
                {upload.error && (
                  <p className="text-[10px] text-rose-500 font-semibold">{upload.error}</p>
                )}
              </div>
              {upload.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
              )}
              {upload.status === 'success' && (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              )}
              {upload.status === 'error' && (
                <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
