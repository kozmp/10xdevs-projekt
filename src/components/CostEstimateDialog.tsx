import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CostEstimateSummary } from "./CostEstimateSummary";
import type { CostEstimateResponse } from "../types";

/**
 * Props dla CostEstimateDialog
 */
interface CostEstimateDialogProps {
  /** Czy dialog jest otwarty */
  open: boolean;
  /** Callback do zamknięcia dialogu */
  onOpenChange: (open: boolean) => void;
  /** Dane kalkulacji kosztów (null = loading/error state) */
  estimate: CostEstimateResponse | null;
  /** Callback po potwierdzeniu rozpoczęcia joba */
  onConfirm: () => void;
  /** Loading state podczas kalkulacji */
  isCalculating?: boolean;
  /** Loading state podczas rozpoczynania joba */
  isStartingJob?: boolean;
  /** Error message (jeśli wystąpił błąd podczas kalkulacji) */
  error?: string | null;
}

/**
 * Dialog wyświetlający kalkulację kosztów przed rozpoczęciem generowania
 *
 * Wyświetla:
 * - Loading state podczas pobierania kalkulacji
 * - Error state jeśli kalkulacja się nie powiodła
 * - CostEstimateSummary z danymi kalkulacji
 * - Przyciski akcji (Anuluj / Potwierdź)
 *
 * @example
 * ```tsx
 * const [showDialog, setShowDialog] = useState(false);
 * const [estimate, setEstimate] = useState<CostEstimateResponse | null>(null);
 *
 * <CostEstimateDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   estimate={estimate}
 *   onConfirm={() => startGeneration()}
 *   error={errorMessage}
 * />
 * ```
 */
export const CostEstimateDialog: React.FC<CostEstimateDialogProps> = ({
  open,
  onOpenChange,
  estimate,
  onConfirm,
  isCalculating = false,
  isStartingJob = false,
  error = null,
}) => {
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {/* Loading State */}
        {isCalculating && !estimate && !error && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <DialogTitle className="mb-2">Kalkulacja kosztów...</DialogTitle>
            <DialogDescription>Pobieranie danych produktów i obliczanie szacunkowych kosztów</DialogDescription>
          </div>
        )}

        {/* Error State */}
        {error && !estimate && (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-red-600 dark:text-red-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <DialogTitle className="mb-2 text-red-600 dark:text-red-400">Błąd kalkulacji</DialogTitle>
            <DialogDescription className="mb-6">{error}</DialogDescription>
            <button
              onClick={handleCancel}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Zamknij
            </button>
          </div>
        )}

        {/* Success State - Show Estimate */}
        {estimate && !error && (
          <div className="p-0">
            <CostEstimateSummary
              estimate={estimate}
              onConfirm={onConfirm}
              onCancel={handleCancel}
              isLoading={isStartingJob}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
