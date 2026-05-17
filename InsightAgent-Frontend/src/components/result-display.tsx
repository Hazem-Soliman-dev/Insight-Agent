'use client';

import * as React from 'react';
import { useState } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  LabelList,
} from 'recharts';
import { TableIcon, BarChart3, Code, Lightbulb, TrendingUp, Search, GitCompare, AlertTriangle, Sparkles, FileText } from 'lucide-react';
import type { QueryResult, Recommendation } from '@/types';
import { toast } from 'sonner';

interface ResultDisplayProps {
  result: QueryResult;
  question?: string;
  onRecommendationClick?: (question: string) => void; 
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const getRecommendationIcon = (type: Recommendation['type']) => {
  switch (type) {
    case 'insight':
      return Lightbulb;
    case 'drill-down':
      return Search;
    case 'comparison':
      return GitCompare;
    case 'trend':
      return TrendingUp;
    case 'anomaly':
      return AlertTriangle;
    default:
      return Sparkles;
  }
};

const getRecommendationColor = (type: Recommendation['type']) => {
  switch (type) {
    case 'insight':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'drill-down':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'comparison':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'trend':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'anomaly':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-primary/10 text-primary border-primary/20';
  }
};

export function ResultDisplay({ result, question, onRecommendationClick }: ResultDisplayProps) {
  const { data, sql, rowCount, chartSuggestion, recommendations, summary, executionTime } = result;
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const uniqueId = React.useId().replace(/:/g, '');

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      
      const chartEl = document.getElementById(`chart-${uniqueId}`);
      let chartSvgHtml = '';
      if (chartEl) {
        const svgEl = chartEl.querySelector('svg');
        if (svgEl) {
          const clonedSvg = svgEl.cloneNode(true) as SVGElement;
          clonedSvg.setAttribute('width', '100%');
          clonedSvg.setAttribute('height', '320');
          clonedSvg.style.maxWidth = '100%';
          clonedSvg.style.height = 'auto';
          
          const cells = clonedSvg.querySelectorAll('.recharts-rectangle, .recharts-pie-sector, .recharts-line, .recharts-area');
          cells.forEach((cell) => {
            const currentFill = cell.getAttribute('fill');
            const currentStroke = cell.getAttribute('stroke');
            if (currentFill && currentFill.includes('var(')) {
              const matches = currentFill.match(/--chart-\d/);
              if (matches) {
                const colorMap: Record<string, string> = {
                  '--chart-1': '#4f46e5',
                  '--chart-2': '#10b981',
                  '--chart-3': '#f59e0b',
                  '--chart-4': '#ec4899',
                  '--chart-5': '#06b6d4',
                };
                cell.setAttribute('fill', colorMap[matches[0]] || '#4f46e5');
              }
            }
            if (currentStroke && currentStroke.includes('var(')) {
              const matches = currentStroke.match(/--chart-\d/);
              if (matches) {
                const colorMap: Record<string, string> = {
                  '--chart-1': '#4f46e5',
                  '--chart-2': '#10b981',
                  '--chart-3': '#f59e0b',
                  '--chart-4': '#ec4899',
                  '--chart-5': '#06b6d4',
                };
                cell.setAttribute('stroke', colorMap[matches[0]] || '#4f46e5');
              }
            }
          });
          chartSvgHtml = clonedSvg.outerHTML;
        }
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked! Please allow pop-ups to download reports.');
        setIsExporting(false);
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Insight Diagram & SQL Report - ${new Date().toLocaleDateString()}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
            <style>
              :root {
                --primary: #4f46e5;
                --primary-light: #e0e7ff;
                --text-main: #0f172a;
                --text-muted: #475569;
                --border-color: #e2e8f0;
                --bg-light: #f8fafc;
                --bg-card: #ffffff;
              }
              
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }

              body {
                font-family: 'Inter', sans-serif;
                color: var(--text-main);
                background-color: var(--bg-light);
                padding: 40px;
                line-height: 1.5;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .container {
                max-width: 900px;
                margin: 0 auto;
                background: var(--bg-card);
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                border: 1px solid var(--border-color);
              }

              .header-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 2px solid var(--primary);
                padding-bottom: 20px;
                margin-bottom: 30px;
              }

              .logo-area {
                display: flex;
                align-items: center;
                gap: 10px;
              }

              .logo-icon {
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: linear-gradient(135deg, var(--primary), #3b82f6);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 18px;
                font-family: 'Outfit', sans-serif;
              }

              .logo-text {
                font-family: 'Outfit', sans-serif;
                font-size: 22px;
                font-weight: 700;
                color: var(--text-main);
              }

              .logo-subtitle {
                font-size: 12px;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-top: -2px;
              }

              .meta-area {
                text-align: right;
                font-size: 12px;
                color: var(--text-muted);
              }

              .report-title {
                font-family: 'Outfit', sans-serif;
                font-size: 28px;
                font-weight: 700;
                color: var(--text-main);
                margin-bottom: 20px;
              }

              .question-box {
                background-color: var(--bg-light);
                border-left: 4px solid var(--primary);
                padding: 16px 20px;
                border-radius: 0 12px 12px 0;
                margin-bottom: 24px;
                font-style: italic;
                color: var(--text-main);
                font-size: 15px;
              }

              .question-label {
                font-weight: 600;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.05em;
                color: var(--primary);
                margin-bottom: 4px;
                font-family: 'Outfit', sans-serif;
                font-style: normal;
              }

              h3 {
                font-family: 'Outfit', sans-serif;
                font-size: 18px;
                font-weight: 600;
                color: var(--text-main);
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
              }

              .chart-section {
                background: white;
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 30px;
                text-align: center;
                page-break-inside: avoid;
              }

              .chart-title {
                font-family: 'Outfit', sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-muted);
                margin-bottom: 16px;
              }

              .chart-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 320px;
                width: 100%;
              }

