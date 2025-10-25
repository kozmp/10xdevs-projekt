import React, { useState } from "react";
import { CostEstimateDialog } from "./CostEstimateDialog";
import { CostPreviewBadge } from "./CostPreviewBadge";
import { ModelSelector } from "./ModelSelector";
import { Button } from "./ui/button";
import type { CostEstimateResponse } from "../types";

/**
 * Komponent demonstracyjny dla systemu kalkulacji kosztów
 *
 * Pokazuje wszystkie komponenty związane z cost estimation:
 * - ModelSelector (wybór modelu AI)
 * - CostPreviewBadge (szybki podgląd)
 * - CostEstimateDialog (pełny dialog z podsumowaniem)
 *
 * W ETAPIE 4 ten komponent zostanie zastąpiony prawdziwą integracją API
 */
export const CostEstimateDemo: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - w ETAPIE 4 będzie z API
  const mockModels = [
    {
      model: "openai/gpt-4o-mini",
      inputCost: 0.15,
      outputCost: 0.6,
      speed: "~150 tokens/sec",
      description: "Szybki i ekonomiczny model, idealny do generowania opisów produktów",
      recommended: true,
    },
    {
      model: "openai/gpt-4o",
      inputCost: 2.5,
      outputCost: 10.0,
      speed: "~100 tokens/sec",
      description: "Najwyższa jakość, najlepszy dla kreatywnych opisów premium",
    },
    {
      model: "anthropic/claude-3-haiku",
      inputCost: 0.25,
      outputCost: 1.25,
      speed: "~120 tokens/sec",
      description: "Bardzo szybki i naturalny, dobry kompromis jakości i ceny",
    },
  ];

  const mockEstimate: CostEstimateResponse = {
    totalCost: 0.00234,
    totalTokens: 3750,
    productCount: 5,
    estimatedDuration: 25,
    costPerProduct: 0.000468,
    breakdown: {
      inputTokens: 1000,
      outputTokens: 2750,
      inputCost: 0.00015,
      outputCost: 0.00219,
    },
    model: selectedModel,
    timestamp: new Date().toISOString(),
  };

  const handleCalculateCost = () => {
    setIsLoading(true);
    // Symuluj opóźnienie API
    setTimeout(() => {
      setIsLoading(false);
      setShowDialog(true);
    }, 1500);
  };

  const handleConfirm = () => {
    console.log("Starting job with model:", selectedModel);
    setShowDialog(false);
    // W ETAPIE 4: Wywołanie API do rozpoczęcia job
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cost Estimation Demo</h1>
        <p className="text-muted-foreground">
          Demonstracja komponentów UI do kalkulacji kosztów (FR-017/018 ETAP 3 - Frontend)
        </p>
      </div>

      {/* Model Selector */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">1. Wybór Modelu AI</h2>
        <ModelSelector models={mockModels} selectedModel={selectedModel} onModelChange={setSelectedModel} />
      </div>

      {/* Cost Preview Badges */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">2. Podgląd Kosztów</h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Wariant Compact:</p>
            <CostPreviewBadge estimatedCost={mockEstimate.totalCost} productCount={mockEstimate.productCount} variant="compact" />
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Wariant Detailed:</p>
            <CostPreviewBadge
              estimatedCost={mockEstimate.totalCost}
              productCount={mockEstimate.productCount}
              variant="detailed"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">3. Rozpocznij Kalkulację</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Kliknij przycisk aby otworzyć pełny dialog z podsumowaniem kosztów
        </p>
        <Button onClick={handleCalculateCost} disabled={isLoading} size="lg">
          {isLoading ? "Kalkulowanie..." : "Pokaż szczegółową kalkulację"}
        </Button>
      </div>

      {/* Dialog Component */}
      <CostEstimateDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        estimate={showDialog ? mockEstimate : null}
        onConfirm={handleConfirm}
      />

      {/* Implementation Notes */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">📝 Notatki Implementacyjne</h3>
        <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          <li>✅ Komponenty są w pełni responsywne</li>
          <li>✅ Obsługa dark mode przez Tailwind</li>
          <li>✅ Accessibility: ARIA labels, semantic HTML</li>
          <li>✅ TypeScript: Pełna obsługa typów</li>
          <li>⏳ ETAP 4: Integracja z API /api/jobs/estimate</li>
          <li>⏳ ETAP 4: Custom hook useCostEstimate dla zarządzania stanem</li>
        </ul>
      </div>
    </div>
  );
};
