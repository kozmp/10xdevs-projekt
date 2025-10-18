import React from "react";
import { JobProgressBar } from "@/components/JobProgressBar";
import { JobProductsList } from "@/components/JobProductsList";
import { Toaster } from "@/components/ui/sonner";
import { JobProgressHeader } from "./JobProgressHeader";
import { JobProgressDetails } from "./JobProgressDetails";
import { JobProgressCancelModal } from "./JobProgressCancelModal";
import { useJobProgressPage } from "./useJobProgressPage";
import type { JobProgressPageProps } from "./types";

export function JobProgressPage({ jobId }: JobProgressPageProps) {
  const {
    job,
    products,
    loading,
    error,
    completedProducts,
    totalCost,
    formattedDate,
    canCancel,
    showCancelModal,
    handleCancelClick,
    handleConfirmCancel,
    handleBackClick,
    setShowCancelModal,
  } = useJobProgressPage(jobId);

  // Loading state
  if (loading && !job) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Postęp zlecenia</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Ładowanie danych...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Postęp zlecenia</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Wystąpił błąd podczas ładowania</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={handleBackClick}>Wróć do listy zleceń</Button>
          </div>
        </div>
        <Toaster />
      </main>
    );
  }

  // No job state
  if (!job) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Postęp zlecenia</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Nie znaleziono zlecenia</p>
        </div>
        <Toaster />
      </main>
    );
  }

  return (
    <main className="container mx-auto p-6 max-w-5xl">
      <JobProgressHeader
        jobId={jobId}
        canCancel={canCancel}
        onCancelClick={handleCancelClick}
        onBackClick={handleBackClick}
      />

      <div className="space-y-6">
        {/* Progress Bar */}
        <section>
          <JobProgressBar
            progress={job.progress}
            status={job.status}
            totalProducts={products?.length || 0}
            completedProducts={completedProducts}
          />
        </section>

        {/* Job Details */}
        <section>
          <JobProgressDetails job={job} formattedDate={formattedDate} totalCost={totalCost} />
        </section>

        {/* Products List */}
        {products && products.length > 0 && (
          <section>
            <JobProductsList products={products} />
          </section>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <JobProgressCancelModal
        open={showCancelModal}
        onOpenChange={setShowCancelModal}
        onConfirm={handleConfirmCancel}
      />

      <Toaster />
    </main>
  );
}
