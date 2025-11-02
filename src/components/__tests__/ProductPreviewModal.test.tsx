import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ProductPreviewModal } from "../ProductPreviewModal";
import { useProductDetail } from "../hooks/useProductDetail";

// Mock the hook
vi.mock("../hooks/useProductDetail", () => ({
  useProductDetail: vi.fn(),
}));

describe("ProductPreviewModal", () => {
  const mockProduct = {
    id: "1",
    name: "Test Product",
    shortDescription: "Short description",
    longDescription: "Long description",
    categories: [
      { id: "1", name: "Category 1" },
      { id: "2", name: "Category 2" },
    ],
    collections: [{ id: "1", name: "Collection 1" }],
    createdAt: "2025-10-15T12:00:00Z",
    lastSyncedAt: "2025-10-15T13:00:00Z",
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProductDetail).mockReturnValue({
      product: mockProduct,
      loading: false,
      error: undefined,
    });
  });

  describe("Rendering", () => {
    it("should not render when productId is null", () => {
      render(<ProductPreviewModal productId={null} onClose={mockOnClose} />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should render loading state", () => {
      vi.mocked(useProductDetail).mockReturnValue({
        product: undefined,
        loading: true,
        error: undefined,
      });

      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);
      // There are multiple elements with "Ładowanie" - title and description
      expect(screen.getAllByText(/Ładowanie/i).length).toBeGreaterThan(0);
    });

    it("should render error state", () => {
      vi.mocked(useProductDetail).mockReturnValue({
        product: undefined,
        loading: false,
        error: new Error("Test error"),
      });

      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);
      // Error message is shown, look for the actual error text
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("should render product details", () => {
      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
      expect(screen.getByText(/Kategorie \(2\)/)).toBeInTheDocument();
      expect(screen.getByText(/Kolekcje \(1\)/)).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      // The dialog has a close button with X icon, look for it by its aria-label or data attribute
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it("should expand/collapse accordion sections", async () => {
      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      // Click on "Krótki opis" section
      const shortDescButton = screen.getByText("Krótki opis");
      fireEvent.click(shortDescButton);

      // The content is rendered via dangerouslySetInnerHTML, check if it exists in the DOM
      await waitFor(() => {
        const content = screen.getByText(/short description/i);
        expect(content).toBeInTheDocument();
      });
    });
  });

  describe("Content Sanitization", () => {
    it("should sanitize HTML content", () => {
      const productWithHtml = {
        ...mockProduct,
        shortDescription: '<script>alert("xss")</script><p>Safe content</p>',
      };

      vi.mocked(useProductDetail).mockReturnValue({
        product: productWithHtml,
        loading: false,
        error: undefined,
      });

      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      const shortDescButton = screen.getByText("Krótki opis");
      fireEvent.click(shortDescButton);

      expect(screen.getByText("Safe content")).toBeInTheDocument();
      expect(screen.queryByText('alert("xss")')).not.toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates correctly", () => {
      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      // Note: Actual format will depend on the locale settings - use getAllByText for date that appears twice
      const dateElements = screen.getAllByText(/15 paź 2025/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it("should handle missing dates", () => {
      const productWithoutDates = {
        ...mockProduct,
        createdAt: null,
        lastSyncedAt: null,
      };

      vi.mocked(useProductDetail).mockReturnValue({
        product: productWithoutDates,
        loading: false,
        error: undefined,
      });

      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);
      // Dates are rendered as part of text like "Utworzono: -"
      expect(screen.getByText(/Utworzono:.*-/)).toBeInTheDocument();
      expect(screen.getByText(/Ostatnia synchronizacja:.*-/)).toBeInTheDocument();
    });
  });

  describe("Lists Rendering", () => {
    it("should render empty states for categories and collections", async () => {
      const productWithoutLists = {
        ...mockProduct,
        categories: [],
        collections: [],
      };

      vi.mocked(useProductDetail).mockReturnValue({
        product: productWithoutLists,
        loading: false,
        error: undefined,
      });

      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      expect(screen.getByText("Kategorie (0)")).toBeInTheDocument();
      expect(screen.getByText("Kolekcje (0)")).toBeInTheDocument();

      // Click to expand the accordion to see empty state messages
      const categoriesButton = screen.getByText("Kategorie (0)");
      fireEvent.click(categoriesButton);

      await waitFor(() => {
        expect(screen.getByText("Brak kategorii")).toBeInTheDocument();
      });

      const collectionsButton = screen.getByText("Kolekcje (0)");
      fireEvent.click(collectionsButton);

      await waitFor(() => {
        expect(screen.getByText("Brak kolekcji")).toBeInTheDocument();
      });
    });

    it("should render all categories and collections", async () => {
      render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

      // Click to expand categories accordion
      const categoriesButton = screen.getByText("Kategorie (2)");
      fireEvent.click(categoriesButton);

      await waitFor(() => {
        expect(screen.getByText("Category 1")).toBeInTheDocument();
        expect(screen.getByText("Category 2")).toBeInTheDocument();
      });

      // Click to expand collections accordion
      const collectionsButton = screen.getByText("Kolekcje (1)");
      fireEvent.click(collectionsButton);

      await waitFor(() => {
        expect(screen.getByText("Collection 1")).toBeInTheDocument();
      });
    });
  });
});
