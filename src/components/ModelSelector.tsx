import React, { useState } from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

/**
 * Informacje o dostępnym modelu LLM
 */
interface ModelInfo {
  model: string;
  inputCost: number;
  outputCost: number;
  speed: string;
  description?: string;
  recommended?: boolean;
}

/**
 * Props dla ModelSelector
 */
interface ModelSelectorProps {
  /** Lista dostępnych modeli (z API /api/jobs/estimate GET) */
  models: ModelInfo[];
  /** Aktualnie wybrany model */
  selectedModel: string;
  /** Callback przy zmianie modelu */
  onModelChange: (model: string) => void;
  /** Disable input */
  disabled?: boolean;
}

/**
 * Komponent wyboru modelu AI do generowania opisów
 *
 * Wyświetla listę dostępnych modeli z:
 * - Nazwą modelu
 * - Cenami input/output (per 1M tokens)
 * - Szybkością generowania
 * - Rekomendacją (jeśli dotyczy)
 *
 * @example
 * ```tsx
 * <ModelSelector
 *   models={availableModels}
 *   selectedModel="openai/gpt-4o-mini"
 *   onModelChange={(model) => setModel(model)}
 * />
 * ```
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  disabled = false,
}) => {
  // Format pricing dla wyświetlenia
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Skrócona nazwa modelu (bez providera)
  const getShortModelName = (fullName: string): string => {
    const parts = fullName.split("/");
    return parts[parts.length - 1] || fullName;
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">Model AI</Label>
      <RadioGroup value={selectedModel} onValueChange={onModelChange} disabled={disabled} className="space-y-3">
        {models.map((modelInfo) => {
          const isSelected = modelInfo.model === selectedModel;
          const shortName = getShortModelName(modelInfo.model);

          return (
            <label
              key={modelInfo.model}
              className={`
                flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all
                ${isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent"}
                ${disabled ? "cursor-not-allowed opacity-50" : ""}
              `}
              htmlFor={`model-${modelInfo.model}`}
            >
              <RadioGroupItem
                value={modelInfo.model}
                id={`model-${modelInfo.model}`}
                disabled={disabled}
                className="mt-0.5"
              />

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{shortName}</span>
                  {modelInfo.recommended && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
                      Rekomendowany
                    </span>
                  )}
                </div>

                {modelInfo.description && (
                  <p className="text-xs text-muted-foreground">{modelInfo.description}</p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                    <span>
                      Input: <span className="font-mono font-semibold">{formatPrice(modelInfo.inputCost)}/1M</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
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
                    <span>
                      Output: <span className="font-mono font-semibold">{formatPrice(modelInfo.outputCost)}/1M</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Szybkość: {modelInfo.speed}</span>
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </RadioGroup>

      {models.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">Brak dostępnych modeli</p>
        </div>
      )}
    </div>
  );
};
