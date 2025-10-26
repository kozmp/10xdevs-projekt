import React from "react";
import { useGenerate } from "./hooks/useGenerate";
import { useCostEstimate } from "./hooks/useCostEstimate";
import { StyleSelectCards } from "./StyleSelectCards";
import { LanguageSelect } from "./LanguageSelect";
import { ModelSelector } from "./ModelSelector";
import { CostEstimateDialog } from "./CostEstimateDialog";
import { CostPreviewBadge } from "./CostPreviewBadge";
import type { GenerationStyle, GenerationLanguage } from "@/lib/services/product-description-generator.service";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { ShopResponseDTO } from "../types";

interface GeneratePageProps {
  selectedProductIds: string[];
}

export function GeneratePage({ selectedProductIds }: GeneratePageProps) {
  const [selectedStyle, setSelectedStyle] = React.useState<GenerationStyle>("professional");
  const [selectedLanguage, setSelectedLanguage] = React.useState<GenerationLanguage>("pl");
  const [selectedModel, setSelectedModel] = React.useState<string>("openai/gpt-4o-mini");
  const [systemMessage, setSystemMessage] = React.useState<string>("");
  const [connectionStatus, setConnectionStatus] = React.useState<ShopResponseDTO | null>(null);
  const [isLoadingConnection, setIsLoadingConnection] = React.useState(true);

  const { isGenerating, progress, results, summary, error: generateError } = useGenerate({ ids: selectedProductIds });

  // Cost estimation hook
  const {
    estimate,
    isCalculating,
    error: estimateError,
    availableModels,
    isLoadingModels,
    isDialogOpen,
    calculate,
    openDialog,
    closeDialog,
  } = useCostEstimate();

  // F5: Sprawdzanie statusu połączenia ze sklepem
  React.useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        setIsLoadingConnection(true);
        const response = await fetch("/api/shops");
        if (response.ok) {
          const data: ShopResponseDTO = await response.json();
          setConnectionStatus(data);
        } else {
          console.error("Failed to fetch connection status:", response.statusText);
          setConnectionStatus({ isConnected: false });
        }
      } catch (error) {
        console.error("Error fetching connection status:", error);
        setConnectionStatus({ isConnected: false });
      } finally {
        setIsLoadingConnection(false);
      }
    };

    fetchConnectionStatus();
  }, []);

  // Kalkulacja kosztów przed rozpoczęciem
  const handleCalculateCost = async () => {
    // Walidacja: Sprawdź czy są wybrane produkty
    if (selectedProductIds.length === 0) {
      return; // Button powinien być disabled, ale to dodatkowa ochrona
    }

    // WAŻNE: Otwórz dialog PRZED kalkulacją aby pokazać loading state
    openDialog();

    // Wykonaj kalkulację - hook zaktualizuje stan (estimate lub error)
    try {
      await calculate({
        productIds: selectedProductIds,
        style: selectedStyle,
        language: selectedLanguage,
        model: selectedModel,
      });
      // Dialog już jest otwarty, pokaże estimate gdy się pojawi
    } catch (calcError) {
      // Dialog już jest otwarty, pokaże error state
      // Hook ustawił error state, więc dialog wyświetli komunikat błędu
      console.error("Cost calculation error:", calcError);
    }
  };

  // F4: Rozpoczęcie generowania przez POST /api/jobs (po zatwierdzeniu kosztów)
  const handleConfirmAndGenerate = async () => {
    closeDialog();

    try {
      // POST /api/jobs - asynchroniczne tworzenie joba
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productIds: selectedProductIds,
          style: selectedStyle,
          language: selectedLanguage,
          model: selectedModel,
          systemMessage: systemMessage || undefined, // Nie wysyłaj pustego stringa
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create job");
      }

      const { jobId } = await response.json();

      // F2: Przekieruj do /jobs/:id (job będzie przetwarzany asynchronicznie)
      window.location.href = `/jobs/${jobId}`;
    } catch (jobCreationError) {
      console.error("Job creation error:", jobCreationError);
      // Możesz dodać tutaj wyświetlenie błędu w UI
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Generowanie opisów produktów</h1>
        <p className="text-gray-600">Wybrane produkty: {selectedProductIds.length}</p>
      </div>

      {/* Warning when no products selected */}
      {selectedProductIds.length === 0 && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
          <div className="flex gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-medium">Brak wybranych produktów</p>
              <p className="mt-1">
                Najpierw wybierz produkty ze{" "}
                <a
                  href="/products"
                  className="font-semibold underline hover:text-yellow-800 dark:hover:text-yellow-200"
                >
                  strony produktów
                </a>
                , a następnie kliknij &quot;Generuj opisy&quot;.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Styl komunikacji</h2>
          <StyleSelectCards selected={selectedStyle} onSelect={setSelectedStyle} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Język</h2>
          <LanguageSelect selected={selectedLanguage} onSelect={setSelectedLanguage} />
        </div>

        {/* F4: System Message (własny prompt) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="system-message" className="text-xl font-semibold">
              Własny prompt
            </Label>
            <span className={`text-sm ${systemMessage.length > 6000 ? "text-red-600 font-semibold" : "text-gray-500"}`}>
              {systemMessage.length}/6000
            </span>
          </div>
          <Textarea
            id="system-message"
            placeholder='Dodaj własne instrukcje dla modelu AI, np. "Pisz w stylu młodzieżowym" lub "Skup się na aspektach technicznych"...'
            value={systemMessage}
            onChange={(e) => setSystemMessage(e.target.value)}
            maxLength={6000}
            rows={6}
            disabled={isGenerating}
            aria-invalid={systemMessage.length > 6000}
            className="resize-none"
          />
          <p className="text-sm text-gray-500 mt-1">
            Opcjonalny prompt systemowy pozwala dostosować styl i ton generowanych opisów (max 6000 znaków).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Model AI</h2>
          <ModelSelector
            models={availableModels.map((m) => ({
              ...m,
              recommended: m.model === "openai/gpt-4o-mini",
              description:
                m.model === "openai/gpt-4o-mini"
                  ? "Szybki i ekonomiczny model, idealny do generowania opisów produktów"
                  : m.model === "openai/gpt-4o"
                    ? "Najwyższa jakość, najlepszy dla kreatywnych opisów premium"
                    : "Bardzo szybki i naturalny, dobry kompromis jakości i ceny",
            }))}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isGenerating || isLoadingModels}
          />
          {isLoadingModels && <p className="text-sm text-gray-500">Ładowanie dostępnych modeli...</p>}
        </div>

        {/* Cost Preview */}
        {estimate && !isDialogOpen && (
          <div className="pt-2">
            <CostPreviewBadge
              estimatedCost={estimate.totalCost}
              productCount={estimate.productCount}
              variant="detailed"
            />
          </div>
        )}

        {/* F5: Ostrzeżenie o braku połączenia */}
        {!isLoadingConnection && connectionStatus && !connectionStatus.isConnected && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-red-700 dark:text-red-300">
                <p className="font-medium">Brak połączenia ze sklepem</p>
                <p className="mt-1">
                  Aby rozpocząć generowanie opisów, najpierw{" "}
                  <a href="/dashboard" className="font-semibold underline hover:text-red-800 dark:hover:text-red-200">
                    podłącz swój sklep Shopify
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleCalculateCost}
            disabled={
              isGenerating ||
              isCalculating ||
              selectedProductIds.length === 0 ||
              isLoadingConnection ||
              (connectionStatus && !connectionStatus.isConnected) ||
              systemMessage.length > 6000
            }
            className="w-full"
            size="lg"
          >
            {isCalculating
              ? "Kalkulowanie kosztów..."
              : isLoadingConnection
                ? "Sprawdzanie połączenia..."
                : "Oblicz koszt i rozpocznij generowanie"}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-600 text-center">Generowanie opisów... {progress}%</p>
            </div>
          )}

          {generateError && <div className="p-4 bg-red-50 text-red-600 rounded-md">{generateError}</div>}

          {summary && (
            <div className="p-4 bg-green-50 rounded-md">
              <h3 className="font-semibold text-green-800">Podsumowanie</h3>
              <ul className="mt-2 space-y-1 text-green-700">
                <li>Łącznie: {summary.total}</li>
                <li>Sukces: {summary.success}</li>
                <li>Błędy: {summary.error}</li>
              </ul>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Wyniki</h3>
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.productId}
                    className={`p-4 rounded-md ${result.status === "success" ? "bg-green-50" : "bg-red-50"}`}
                  >
                    <h4 className="font-semibold">Product ID: {result.productId}</h4>
                    {result.status === "success" ? (
                      <div className="mt-2 space-y-2">
                        <div>
                          <h5 className="font-medium">Krótki opis:</h5>
                          <p className="text-sm">{result.data?.shortDescription}</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Długi opis:</h5>
                          <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{
                              __html: result.data?.longDescription || "",
                            }}
                          />
                        </div>
                        <div>
                          <h5 className="font-medium">Meta opis:</h5>
                          <p className="text-sm">{result.data?.metaDescription}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-red-600 mt-2">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cost Estimate Dialog */}
      <CostEstimateDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        estimate={estimate}
        onConfirm={handleConfirmAndGenerate}
        isCalculating={isCalculating}
        isStartingJob={isGenerating}
        error={estimateError}
      />
    </div>
  );
}