              .sql-section {
                background-color: #0f172a;
                color: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                font-family: monospace;
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 30px;
                overflow-x: auto;
                border: 1px solid #1e293b;
                page-break-inside: avoid;
              }

              .sql-label {
                font-size: 11px;
                color: #94a3b8;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                font-weight: 600;
              }

              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid var(--border-color);
                text-align: center;
                font-size: 11px;
                color: var(--text-muted);
              }

              @media print {
                body {
                  background-color: white;
                  padding: 0;
                }
                .container {
                  box-shadow: none;
                  border: none;
                  padding: 0;
                  max-width: 100%;
                }
                .sql-section {
                  background-color: #f8fafc !important;
                  color: #0f172a !important;
                  border-color: var(--border-color) !important;
                }
                .sql-label {
                  color: var(--text-muted) !important;
                }
                @page {
                  margin: 20mm 15mm 20mm 15mm;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header-bar">
                <div class="logo-area">
                  <div class="logo-icon">I</div>
                  <div>
                    <div class="logo-text">InsightAgent</div>
                    <div class="logo-subtitle">Data Intelligence Platform</div>
                  </div>
                </div>
                <div class="meta-area">
                  <div>Report ID: IA-${Math.floor(Math.random() * 900000 + 100000)}</div>
                  <div>Generated: ${new Date().toLocaleDateString()}</div>
                  <div>Execution Time: ${executionTime}ms</div>
                </div>
              </div>

              <div class="report-title">Visual Query & SQL Analysis Report</div>

              ${question ? `
                <div class="question-box">
                  <div class="question-label">Analysis Objective / Query Asked</div>
                  ${question}
                </div>
              ` : ''}

              ${chartSvgHtml ? `
                <div class="chart-section">
                  <div class="chart-title">${chartSuggestion.title || 'Visual Analysis'}</div>
                  <div class="chart-container">
                    ${chartSvgHtml}
                  </div>
                </div>
              ` : `
                <div class="chart-section">
                  <p class="no-data" style="padding: 40px; font-style: normal; color: var(--text-muted);">
                    No chart available for this query. Previewing the database SQL execution query below.
                  </p>
                </div>
              `}

              <div class="sql-section">
                <div class="sql-label">Executed Database Query (SQL)</div>
                ${sql}
              </div>

              <div class="footer">
                This dynamic visual report was generated automatically by InsightAgent. 
                All calculations and visual outputs should be cross-referenced with your standard operating data.
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      printWindow.focus();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
      
      setTimeout(() => {
        printWindow.print();
        setIsExporting(false);
      }, 600);
      
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to generate printable PDF');
      setIsExporting(false);
    }
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No results found for your query.</p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0]);

  // Prepare chart data
  const chartData = data.slice(0, 20).map((row) => {
    const processed: Record<string, unknown> = {};
    columns.forEach((col) => {
      const value = row[col];
      processed[col] = typeof value === 'string' && !isNaN(Number(value))
        ? Number(value)
        : value;
    });
    return processed;
  });

  const renderChart = () => {
    const { type, xAxis, yAxis, title } = chartSuggestion;
    const minWidth = Math.max(600, chartData.length * 60);

    const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
      <ScrollArea className="w-full max-w-[calc(100vw-3rem)] md:max-w-full pb-4">
        <div id={`chart-${uniqueId}`} style={{ minWidth: type === 'pie' ? '100%' : `${minWidth}px`, height: '300px' }}>
          {children}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );

    if (type === 'bar' && xAxis && yAxis) {
      return (
        <div>
          {title && <h4 className="text-sm font-medium text-center mb-4">{title}</h4>}
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={chartData} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onMouseMove={(state) => {
                  if (state && state.activeTooltipIndex !== undefined) {
                    setActiveBarIndex(state.activeTooltipIndex as number);
                  }
                }}
                onMouseLeave={() => setActiveBarIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey={xAxis} className="text-xs" axisLine={false} tickLine={false} />
                <YAxis className="text-xs" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey={yAxis} radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      opacity={activeBarIndex === null || activeBarIndex === index ? 1 : 0.6}
                      className="transition-opacity duration-200"
                    />
                  ))}
                  <LabelList dataKey={yAxis} position="top" className="text-xs font-bold fill-foreground" offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      );
    }

    if (type === 'pie' && xAxis && yAxis) {
      return (
        <div>
          {title && <h4 className="text-sm font-medium text-center mb-4">{title}</h4>}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={yAxis}
                nameKey={xAxis}
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                onMouseEnter={(_, index) => setActivePieIndex(index)}
                onMouseLeave={() => setActivePieIndex(null)}
                label={({ name, value, percent }) =>
                  `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`
                }
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    stroke={activePieIndex === index ? 'hsl(var(--foreground))' : 'none'}
                    strokeWidth={2}
                    opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.8}
                    className="transition-all duration-200"
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (type === 'line' && xAxis && yAxis) {
      return (
        <div>
          {title && <h4 className="text-sm font-medium text-center mb-4">{title}</h4>}
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey={xAxis} className="text-xs" axisLine={false} tickLine={false} />
                <YAxis className="text-xs" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={yAxis}
                  stroke={CHART_COLORS[0]}
                  strokeWidth={3}
                  dot={{ fill: CHART_COLORS[0], r: 4, strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      );
    }

    if (type === 'area' && xAxis && yAxis) {
      return (
        <div>
          {title && <h4 className="text-sm font-medium text-center mb-4">{title}</h4>}
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey={xAxis} className="text-xs" axisLine={false} tickLine={false} />
                <YAxis className="text-xs" axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={yAxis}
                  stroke={CHART_COLORS[0]}
                  strokeWidth={3}
                  fill={CHART_COLORS[0]}
                  fillOpacity={0.2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      );
    }

    if (type === 'scatter' && xAxis && yAxis) {
      return (
        <div>
          {title && <h4 className="text-sm font-medium text-center mb-4">{title}</h4>}
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey={xAxis} name={xAxis} className="text-xs" axisLine={false} tickLine={false} />
                <YAxis dataKey={yAxis} name={yAxis} className="text-xs" axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Scatter data={chartData} fill={CHART_COLORS[0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      );
    }

    return null;
  };

  const showChart = chartSuggestion.type !== 'table' && chartSuggestion.xAxis && chartSuggestion.yAxis;

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-sm">{summary}</p>
        </div>
      )}

      {/* Main Results Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Query Results</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{rowCount} rows</Badge>
              <Badge variant="outline">{executionTime}ms</Badge>
              
              <Button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="h-8 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs transition-colors shadow-xs font-semibold"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={showChart ? 'chart' : 'table'}>
            <TabsList className="mb-4">
              <TabsTrigger value="table" className="gap-2">
                <TableIcon className="h-4 w-4" />
                Table
              </TabsTrigger>
              {showChart && (
                <TabsTrigger value="chart" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Chart
                </TabsTrigger>
              )}
              <TabsTrigger value="sql" className="gap-2">
                <Code className="h-4 w-4" />
                SQL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table">
              <ScrollArea className="w-full max-w-[calc(100vw-3rem)] md:max-w-full">
                <div className="max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col} className="whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 100).map((row, idx) => (
                        <TableRow key={idx}>
                          {columns.map((col) => (
                            <TableCell key={col} className="whitespace-nowrap">
                              {String(row[col] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {rowCount > 100 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Showing first 100 of {rowCount} rows
                </p>
              )}
            </TabsContent>

            {showChart && (
              <TabsContent value="chart">{renderChart()}</TabsContent>
            )}

            <TabsContent value="sql">
              <pre className="p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
                {sql}
              </pre>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Recommended Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="grid gap-2">
                {recommendations.map((rec, idx) => {
                  const Icon = getRecommendationIcon(rec.type);
                  const colorClass = getRecommendationColor(rec.type);
                  
                  return (
                    <Button
                      key={idx}
                      variant="ghost"
                      className={`h-auto p-3 justify-start text-left border ${colorClass} hover:opacity-80`}
                      onClick={() => onRecommendationClick?.(rec.question)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{rec.question}</p>
                          <p className="text-xs opacity-75 mt-0.5">{rec.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {rec.type}
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
