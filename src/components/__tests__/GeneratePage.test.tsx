import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GeneratePage } from "../GeneratePage";
import * as useGenerateModule from "@/components/hooks/useGenerate";
import * as useCostEstimateModule from "@/components/hooks/useCostEstimate";

// Mock child components
vi.mock("../StyleSelectCards", () => ({
  StyleSelectCards: ({ selected, onSelect }: { selected: string; onSelect: (style: string) => void }) => (
    <div data-testid="style-select-cards">
      <div>Selected style: {selected}</div>
      <button onClick={() => onSelect("casual")}>Select Casual</button>
      <button onClick={() => onSelect("professional")}>Select Professional</button>
      <button onClick={() => onSelect("sales-focused")}>Select Sales-focused</button>
    </div>
  ),
}));

vi.mock("../LanguageSelect", () => ({
  LanguageSelect: ({ selected, onSelect }: { selected: string; onSelect: (lang: string) => void }) => (
    <div data-testid="language-select">
      <div>Selected language: {selected}</div>
      <button onClick={() => onSelect("en")}>Select English</button>
      <button onClick={() => onSelect("pl")}>Select Polish</button>
    </div>
  ),
}));

vi.mock("../ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="generate-button">
      {children}
    </button>
  ),
}));

vi.mock("../ui/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress" role="progressbar" aria-valuenow={value}>
      Progress: {value}%
    </div>
  ),
}));

