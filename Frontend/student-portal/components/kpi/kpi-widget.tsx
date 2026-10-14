import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card/card';
import { LucideIcon } from 'lucide-react';

interface KpiWidgetProps {
  label: string;
  value: number | null;
  description?: string;
  icon?: LucideIcon;
}

export function KpiWidget({ label, value, description, icon: Icon }: KpiWidgetProps) {
  const formattedValue = value !== null ? value.toLocaleString() : '—';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {description && <CardDescription className="text-xs text-muted-foreground mt-1">{description}</CardDescription>}
      </CardContent>
    </Card>
  );
}