import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { CostEstimateResponse } from "../types";

/**
 * Komponent wyświetlający podsumowanie kalkulacji kosztów
 * dla generowania opisów produktów
 *
 * @example
 * ```tsx
 * <CostEstimateSummary
 *   estimate={estimateData}
 *   onConfirm={() => startJob()}
 *   onCancel={() => closeModal()}
 * />
 * ```
 */

interface CostEstimateSummaryProps {
  /** Dane kalkulacji kosztów z API */
  estimate: CostEstimateResponse;
  /** Callback po kliknięciu "Potwierdź i rozpocznij" */
  onConfirm: () => void;
  /** Callback po kliknięciu "Anuluj" */
  onCancel: () => void;
  /** Loading state dla przycisku Confirm */
  isLoading?: boolean;
  /** Disable confirm button (np. gdy brak środków) */
  confirmDisabled?: boolean;
}

/**
 * Formatuje koszt w USD do wyświetlenia
 * @param cost - Koszt w USD
 * @returns Sformatowany string z symbolem waluty
 */
const formatCost = (cost: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(cost);
};

/**
 * Formatuje czas trwania w sekundach do czytelnego formatu
 * @param seconds - Czas w sekundach
 * @returns Sformatowany string (np. "2m 30s" lub "45s")
 */
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
};

/**
 * Formatuje liczbę tokenów z separatorem tysięcy
 */
const formatTokens = (tokens: number): string => {
  return new Intl.NumberFormat("en-US").format(tokens);
};

export const CostEstimateSummary: React.FC<CostEstimateSummaryProps> = ({
  estimate,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmDisabled = false,
}) => {
  const { totalCost, totalTokens, productCount, estimatedDuration, costPerProduct, breakdown, model } = estimate;

  // Oblicz procent kosztów input vs output
  const inputCostPercent = totalCost > 0 ? (breakdown.inputCost / totalCost) * 100 : 50;
  const outputCostPercent = totalCost > 0 ? (breakdown.outputCost / totalCost) * 100 : 50;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Szacunkowy Koszt Generowania</CardTitle>
        <CardDescription>
          Kalkulacja kosztów dla {productCount} {productCount === 1 ? "produktu" : "produktów"} przy użyciu modelu{" "}
          <span className="font-mono text-sm">{model}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Cost - Main CTA */}
        <div className="rounded-lg bg-primary/10 p-6 text-center">
          <div className="text-sm font-medium text-muted-foreground">Całkowity koszt</div>
          <div className="mt-2 text-4xl font-bold tracking-tight text-primary">{formatCost(totalCost)}</div>
          <div className="mt-2 text-sm text-muted-foreground">
            {formatCost(costPerProduct)} na produkt • {formatDuration(estimatedDuration)} szacowany czas
          </div>
        </div>

        {/* Token Breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Breakdown tokenów</h3>

          {/* Input Tokens Row */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 dark:text-blue-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">Input Tokens</div>
                <div className="text-xs text-muted-foreground">Dane produktów + instrukcje</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">{formatTokens(breakdown.inputTokens)}</div>
              <div className="text-xs text-muted-foreground">{formatCost(breakdown.inputCost)}</div>
            </div>
          </div>

          {/* Output Tokens Row */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600 dark:text-green-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">Output Tokens</div>
                <div className="text-xs text-muted-foreground">Wygenerowane opisy</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">{formatTokens(breakdown.outputTokens)}</div>
              <div className="text-xs text-muted-foreground">{formatCost(breakdown.outputCost)}</div>
            </div>
          </div>

          {/* Cost Distribution Bar */}
          <div className="space-y-2">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${inputCostPercent}%` }}
                aria-label={`Input cost: ${inputCostPercent.toFixed(1)}%`}
              />
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${outputCostPercent}%` }}
                aria-label={`Output cost: ${outputCostPercent.toFixed(1)}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Input: {inputCostPercent.toFixed(1)}%</span>
              <span>Output: {outputCostPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
          <div>
            <div className="text-xs text-muted-foreground">Łącznie tokenów</div>
            <div className="font-mono text-lg font-semibold">{formatTokens(totalTokens)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Produktów</div>
            <div className="font-mono text-lg font-semibold">{productCount}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Szacowany czas</div>
            <div className="font-mono text-lg font-semibold">{formatDuration(estimatedDuration)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Model</div>
            <div className="truncate font-mono text-sm font-semibold" title={model}>
              {model.split("/")[1] || model}
            </div>
          </div>
        </div>

        {/* Info Message */}
        <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium">To tylko szacunek</p>
              <p className="mt-1 text-xs">
                Rzeczywisty koszt może się nieznacznie różnić w zależności od długości wygenerowanych opisów. Zostaniesz
                obciążony tylko za faktycznie użyte tokeny.
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Anuluj
        </Button>
        <Button onClick={onConfirm} disabled={confirmDisabled || isLoading}>
          {isLoading ? "Rozpoczynanie..." : "Potwierdź i rozpocznij"}
        </Button>
      </CardFooter>
    </Card>
  );
};
