import React from "react";
import { JobsTable } from "@/components/tables/JobsTable";
import { PaginationControls } from "@/components/PaginationControls";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { JobsHistoryHeader } from "./JobsHistoryHeader";
import { JobsHistoryFilters } from "./JobsHistoryFilters";
import { JobsHistorySummary } from "./JobsHistorySummary";
import { useJobsHistoryPage } from "./useJobsHistoryPage";
import type { JobsHistoryPageProps } from "./types";

export function JobsHistoryPage({ initialPage, initialStatus }: JobsHistoryPageProps) {
  const { page, statusFilter, jobs, meta, loading, error, handlePageChange, handleFilterChange, handleRefresh } =
    useJobsHistoryPage(initialPage, initialStatus);

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
            <h2 className="text-xl font-semibold mb-2">Wystąpił błąd podczas ładowania zleceń</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={handleRefresh}>Spróbuj ponownie</Button>
          </div>
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6">
      <JobsHistoryHeader onRefresh={handleRefresh} isLoading={loading} />

      <JobsHistoryFilters value={statusFilter} onChange={handleFilterChange} />

      <JobsHistorySummary meta={meta} />

      <section className="mb-6">
        <JobsTable jobs={jobs} />
      </section>

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
