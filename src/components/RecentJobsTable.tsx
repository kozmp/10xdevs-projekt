import { useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { JobListDTO } from '@/types';

interface RecentJobsTableProps {
  jobs: JobListDTO[];
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

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }, []);

  const handleRowClick = useCallback((jobId: string) => {
    window.location.href = `/jobs/${jobId}`;
  }, []);

  const tableRows = useMemo(
    () =>
      jobs.map((job) => (
        <TableRow
          key={job.jobId}
          onClick={() => handleRowClick(job.jobId)}
          className="cursor-pointer hover:bg-muted/50"
        >
          <TableCell className="font-medium">{job.jobId.slice(0, 8)}</TableCell>
          <TableCell>
            <span className={statusColors[job.status] || 'text-gray-600'}>
              {statusLabels[job.status] || job.status}
            </span>
          </TableCell>
          <TableCell>{job.style}</TableCell>
          <TableCell className="uppercase">{job.language}</TableCell>
          <TableCell>{formatDate(job.createdAt)}</TableCell>
        </TableRow>
      )),
    [jobs, formatDate, handleRowClick]
  );

  if (jobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ostatnie zlecenia</CardTitle>
          <CardDescription>5 ostatnich batch jobów</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brak zleceń</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnie zlecenia</CardTitle>
        <CardDescription>5 ostatnich batch jobów</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Styl</TableHead>
              <TableHead>Język</TableHead>
              <TableHead>Data utworzenia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
