import React from "react";

/**
 * Props dla CostPreviewBadge
 */
interface CostPreviewBadgeProps {
  /** Szacunkowy koszt w USD */
  estimatedCost: number;
  /** Liczba produktów */
  productCount: number;
  /** Wariant wyświetlania */
  variant?: "compact" | "detailed";
  /** Dodatkowa klasa CSS */
  className?: string;
}

/**
 * Pomocniczy komponent wyświetlający szybki podgląd kosztu
 *
 * Używany np. w formularzu generowania przed otwarciem pełnego dialogu,
 * lub jako badge przy wyborze produktów.
 *
 * @example
 * ```tsx
 * <CostPreviewBadge
 *   estimatedCost={0.0023}
 *   productCount={5}
 *   variant="detailed"
 * />
 * ```
 */
export const CostPreviewBadge: React.FC<CostPreviewBadgeProps> = ({
  estimatedCost,
  productCount,
  variant = "compact",
  className = "",
}) => {
  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(cost);
  };

  const costPerProduct = productCount > 0 ? estimatedCost / productCount : 0;

  if (variant === "compact") {
    return (
      <div
        className={`inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
        <span>~{formatCost(estimatedCost)}</span>
      </div>
    );
  }

  // Detailed variant
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 ${className}`}
      role="status"
      aria-label={`Estimated cost: ${formatCost(estimatedCost)} for ${productCount} products`}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-primary"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-muted-foreground">Szacunkowy koszt:</span>
          <span className="font-mono text-lg font-bold text-primary">{formatCost(estimatedCost)}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatCost(costPerProduct)} na produkt • {productCount} {productCount === 1 ? "produkt" : "produktów"}
        </div>
      </div>
    </div>
  );
};
