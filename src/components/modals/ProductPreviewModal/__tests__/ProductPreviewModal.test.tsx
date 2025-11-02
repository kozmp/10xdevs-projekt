import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ProductPreviewModal } from "../index";
import type { Product } from "../types";

// Mock useProductDetail hook
const mockUseProductDetail = vi.fn();
vi.mock("@/components/hooks/useProductDetail", () => ({
  useProductDetail: () => mockUseProductDetail(),
}));

const mockProduct: Product = {
  id: "1",
  name: "Test Product",
  sku: "TEST-123",
  status: "published",
  shortDescription: "<p>Short description</p>",
  longDescription: "<p>Long description</p>",
  categories: [{ id: "1", name: "Category 1" }],
  collections: [{ id: "1", name: "Collection 1" }],
  metadata: { key: "value" },
  createdAt: "2024-01-01T12:00:00Z",
  lastSyncedAt: "2024-01-02T12:00:00Z",
};

describe("ProductPreviewModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseProductDetail.mockReturnValue({
      product: null,
      loading: true,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    expect(screen.getByText("Ładowanie szczegółów produktu...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    const error = new Error("Test error");
    mockUseProductDetail.mockReturnValue({
      product: null,
      loading: false,
      error,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("renders product details", () => {
    mockUseProductDetail.mockReturnValue({
      product: mockProduct,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("SKU: TEST-123")).toBeInTheDocument();
    expect(screen.getByText("Opublikowany")).toBeInTheDocument();
  });

  it("handles close action", async () => {
    mockUseProductDetail.mockReturnValue({
      product: mockProduct,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    const closeButton = screen.getByRole("button", { name: /close/i });
    await userEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("expands accordion sections", async () => {
    mockUseProductDetail.mockReturnValue({
      product: mockProduct,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    // Expand short description
    const shortDescButton = screen.getByText("Krótki opis");
    await userEvent.click(shortDescButton);
    expect(screen.getByText("Short description")).toBeInTheDocument();

    // Expand long description
    const longDescButton = screen.getByText("Pełny opis");
    await userEvent.click(longDescButton);
    expect(screen.getByText("Long description")).toBeInTheDocument();
  });

  it("displays categories and collections", async () => {
    mockUseProductDetail.mockReturnValue({
      product: mockProduct,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    // Check categories
    const categoriesButton = screen.getByText("Kategorie (1)");
    await userEvent.click(categoriesButton);
    expect(screen.getByText("Category 1")).toBeInTheDocument();

    // Check collections
    const collectionsButton = screen.getByText("Kolekcje (1)");
    await userEvent.click(collectionsButton);
    expect(screen.getByText("Collection 1")).toBeInTheDocument();
  });

  it("displays metadata when available", async () => {
    mockUseProductDetail.mockReturnValue({
      product: mockProduct,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    const metadataButton = screen.getByText("Metadane");
    await userEvent.click(metadataButton);
    expect(screen.getByText(/"key": "value"/)).toBeInTheDocument();
  });

  it("sanitizes HTML content", async () => {
    const productWithScript = {
      ...mockProduct,
      shortDescription: '<p>Safe content</p><script>alert("xss")</script>',
    };

    mockUseProductDetail.mockReturnValue({
      product: productWithScript,
      loading: false,
      error: null,
    });

    render(<ProductPreviewModal productId="1" onClose={mockOnClose} />);

    const shortDescButton = screen.getByText("Krótki opis");
    await userEvent.click(shortDescButton);

    const content = screen.getByText("Safe content");
    expect(content).toBeInTheDocument();
    expect(content.innerHTML).not.toContain("<script>");
  });
});
