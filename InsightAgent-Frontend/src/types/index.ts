export interface TableMetadata {
  id: string;
  projectId: string;
  tableName: string;
  originalName: string;
  columns: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  tables: TableMetadata[];
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  tableName: string;
  originalName: string;
  columns: string[];
  rowCount: number;
}

export interface ChartSuggestion {
  type: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  xAxis?: string;
  yAxis?: string;
  title?: string;
}

export interface Recommendation {
  question: string;
  description: string;
  type: 'insight' | 'drill-down' | 'comparison' | 'trend' | 'anomaly';
}

export interface QueryResult {
  sql: string;
  data: Record<string, unknown>[];
  rowCount: number;
  chartSuggestion: ChartSuggestion;
  recommendations: Recommendation[];
  summary: string;
  executionTime: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  queryResult?: QueryResult;
  timestamp: Date;
  isLoading?: boolean;
}

export interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete';
}
