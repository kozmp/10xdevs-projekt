import { useId } from "react";
import { STATUS_OPTIONS } from "./constants";
import type { UseJobStatusFilterReturn } from "./types";

export function useJobStatusFilter(): UseJobStatusFilterReturn {
  const selectId = useId();

  return {
    selectId,
    statusOptions: STATUS_OPTIONS,
  };
}
