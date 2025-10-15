import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface JobProgressBarProps {
  progress: number;
  status: string;
  totalProducts: number;
  completedProducts: number;
}

const statusLabels: Record<string, string> = {
  pending: 'Oczekujący',
  processing: 'W trakcie',
  completed: 'Zakończony',
  failed: 'Błąd',
  cancelled: 'Anulowany',
};

const statusColors: Record<string, string> = {
  pending: 'text-yellow-600',
  processing: 'text-blue-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
  cancelled: 'text-gray-600',
};

export function JobProgressBar({
  progress,
  status,
  totalProducts,
  completedProducts,
}: JobProgressBarProps) {
  const progressPercentage = useMemo(() => {
    return Math.min(Math.max(progress, 0), 100);
  }, [progress]);

  const statusLabel = statusLabels[status] || status;
  const statusColor = statusColors[status] || 'text-gray-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Postęp generowania</CardTitle>
        <CardDescription>
          <span className={statusColor}>{statusLabel}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {completedProducts} / {totalProducts} produktów
            </span>
            <span className="text-sm font-medium">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {status === 'processing' && (
          <p className="text-sm text-muted-foreground">
            Generowanie opisów może potrwać kilka minut...
          </p>
        )}

        {status === 'completed' && (
          <p className="text-sm text-green-600">
            ✓ Wszystkie opisy zostały wygenerowane
          </p>
        )}

        {status === 'failed' && (
          <p className="text-sm text-red-600">
            ⚠ Wystąpił błąd podczas generowania
          </p>
        )}

        {status === 'cancelled' && (
          <p className="text-sm text-gray-600">Zlecenie zostało anulowane</p>
        )}
      </CardContent>
    </Card>
  );
}
