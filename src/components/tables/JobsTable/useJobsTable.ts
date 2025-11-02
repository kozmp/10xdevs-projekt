import { useCallback } from "react";
import { STATUS_LABELS, STATUS_COLORS, DATE_FORMAT_OPTIONS } from "./constants";
import type { JobStatus, PublicationMode, UseJobsTableReturn } from "./types";

export function useJobsTable(): UseJobsTableReturn {
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pl-PL", DATE_FORMAT_OPTIONS).format(date);
  }, []);

  const handleRowClick = useCallback((jobId: string) => {
    window.location.href = `/jobs/${jobId}`;
  }, []);

  const getStatusLabel = useCallback((status: JobStatus) => {
    return STATUS_LABELS[status] || status;
  }, []);

  const getStatusColor = useCallback((status: JobStatus) => {
    return STATUS_COLORS[status] || "text-gray-600";
  }, []);

  const getPublicationModeLabel = useCallback((mode: PublicationMode) => {
    return mode === "draft" ? "Szkic" : "Opublikuj";
  }, []);

  return {
    formatDate,
    handleRowClick,
    getStatusLabel,
    getStatusColor,
    getPublicationModeLabel,
  };
}
