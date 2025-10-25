import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useDashboardData } from "@/components/hooks/useDashboardData";
import { StatusCard } from "@/components/StatusCard";
import { ProductsCountCard } from "@/components/ProductsCountCard";
import { RecentJobsTable } from "@/components/RecentJobsTable";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Toaster } from "@/components/ui/sonner";

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboardData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if shop is not configured and open modal
  useEffect(() => {
    if (data && !data.shop.isConnected) {
      setIsModalOpen(true);
      toast.info("Skonfiguruj klucz API", {
        description: "Aby korzystać z aplikacji, musisz wprowadzić klucz API Shopify",
      });
    }
  }, [data]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error("Błąd podczas ładowania danych", {
        description: error.message,
      });
    }
  }, [error]);

  // Loading state
  if (loading) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
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
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Wystąpił błąd podczas ładowania danych</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </main>
    );
  }

  // No data state (shouldn't happen if error is handled)
  if (!data) {
    return (
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Brak danych do wyświetlenia</p>
        </div>
      </main>
    );
  }

  // Check if shop is connected (defensive programming with optional chaining)
  const isShopConnected = data.shop?.isConnected ?? false;
  const shopName = data.shop?.shopifyDomain;

  return (
    <main className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={refetch}
          className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
          aria-label="Odśwież dane"
        >
          Odśwież
        </button>
      </div>

      {/* Grid with cards */}
      <section className="grid gap-6 md:grid-cols-2 mb-6">
        <StatusCard status={isShopConnected} shopName={shopName} />
        <ProductsCountCard count={data.count} />
      </section>

      {/* Recent jobs table */}
      <section>
        <RecentJobsTable jobs={data.jobs} />
      </section>

      {/* API Key Modal */}
      <ApiKeyModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} />

      {/* Toast notifications */}
      <Toaster />
    </main>
  );
}
