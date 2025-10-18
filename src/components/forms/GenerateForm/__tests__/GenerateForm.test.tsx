import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GenerateForm } from "../index";
import { vi } from "vitest";

// Mock useGenerate hook
vi.mock("@/components/hooks/useGenerate", () => ({
  useGenerate: () => ({
    generate: vi.fn(),
    isGenerating: false,
    progress: 0,
  }),
}));

describe("GenerateForm", () => {
  const mockSelectedProductIds = ["1", "2", "3"];
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial values", () => {
    render(
      <GenerateForm selectedProductIds={mockSelectedProductIds} onSuccess={mockOnSuccess} onError={mockOnError} />
    );

    expect(screen.getByText(/generowanie opisów produktów/i)).toBeInTheDocument();
    expect(screen.getByText(/wybrane produkty: 3/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generuj opisy/i })).toBeEnabled();
  });

  it("disables submit button when no products selected", () => {
    render(<GenerateForm selectedProductIds={[]} onSuccess={mockOnSuccess} onError={mockOnError} />);

    expect(screen.getByRole("button", { name: /generuj opisy/i })).toBeDisabled();
  });

  it("shows progress bar when generating", () => {
    vi.mocked(useGenerate).mockReturnValue({
      generate: vi.fn(),
      isGenerating: true,
      progress: 50,
    });

    render(
      <GenerateForm selectedProductIds={mockSelectedProductIds} onSuccess={mockOnSuccess} onError={mockOnError} />
    );

    expect(screen.getByText(/generowanie opisów... 50%/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generowanie.../i })).toBeDisabled();
  });

  it("displays results when generation is successful", async () => {
    const mockResults = [
      {
        productId: "1",
        status: "success",
        data: {
          shortDescription: "Short desc",
          longDescription: "Long desc",
          metaDescription: "Meta desc",
        },
      },
    ];

    vi.mocked(useGenerate).mockReturnValue({
      generate: vi.fn().mockResolvedValue({
        results: mockResults,
        summary: { total: 1, success: 1, error: 0 },
      }),
      isGenerating: false,
      progress: 100,
    });

    render(
      <GenerateForm selectedProductIds={mockSelectedProductIds} onSuccess={mockOnSuccess} onError={mockOnError} />
    );

    const submitButton = screen.getByRole("button", { name: /generuj opisy/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/short desc/i)).toBeInTheDocument();
      expect(screen.getByText(/long desc/i)).toBeInTheDocument();
      expect(screen.getByText(/meta desc/i)).toBeInTheDocument();
    });
  });

  it("displays error message when generation fails", async () => {
    const mockError = new Error("Test error");

    vi.mocked(useGenerate).mockReturnValue({
      generate: vi.fn().mockRejectedValue(mockError),
      isGenerating: false,
      progress: 0,
    });

    render(
      <GenerateForm selectedProductIds={mockSelectedProductIds} onSuccess={mockOnSuccess} onError={mockOnError} />
    );

    const submitButton = screen.getByRole("button", { name: /generuj opisy/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/test error/i)).toBeInTheDocument();
      expect(mockOnError).toHaveBeenCalledWith(mockError);
    });
  });
});