describe("GeneratePage", () => {
  const mockGenerate = vi.fn();

  const defaultHookReturn = {
    generate: mockGenerate,
    isGenerating: false,
    progress: 0,
    results: [],
    summary: null,
    error: null,
  };

  const defaultCostEstimateReturn = {
    estimate: null,
    isCalculating: false,
    error: null,
    availableModels: [
      {
        model: "openai/gpt-4o-mini",
        inputCost: 0.15,
        outputCost: 0.60,
        speed: "fast",
        description: "Szybki i ekonomiczny model",
        recommended: true,
      },
      {
        model: "openai/gpt-4o",
        inputCost: 2.50,
        outputCost: 10.00,
        speed: "medium",
        description: "Najwyższa jakość",
      },
      {
        model: "anthropic/claude-3.5-sonnet",
        inputCost: 3.00,
        outputCost: 15.00,
        speed: "fast",
        description: "Bardzo szybki i naturalny",
      },
    ],
    isLoadingModels: false,
    isDialogOpen: false,
    calculate: vi.fn(),
    openDialog: vi.fn(),
    closeDialog: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    // Mock fetch for connection status check (default: connected)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isConnected: true }),
    });

    // Default mock for useCostEstimate
    vi.spyOn(useCostEstimateModule, "useCostEstimate").mockReturnValue(defaultCostEstimateReturn);
  });

  describe("Initial Render", () => {
    it("should render page title and selected products count", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1", "prod-2", "prod-3"]} />);

      expect(screen.getByText("Generowanie opisów produktów")).toBeInTheDocument();
      expect(screen.getByText("Wybrane produkty: 3")).toBeInTheDocument();
    });

    it("should render style selection section", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Styl komunikacji")).toBeInTheDocument();
      expect(screen.getByTestId("style-select-cards")).toBeInTheDocument();
    });

    it("should render language selection section", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Język")).toBeInTheDocument();
      expect(screen.getByTestId("language-select")).toBeInTheDocument();
    });

    it("should render generate button", async () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByTestId("generate-button")).toBeInTheDocument();

      // Wait for connection check to complete
      await waitFor(() => {
        expect(screen.getByText("Oblicz koszt i rozpocznij generowanie")).toBeInTheDocument();
      });
    });

    it("should have default style as professional", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Selected style: professional")).toBeInTheDocument();
    });

    it("should have default language as pl", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Selected language: pl")).toBeInTheDocument();
    });
  });

  describe("Style and Language Selection", () => {
    it("should update selected style when user changes it", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const casualButton = screen.getByRole("button", {
        name: /select casual/i,
      });
      fireEvent.click(casualButton);

      expect(screen.getByText("Selected style: casual")).toBeInTheDocument();
    });

    it("should update selected language when user changes it", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const englishButton = screen.getByRole("button", {
        name: /select english/i,
      });
      fireEvent.click(englishButton);

      expect(screen.getByText("Selected language: en")).toBeInTheDocument();
    });
  });

  describe("Generate Button", () => {
    it("should be disabled when no products are selected", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={[]} />);

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("should be disabled when generation is in progress", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        isGenerating: true,
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("should be enabled when products are selected and not generating", async () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      // Wait for connection check to complete
      await waitFor(
        () => {
          const button = screen.getByTestId("generate-button");
          expect(button).not.toBeDisabled();
        },
        { timeout: 3000 }
      );
    });

    it("should open cost dialog when clicked", async () => {
      const mockCalculate = vi.fn();
      const mockOpenDialog = vi.fn();

      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);
      vi.spyOn(useCostEstimateModule, "useCostEstimate").mockReturnValue({
        ...defaultCostEstimateReturn,
        calculate: mockCalculate,
        openDialog: mockOpenDialog,
      });

      render(<GeneratePage selectedProductIds={["prod-1", "prod-2"]} />);

      // Wait for connection check to complete
      await waitFor(() => {
        const button = screen.getByTestId("generate-button");
        expect(button).not.toBeDisabled();
      });

      const button = screen.getByTestId("generate-button");
      fireEvent.click(button);

      // Verify dialog was opened and calculation was triggered
      await waitFor(() => {
        expect(mockOpenDialog).toHaveBeenCalled();
        expect(mockCalculate).toHaveBeenCalled();
      });
    });

    it("should send updated style and language to cost calculation", async () => {
      const mockCalculate = vi.fn();

      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);
      vi.spyOn(useCostEstimateModule, "useCostEstimate").mockReturnValue({
        ...defaultCostEstimateReturn,
        calculate: mockCalculate,
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      // Wait for connection check to complete
      await waitFor(() => {
        const button = screen.getByTestId("generate-button");
        expect(button).not.toBeDisabled();
      });

      // Change style to casual
      const casualButton = screen.getByRole("button", {
        name: /select casual/i,
      });
      fireEvent.click(casualButton);

      // Change language to English
      const englishButton = screen.getByRole("button", {
        name: /select english/i,
      });
      fireEvent.click(englishButton);

      // Click generate
      const generateButton = screen.getByTestId("generate-button");
      fireEvent.click(generateButton);

      // Verify calculate was called with updated style and language
      await waitFor(() => {
        expect(mockCalculate).toHaveBeenCalledWith(
          expect.objectContaining({
            style: "casual",
            language: "en",
          })
        );
      });
    });

    it('should show "Kalkulowanie kosztów..." text when calculating', async () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        isGenerating: false,
      });

      vi.spyOn(useCostEstimateModule, "useCostEstimate").mockReturnValue({
        ...defaultCostEstimateReturn,
        isCalculating: true,
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      // Wait for connection check to complete
      await waitFor(() => {
        const button = screen.getByTestId("generate-button");
        expect(button).toHaveTextContent(/kalkulowanie kosztów/i);
      });
    });
  });

  describe("Progress Display", () => {
    it("should not show progress when not generating", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.queryByTestId("progress")).not.toBeInTheDocument();
    });

    it("should show progress when generating", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        isGenerating: true,
        progress: 45,
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByTestId("progress")).toBeInTheDocument();
      expect(screen.getByText("Generowanie opisów... 45%")).toBeInTheDocument();
    });
  });

  describe("Error Display", () => {
    it("should not show error when there is no error", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.queryByText(/failed to/i)).not.toBeInTheDocument();
    });

    it("should show error message when generation fails", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        error: "Failed to generate descriptions",
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Failed to generate descriptions")).toBeInTheDocument();
    });

    it("should apply correct styling to error message", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        error: "API Error",
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const errorDiv = screen.getByText("API Error");
      expect(errorDiv).toHaveClass("p-4", "bg-red-50", "text-red-600", "rounded-md");
    });
  });

  describe("Summary Display", () => {
    it("should not show summary when there is no summary", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.queryByText("Podsumowanie")).not.toBeInTheDocument();
    });

    it("should show summary when generation is complete", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        summary: {
          total: 10,
          success: 8,
          error: 2,
        },
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Podsumowanie")).toBeInTheDocument();
      expect(screen.getByText("Łącznie: 10")).toBeInTheDocument();
      expect(screen.getByText("Sukces: 8")).toBeInTheDocument();
      expect(screen.getByText("Błędy: 2")).toBeInTheDocument();
    });
  });

  describe("Results Display", () => {
    it("should not show results when there are no results", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.queryByText("Wyniki")).not.toBeInTheDocument();
    });

    it("should show results section when results are available", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-1",
            status: "success",
            data: {
              shortDescription: "Short desc",
              longDescription: "<p>Long desc</p>",
              metaDescription: "Meta desc",
            },
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      expect(screen.getByText("Wyniki")).toBeInTheDocument();
    });

    it("should display successful result correctly", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-123",
            status: "success",
            data: {
              shortDescription: "Amazing product",
              longDescription: "<p>This is a detailed description</p>",
              metaDescription: "Buy this product now",
            },
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-123"]} />);

      expect(screen.getByText("Product ID: prod-123")).toBeInTheDocument();
      expect(screen.getByText("Krótki opis:")).toBeInTheDocument();
      expect(screen.getByText("Amazing product")).toBeInTheDocument();
      expect(screen.getByText("Długi opis:")).toBeInTheDocument();
      expect(screen.getByText("Meta opis:")).toBeInTheDocument();
      expect(screen.getByText("Buy this product now")).toBeInTheDocument();
    });

    it("should display failed result correctly", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-456",
            status: "error",
            error: "Product not found",
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-456"]} />);

      expect(screen.getByText("Product ID: prod-456")).toBeInTheDocument();
      expect(screen.getByText("Product not found")).toBeInTheDocument();
    });

    it("should display multiple results", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-1",
            status: "success",
            data: {
              shortDescription: "Product 1",
              longDescription: "<p>Desc 1</p>",
              metaDescription: "Meta 1",
            },
          },
          {
            productId: "prod-2",
            status: "error",
            error: "Failed for product 2",
          },
          {
            productId: "prod-3",
            status: "success",
            data: {
              shortDescription: "Product 3",
              longDescription: "<p>Desc 3</p>",
              metaDescription: "Meta 3",
            },
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-1", "prod-2", "prod-3"]} />);

      expect(screen.getByText("Product ID: prod-1")).toBeInTheDocument();
      expect(screen.getByText("Product ID: prod-2")).toBeInTheDocument();
      expect(screen.getByText("Product ID: prod-3")).toBeInTheDocument();
      expect(screen.getByText("Failed for product 2")).toBeInTheDocument();
    });

    it("should apply correct styling to success results", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-1",
            status: "success",
            data: {
              shortDescription: "Test",
              longDescription: "<p>Test</p>",
              metaDescription: "Test",
            },
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const resultDiv = screen.getByText("Product ID: prod-1").parentElement;
      expect(resultDiv).toHaveClass("bg-green-50");
    });

    it("should apply correct styling to error results", () => {
      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue({
        ...defaultHookReturn,
        results: [
          {
            productId: "prod-1",
            status: "error",
            error: "Error message",
          },
        ],
      });

      render(<GeneratePage selectedProductIds={["prod-1"]} />);

      const resultDiv = screen.getByText("Product ID: prod-1").parentElement;
      expect(resultDiv).toHaveClass("bg-red-50");
    });
  });

  describe("Integration", () => {
    it("should handle complete cost calculation and job creation flow", async () => {
      const mockCalculate = vi.fn();
      const mockOpenDialog = vi.fn();

      vi.spyOn(useGenerateModule, "useGenerate").mockReturnValue(defaultHookReturn);
      vi.spyOn(useCostEstimateModule, "useCostEstimate").mockReturnValue({
        ...defaultCostEstimateReturn,
        calculate: mockCalculate,
        openDialog: mockOpenDialog,
      });

      render(<GeneratePage selectedProductIds={["prod-1", "prod-2"]} />);

      // Wait for connection check
      await waitFor(() => {
        expect(screen.getByText("Oblicz koszt i rozpocznij generowanie")).toBeInTheDocument();
      });

      // Click calculate cost button
      const button = screen.getByTestId("generate-button");
      fireEvent.click(button);

      // Verify dialog was opened and calculate was triggered
      await waitFor(() => {
        expect(mockOpenDialog).toHaveBeenCalled();
        expect(mockCalculate).toHaveBeenCalledWith(
          expect.objectContaining({
            productIds: ["prod-1", "prod-2"],
          })
        );
      });
    });
  });
});
