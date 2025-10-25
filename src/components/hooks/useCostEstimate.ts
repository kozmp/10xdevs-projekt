import { useState, useCallback, useEffect } from "react";
import { calculateCostEstimate, getAvailableModels, type AvailableModel } from "../../lib/api/cost-estimate-api";
import type { CostEstimateRequest, CostEstimateResponse } from "../../types";
import { toast } from "sonner";

/**
 * Stan custom hooka useCostEstimate
 */
interface UseCostEstimateState {
  /** Aktualny wynik kalkulacji (null jeśli jeszcze nie kalkulowano) */
  estimate: CostEstimateResponse | null;
  /** Czy trwa kalkulacja */
  isCalculating: boolean;
  /** Błąd kalkulacji (null jeśli brak błędu) */
  error: string | null;
  /** Lista dostępnych modeli AI */
  availableModels: AvailableModel[];
  /** Czy trwa ładowanie listy modeli */
  isLoadingModels: boolean;
  /** Czy dialog z kalkulacją jest otwarty */
  isDialogOpen: boolean;
}

/**
 * Akcje zwracane przez hook
 */
interface UseCostEstimateActions {
  /** Funkcja do wykonania kalkulacji */
  calculate: (request: CostEstimateRequest) => Promise<void>;
  /** Reset stanu (np. po zamknięciu dialogu) */
  reset: () => void;
  /** Otwórz dialog z kalkulacją */
  openDialog: () => void;
  /** Zamknij dialog */
  closeDialog: () => void;
  /** Refresh listy modeli */
  refreshModels: () => Promise<void>;
}

/**
 * Zwracany typ z hooka
 */
type UseCostEstimateReturn = UseCostEstimateState & UseCostEstimateActions;

/**
 * Custom hook do zarządzania kalkulacją kosztów generowania opisów
 *
 * Funkcjonalność:
 * - Automatyczne pobieranie listy dostępnych modeli przy montowaniu
 * - Kalkulacja kosztów z obsługą błędów
 * - Zarządzanie stanem dialogu
 * - Toast notifications dla błędów
 *
 * @param options - Opcje hooka
 * @param options.autoLoadModels - Czy automatycznie pobrać listę modeli (default: true)
 *
 * @example
 * ```tsx
 * function GenerateForm() {
 *   const {
 *     estimate,
 *     isCalculating,
 *     availableModels,
 *     calculate,
 *     isDialogOpen,
 *     openDialog,
 *     closeDialog
 *   } = useCostEstimate();
 *
 *   const handleCalculate = async () => {
 *     await calculate({
 *       productIds: selectedProducts,
 *       style: 'professional',
 *       language: 'pl',
 *       model: 'openai/gpt-4o-mini'
 *     });
 *     openDialog();
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleCalculate}>Oblicz koszt</button>
 *       <CostEstimateDialog
 *         open={isDialogOpen}
 *         onOpenChange={closeDialog}
 *         estimate={estimate}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useCostEstimate(options?: { autoLoadModels?: boolean }): UseCostEstimateReturn {
  const { autoLoadModels = true } = options || {};

  // State
  const [estimate, setEstimate] = useState<CostEstimateResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  /**
   * Pobierz listę dostępnych modeli
   */
  const refreshModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const models = await getAvailableModels();
      setAvailableModels(models);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się pobrać listy modeli";
      console.error("Error loading models:", err);
      toast.error(errorMessage);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  /**
   * Wykonaj kalkulację kosztów
   */
  const calculate = useCallback(async (request: CostEstimateRequest) => {
    setIsCalculating(true);
    setError(null);
    setEstimate(null);

    try {
      const result = await calculateCostEstimate(request);
      setEstimate(result);
      setError(null);
      // Nie pokazujemy toast sukcesu - estimate jest wyświetlane w dialogu
      return result; // Zwróć result dla łatwiejszego sprawdzania w komponencie
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nie udało się obliczyć kosztów";
      setError(errorMessage);
      setEstimate(null);
      // Nie pokazujemy toasta - błąd jest wyświetlany w dialogu
      console.error("Cost estimation error:", err);
      throw err; // Re-throw aby komponent mógł obsłużyć błąd
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Reset stanu kalkulacji
   */
  const reset = useCallback(() => {
    setEstimate(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  /**
   * Otwórz dialog z wynikiem kalkulacji
   */
  const openDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  /**
   * Zamknij dialog i opcjonalnie zresetuj stan
   */
  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    // Zachowaj estimate aby można było ponownie otworzyć dialog
    // Reset nastąpi przy nowej kalkulacji
  }, []);

  // Auto-load models on mount
  useEffect(() => {
    if (autoLoadModels) {
      refreshModels();
    }
  }, [autoLoadModels, refreshModels]);

  return {
    // State
    estimate,
    isCalculating,
    error,
    availableModels,
    isLoadingModels,
    isDialogOpen,

    // Actions
    calculate,
    reset,
    openDialog,
    closeDialog,
    refreshModels,
  };
}
