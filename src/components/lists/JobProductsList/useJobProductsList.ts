import { useCallback } from "react";
import { STATUS_LABELS, STATUS_COLORS } from "./constants";
import type { JobProduct, TokenUsageDetails, UseJobProductsListReturn } from "./types";

export function useJobProductsList(): UseJobProductsListReturn {
  const getStatusLabel = useCallback((status: JobProduct["status"]) => {
    return STATUS_LABELS[status] || status;
  }, []);

  const getStatusColor = useCallback((status: JobProduct["status"]) => {
    return STATUS_COLORS[status] || "text-gray-600";
  }, []);

  const getTokenCount = useCallback((details: string | null) => {
    if (!details) return null;
    try {
      const tokens = JSON.parse(details) as TokenUsageDetails;
      return (tokens.input || 0) + (tokens.output || 0);
    } catch {
      return null;
    }
  }, []);

  const formatCost = useCallback((cost: number | null) => {
    return cost ? `$${cost.toFixed(4)}` : "-";
  }, []);

  const formatTokens = useCallback((count: number | null) => {
    return count ? count.toLocaleString() : "-";
  }, []);

  return {
    getStatusLabel,
    getStatusColor,
    getTokenCount,
    formatCost,
    formatTokens,
  };
}
