import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

/**
 * Komponent wyświetlający asynchronicznie obliczone koszty dla joba
 *
 * Pokazuje:
 * - Stan ładowania gdy koszty są jeszcze obliczane (pending)
 * - Finalne koszty po zakończeniu kalkulacji
 * - Breakdown tokenów (input + output)
 *
 * @example
 * ```tsx
 * <JobCostEstimateCard
 *   totalCostEstimate={0.5}
 *   estimatedTokensTotal={5000}
 *   isLoading={false}
 * />
 * ```
 */

export interface JobCostEstimateCardProps {
  /** Całkowity szacunkowy koszt w USD (null = jeszcze się oblicza) */
  totalCostEstimate?: number | null;
  /** Łączna liczba tokenów (input + output) */
  estimatedTokensTotal?: number | null;
  /** Stan ładowania - gdy true, pokazuje szkielet */
  isLoading?: boolean;
  /** Liczba produktów w jobie (do wyświetlenia kosztu per produkt) */
  productCount?: number;
}

/**
 * Formatuje koszt w USD do wyświetlenia
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
 * Formatuje liczbę tokenów z separatorem tysięcy
 */
const formatTokens = (tokens: number): string => {
  return new Intl.NumberFormat("en-US").format(tokens);
};

export const JobCostEstimateCard: React.FC<JobCostEstimateCardProps> = ({
  totalCostEstimate,
  estimatedTokensTotal,
  isLoading = false,
  productCount,
}) => {
  // Stan: Ładowanie (API call w trakcie)
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Szacunkowy Koszt</CardTitle>
          <CardDescription>Ładowanie danych...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  // Stan: Pending (Job utworzony, ale koszty jeszcze się obliczają w tle)
  const isPending = totalCostEstimate === null || totalCostEstimate === undefined;

  if (isPending) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Szacunkowy Koszt</CardTitle>
            <Badge variant="secondary" className="animate-pulse">
              Obliczanie...
            </Badge>
          </div>
          <CardDescription>Kalkulacja kosztów w trakcie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-muted-foreground/30 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-5 w-5 animate-spin text-muted-foreground"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Szacowanie kosztów...</p>
              <p className="text-xs text-muted-foreground">Powinno być gotowe za chwilę (1-2s)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stan: Success (Koszty obliczone)
  const costPerProduct = productCount && productCount > 0 ? totalCostEstimate / productCount : totalCostEstimate;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Szacunkowy Koszt</CardTitle>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            Obliczono
          </Badge>
        </div>
        <CardDescription>Szacunek kosztów generowania opisów AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Cost - Main Display */}
        <div className="rounded-lg bg-primary/10 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Całkowity koszt</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-primary" aria-label="Total estimated cost">
            {formatCost(totalCostEstimate)}
          </div>
          {productCount && productCount > 0 && (
            <div className="mt-1 text-sm text-muted-foreground">
              {formatCost(costPerProduct)} na produkt ({productCount} {productCount === 1 ? "produkt" : "produktów"})
            </div>
          )}
        </div>

        {/* Token Count */}
        {estimatedTokensTotal !== null && estimatedTokensTotal !== undefined && (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-blue-600 dark:text-blue-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M13 7H7v6h6V7z" />
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium">Łączna liczba tokenów</div>
                <div className="text-xs text-muted-foreground">Input + Output</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold" aria-label="Total estimated tokens">
                {formatTokens(estimatedTokensTotal)}
              </div>
              <div className="text-xs text-muted-foreground">tokens</div>
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-950">
          <div className="flex gap-2">
            <svg
              className="h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
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
            <p className="text-xs text-blue-700 dark:text-blue-300">
              To tylko szacunek. Rzeczywisty koszt może się różnić w zależności od długości wygenerowanych opisów.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
