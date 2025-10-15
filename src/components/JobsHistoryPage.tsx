import { useState, useCallback } from 'react';
import { useJobsHistory } from '@/components/hooks/useJobsHistory';
import { JobsTable } from '@/components/JobsTable';
import { JobStatusFilter } from '@/components/JobStatusFilter';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import type { JobStatus } from '@/types';

export function JobsHistoryPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const { jobs, meta, loading, error, refetch } = useJobsHistory({
    page,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterChange = useCallback((value: JobStatus | 'all') => {
    setStatusFilter(value);
    setPage(1); // Reset to first page on filter
  }, []);

  // Loading state
  if (loading && jobs.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Historia zleceń</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Ładowanie zleceń...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && jobs.length === 0) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Historia zleceń</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">
              Wystąpił błąd podczas ładowania zleceń
            </h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={refetch}>Spróbuj ponownie</Button>
          </div>
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Historia zleceń</h1>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          Odśwież
        </Button>
      </div>

      {/* Filters Section */}
      <section className="flex flex-col md:flex-row gap-4 mb-6">
        <JobStatusFilter value={statusFilter} onChange={handleFilterChange} />
      </section>

      {/* Summary */}
      {meta && (
        <div className="text-sm text-muted-foreground mb-4">
          Znaleziono {meta.total} zleceń
        </div>
      )}

      {/* Jobs Table */}
      <section className="mb-6">
        <JobsTable jobs={jobs} />
      </section>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <section>
          <PaginationControls
            currentPage={page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
            isLoading={loading}
          />
        </section>
      )}

      <Toaster />
    </main>
  );
}
