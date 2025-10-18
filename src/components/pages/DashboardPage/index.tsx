import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardLoading } from "./DashboardLoading";
import { DashboardError } from "./DashboardError";
import { DashboardContent } from "./DashboardContent";
import { useDashboard } from "./useDashboard";
import { MESSAGES, STYLES } from "./constants";
import type { DashboardPageProps } from "./types";

export function DashboardPage({ className = STYLES.CONTAINER }: DashboardPageProps) {
  const { data, loading, error, hasShop, isModalOpen, handleRefresh, handleModalClose, handleModalSuccess } =
    useDashboard();

  if (loading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <DashboardError error={error} onRetry={handleRefresh} />;
  }

  if (!data) {
    return (
      <main className={className}>
        <h1 className={`${STYLES.TITLE} mb-6`}>{MESSAGES.NO_DATA}</h1>
      </main>
    );
  }

  return (
    <main className={className}>
      <DashboardHeader onRefresh={handleRefresh} />
      <DashboardContent data={data} hasShop={hasShop} />

      {/* API Key Modal */}
      <ApiKeyModal open={isModalOpen} onClose={handleModalClose} onSuccess={handleModalSuccess} />

      {/* Toast notifications */}
      <Toaster />
    </main>
  );
}
