'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Detailed system analytics and insights
        </p>
      </div>

      {/* Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Coming Soon</CardTitle>
          </div>
          <CardDescription>Advanced analytics features are in development</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will include:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Usage trends over time</li>
            <li>Query performance metrics</li>
            <li>User activity heatmaps</li>
            <li>Revenue analytics</li>
            <li>Retention metrics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
