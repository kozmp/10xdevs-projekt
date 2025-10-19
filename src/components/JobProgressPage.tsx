import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { useJobProgress } from "@/components/hooks/useJobProgress";
import { JobProgressBar } from "@/components/JobProgressBar";
import { JobProductsList } from "@/components/JobProductsList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";

interface JobProgressPageProps {
  jobId: string;
}

export function JobProgressPage({ jobId }: JobProgressPageProps) {
  const { job, products, loading, error, cancel } = useJobProgress(jobId);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const completedProducts = useMemo(() => {
    if (!products) return 0;
    return products.filter((p) => p.status === "completed").length;
  }, [products]);

  const totalCost = useMemo(() => {
    if (!products) return 0;
    return products.reduce((sum, p) => sum + (p.cost || 0), 0);
  }, [products]);

  const formattedDate = useMemo(() => {
    if (!job?.createdAt) return "-";
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(job.createdAt));
  }, [job]);

  const handleCancelClick = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    const success = await cancel();
    if (success) {
      toast.success("Zlecenie zostało anulowane");
    } else {
      toast.error("Nie udało się anulować zlecenia");
    }
    setShowCancelModal(false);
  }, [cancel]);

  const canCancel = job?.status === "processing";

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
            <Button onClick={() => (window.location.href = "/jobs")}>Wróć do listy zleceń</Button>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Postęp zlecenia</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: <span className="font-mono">{jobId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/jobs")}>
            Wróć do listy
          </Button>
          {canCancel && (
            <Button variant="destructive" onClick={handleCancelClick}>
              Anuluj zlecenie
            </Button>
          )}
        </div>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Szczegóły zlecenia</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Data utworzenia</div>
                <div className="font-medium">{formattedDate}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Styl</div>
                <div className="font-medium">{job.style}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Język</div>
                <div className="font-medium uppercase">{job.language}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Tryb publikacji</div>
                <div className="font-medium">{job.publicationMode === "draft" ? "Szkic" : "Opublikuj"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Szacowany koszt</div>
                <div className="font-medium">${job.totalCostEstimate?.toFixed(2) || "0.00"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Rzeczywisty koszt</div>
                <div className="font-bold text-lg">${totalCost.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Products List */}
        {products && products.length > 0 && (
          <section>
            <JobProductsList products={products} />
          </section>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anuluj zlecenie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz anulować to zlecenie? Ta operacja nie może być cofnięta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Nie, kontynuuj
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Tak, anuluj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </main>
  );
}
