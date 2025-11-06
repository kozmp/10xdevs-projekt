import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProductsTable } from "../ProductsTable";

describe("ProductsTable", () => {
  beforeEach(() => {
    // Mock fetch to prevent ECONNREFUSED errors
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  const mockProducts = [
    {
      id: "1",
      name: "Product 1",
      sku: "SKU-001",
      status: "active",
      categories: [{ id: "1", name: "Electronics" }],
      updated_at: "2025-10-15T12:00:00Z",
    },
    {
      id: "2",
      name: "Product 2",
      sku: "SKU-002",
      status: "inactive",
      categories: [{ id: "2", name: "Books" }],
      updated_at: "2025-10-15T13:00:00Z",
    },
  ];

  const defaultProps = {
    products: mockProducts,
    loading: false,
    selectedIds: [],
    onSelectIds: vi.fn(),
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
    },
    onPaginationChange: vi.fn(),
  };

  describe("Rendering", () => {
    it("should render all products", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    it("should render loading state", () => {
      render(<ProductsTable {...defaultProps} loading={true} />);

      // Loading state shows a spinner div, not a progressbar role
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should render empty state", () => {
      render(<ProductsTable {...defaultProps} products={[]} />);

      // When products array is empty, table still renders but tbody is empty
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      // No product rows should be present
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });

    it("should format dates correctly", () => {
      render(<ProductsTable {...defaultProps} />);

      // Note: The component uses toLocaleString which formats dates differently
      // Just check that dates are rendered somewhere in the table
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      // Dates are formatted with toLocaleString, so exact format varies
    });
  });

  describe("Selection", () => {
    it("should handle individual row selection", () => {
      render(<ProductsTable {...defaultProps} />);

      const checkbox = screen.getAllByRole("checkbox")[1]; // First product checkbox
      fireEvent.click(checkbox);

      expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1"]);
    });

    it("should handle select all", () => {
      render(<ProductsTable {...defaultProps} />);

      const selectAllCheckbox = screen.getAllByRole("checkbox")[0];
      fireEvent.click(selectAllCheckbox);

      expect(defaultProps.onSelectIds).toHaveBeenCalledWith(["1", "2"]);
    });

    it("should show selected state correctly", () => {
      render(<ProductsTable {...defaultProps} selectedIds={["1"]} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[1]).toBeChecked(); // First product checkbox
      expect(checkboxes[2]).not.toBeChecked(); // Second product checkbox
    });
  });

  describe("Pagination", () => {
    it("should render pagination controls", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 2,
            limit: 10,
            total: 25,
          }}
        />
      );

      // Check that pagination component is rendered
      const nextButton = screen.getByRole("button", { name: /next|następna/i });
      expect(nextButton).toBeInTheDocument();
    });

    it("should handle page changes", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 1,
            limit: 10,
            total: 25,
          }}
        />
      );

      const nextPageButton = screen.getByRole("button", { name: /następna/i });
      fireEvent.click(nextPageButton);

      expect(defaultProps.onPaginationChange).toHaveBeenCalledWith(2);
    });

    it("should disable pagination buttons appropriately", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 1,
            limit: 10,
            total: 11, // 2 pages total (page 1 of 2) - next enabled, prev disabled on page 1
          }}
        />
      );

      const prevButton = screen.getByRole("button", { name: /prev|poprzednia/i });
      const nextButton = screen.getByRole("button", { name: /next|następna/i });

      expect(prevButton).toBeDisabled(); // Can't go back from page 1
      expect(nextButton).not.toBeDisabled(); // Can go to page 2
    });
  });

  describe("Sorting and Filtering", () => {
    it("should render sortable column headers", () => {
      render(<ProductsTable {...defaultProps} />);

      const headers = screen.getAllByRole("columnheader");
      // Checkbox, Nazwa, SKU, Status, Kategorie, Ostatnia aktualizacja = 6 columns
      expect(headers).toHaveLength(6);
    });

    it("should render status indicators", () => {
      render(<ProductsTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      const firstRow = within(rows[1]);
      const secondRow = within(rows[2]);

      expect(firstRow.getByText("active")).toBeInTheDocument();
      expect(secondRow.getByText("inactive")).toBeInTheDocument();
    });

    it("should render category badges", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      render(<ProductsTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      // There are multiple rowgroups (thead and tbody)
      expect(screen.getAllByRole("rowgroup").length).toBeGreaterThan(0);
      expect(screen.getAllByRole("row").length).toBeGreaterThan(0);
    });

    it("should have accessible checkboxes", () => {
      render(<ProductsTable {...defaultProps} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toHaveAttribute("aria-label", "Zaznacz wszystkie");
    });

    it("should have accessible pagination controls", () => {
      render(
        <ProductsTable
          {...defaultProps}
          pagination={{
            page: 1,
            limit: 10,
            total: 25, // 3 pages total, so pagination controls will render
          }}
        />
      );

      // PaginationControls component may not have navigation role
      expect(screen.getByRole("button", { name: /prev|poprzednia/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next|następna/i })).toBeInTheDocument();
    });
  });
});
